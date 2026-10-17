const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All task routes protected

router
  .route('/')
  .get(getTasks)
  .post(
    [
      body('title', 'Title is required').trim().notEmpty(),
      body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high')
    ],
    createTask
  );

router
  .route('/:id')
  .get(getTaskById)
  .put(
    [
      body('title', 'Title cannot be empty').optional().trim().notEmpty(),
      body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be pending, in-progress, or completed'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high')
    ],
    updateTask
  )
  .delete(deleteTask);

module.exports = router;