import React from 'react';

const TaskFilters = ({ filters, onFilterChange, onSearchSubmit, onReset }) => {
  return (
    <div className="filters-container">
      <form onSubmit={onSearchSubmit} className="search-form">
        <input
          type="text"
          name="search"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input-field"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="filter-dropdowns">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="select-field"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="select-field"
        >
          <option value="">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <button className="btn btn-outline" onClick={onReset}>Clear Filters</button>
      </div>
    </div>
  );
};

export default TaskFilters;