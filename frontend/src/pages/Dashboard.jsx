import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('MongoDB Queried');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Fixed: /api/tasks
      const res = await api.get('/api/tasks');
      const taskData = Array.isArray(res.data) ? res.data : (res.data?.tasks || res.data?.data || []);
      setTasks(taskData);

      if (res.data?.source === 'cache' || res.headers['x-cache'] === 'HIT') {
        setDataSource('Redis Cache Hit');
      } else {
        setDataSource('MongoDB Queried');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      // Fixed: /api/tasks/${id}
      await api.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status?.toLowerCase() || 'pending',
        priority: task.priority?.toLowerCase() || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        // Fixed: /api/tasks/${id}
        await api.put(`/api/tasks/${editingTask._id || editingTask.id}`, formData);
      } else {
        // Fixed: /api/tasks
        await api.post('/api/tasks', formData);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // Stats Counters
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status?.toLowerCase() === 'pending').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status?.toLowerCase() === 'in progress' || t.status?.toLowerCase() === 'in-progress'
  ).length;
  const completedTasks = tasks.filter((t) => t.status?.toLowerCase() === 'completed').length;

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'All' || task.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesPriority =
      priorityFilter === 'All' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div style={styles.container}>
      {/* Top Header & Navigation Bar */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h1 style={styles.title}>Task Master</h1>
            <p style={styles.subtitle}>High-performance full stack task orchestrator</p>
          </div>
          <nav style={styles.navLinks}>
            <Link to="/dashboard" style={{ ...styles.navItem, ...styles.navActive }}>
              Dashboard
            </Link>
            <Link to="/register" style={styles.navItem}>
              Register
            </Link>
            <Link to="/login" style={styles.navItem}>
              Login
            </Link>
          </nav>
        </div>

        <div style={styles.actions}>
          <span style={dataSource.includes('Redis') ? styles.badgeRedis : styles.badgeMongo}>
            {dataSource.includes('Redis') ? '⚡ ' : '💾 '}
            {dataSource}
          </span>
          <button onClick={() => handleOpenModal()} style={styles.btnPrimary}>
            + New Task
          </button>
          <button onClick={handleLogout} style={styles.btnSecondary}>
            Logout
          </button>
        </div>
      </div>

      {/* Counters Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>TOTAL TASKS</div>
          <div style={styles.statValue}>{totalTasks}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ ...styles.statLabel, color: '#f59e0b' }}>PENDING</div>
          <div style={styles.statValue}>{pendingTasks}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #6366f1' }}>
          <div style={{ ...styles.statLabel, color: '#818cf8' }}>IN PROGRESS</div>
          <div style={styles.statValue}>{inProgressTasks}</div>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #10b981' }}>
          <div style={{ ...styles.statLabel, color: '#34d399' }}>COMPLETED</div>
          <div style={styles.statValue}>{completedTasks}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 Search tasks by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Task Cards */}
      <div style={styles.taskList}>
        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No tasks found matching criteria.</p>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id || task.id} style={styles.taskCard}>
              <div style={styles.taskCardHeader}>
                <span style={getPriorityStyle(task.priority)}>
                  {task.priority?.toUpperCase() || 'MEDIUM'}
                </span>
                <span style={styles.statusBadge}>{task.status || 'pending'}</span>
              </div>
              <h3 style={styles.taskTitle}>{task.title}</h3>
              <p style={styles.taskDesc}>{task.description}</p>
              {task.dueDate && (
                <div style={styles.taskDate}>
                  📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              <div style={styles.cardActions}>
                <button onClick={() => handleOpenModal(task)} style={styles.btnEdit}>
                  Edit
                </button>
                <button onClick={() => handleDelete(task._id || task.id)} style={styles.btnDelete}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ color: '#ffffff', marginBottom: '16px' }}>
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h2>
            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={styles.modalInput}
              />
              <textarea
                placeholder="Description"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.modalInput}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={styles.modalInput}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const getPriorityStyle = (priority) => {
  const p = priority?.toLowerCase();
  let bg = 'rgba(245, 158, 11, 0.2)';
  let color = '#fbbf24';
  if (p === 'high') {
    bg = 'rgba(239, 68, 68, 0.2)';
    color = '#f87171';
  } else if (p === 'low') {
    bg = 'rgba(16, 185, 129, 0.2)';
    color = '#34d399';
  }
  return {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: bg,
    color: color,
  };
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0d14',
    padding: '32px 48px',
    color: '#ffffff',
    fontFamily: 'Inter, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: { fontSize: '26px', fontWeight: '800', margin: 0 },
  subtitle: { color: '#9ca3af', fontSize: '13px', marginTop: '4px' },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#111827',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid #1f2937',
    marginLeft: '12px',
  },
  navItem: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  navActive: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '12px' },
  badgeMongo: {
    fontSize: '12px',
    backgroundColor: '#1e1b4b',
    color: '#818cf8',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #4338ca',
  },
  badgeRedis: {
    fontSize: '12px',
    backgroundColor: '#064e3b',
    color: '#34d399',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #059669',
  },
  btnPrimary: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    border: '1px solid #374151',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '28px',
  },
  statCard: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    padding: '20px',
  },
  statLabel: { fontSize: '11px', fontWeight: '700', color: '#9ca3af' },
  statValue: { fontSize: '32px', fontWeight: '800', marginTop: '8px' },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
  },
  searchInput: {
    flex: 2,
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#ffffff',
    outline: 'none',
  },
  select: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#ffffff',
    outline: 'none',
  },
  taskList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  taskCard: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  taskCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    fontSize: '11px',
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  taskTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
  taskDesc: { margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: '1.4' },
  taskDate: { fontSize: '12px', color: '#6b7280', marginTop: '4px' },
  cardActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '12px',
  },
  btnEdit: {
    padding: '8px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDelete: {
    padding: '8px',
    backgroundColor: '#1f2937',
    color: '#f87171',
    border: '1px solid #374151',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '12px',
    padding: '28px',
    width: '450px',
  },
  modalInput: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#ffffff',
    outline: 'none',
  },
};