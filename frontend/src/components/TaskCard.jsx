import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, onView }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'badge badge-completed';
      case 'in-progress': return 'badge badge-progress';
      case 'pending': return 'badge badge-pending';
      default: return 'badge';
    }
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : 'No due date';

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title" onClick={() => onView(task)}>{task.title}</h3>
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
      </div>
      <p className="task-desc">{task.description || 'No description provided.'}</p>
      
      <div className="task-card-meta">
        <span className={getStatusClass(task.status)}>{task.status}</span>
        <small className="task-due">Due: {formattedDate}</small>
      </div>

      <div className="task-card-actions">
        <button className="btn btn-sm btn-info" onClick={() => onView(task)}>View</button>
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(task._id)}>Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;