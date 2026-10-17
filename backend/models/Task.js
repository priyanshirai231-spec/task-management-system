const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Compound indexes for optimal search, filter & pagination queries
taskSchema.index({ user: 1, status: 1, priority: 1, createdAt: -1 });
taskSchema.index({ user: 1, title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);