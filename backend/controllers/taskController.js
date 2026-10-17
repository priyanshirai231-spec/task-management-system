const Task = require('../models/Task');
const { redisClient } = require('../config/redis');
const { clearUserTaskCache } = require('../utils/cacheUtils');
const { validationResult } = require('express-validator');

const CACHE_TTL = parseInt(process.env.REDIS_TTL, 10) || 300; // 5 minutes default

// @desc    Get all user tasks with pagination, filtering & search
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    // Cache key incorporates all query parameters unique to this user
    const cacheKey = `tasks:${userId}:p${parsedPage}:l${parsedLimit}:s${status || 'all'}:pr${priority || 'all'}:q${search || ''}:sb${sortBy}:o${order}`;

    // 1. Try reading from Redis Cache
    if (redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.status(200).json({
            success: true,
            source: 'cache',
            ...JSON.parse(cachedData)
          });
        }
      } catch (cacheErr) {
        console.error('[Redis Read Error]:', cacheErr.message);
      }
    }

    // 2. Build MongoDB Query
    const query = { user: req.user._id };

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      query.status = status;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      query.priority = priority;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(),$options: 'i' } },
        { description: { $regex: search.trim(),$options: 'i' } }
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [tasks, totalTasks] = await Promise.all([
      Task.find(query).sort(sortOptions).skip(skip).limit(parsedLimit),
      Task.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalTasks / parsedLimit) || 1;
    const responsePayload = {
      count: tasks.length,
      totalTasks,
      totalPages,
      currentPage: parsedPage,
      tasks
    };

    // 3. Store result in Redis Cache
    if (redisClient.isReady) {
      try {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(responsePayload));
      } catch (cacheSetErr) {
        console.error('[Redis Write Error]:', cacheSetErr.message);
      }
    }

    res.status(200).json({
      success: true,
      source: 'database',
      ...responsePayload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const taskId = req.params.id;
    const cacheKey = `task:${userId}:${taskId}`;

    if (redisClient.isReady) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          task: JSON.parse(cached)
        });
      }
    }

    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(task));
    }

    res.status(200).json({
      success: true,
      source: 'database',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    // Invalidate user's Redis cache
    await clearUserTaskCache(req.user._id.toString());

    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    const { title, description, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    // Invalidate relevant Redis cache
    await clearUserTaskCache(req.user._id.toString());

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }

    // Invalidate user cache
    await clearUserTaskCache(req.user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};