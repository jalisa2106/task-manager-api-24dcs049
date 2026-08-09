import { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks which specific task is performing an update/delete action

  // Fetch tasks on initial component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTask = await createTask(title, description);
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setError(null);
    setActionLoadingId(task.id);
    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError(null);
    setActionLoadingId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <span className="accent-dot"></span>
          <h1>TaskSpace</h1>
        </div>
        <p className="app-subtitle">Standalone Full-Stack Task Workspace — Practical 4</p>
      </header>

      <main className="main-content">
        {/* Error notification banner */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-message-box">
              <strong>Error:</strong> {error}
            </div>
            <button className="close-error-btn" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Task Creator Form Section */}
        <section className="form-section card glass">
          <h2>Create New Task</h2>
          <form onSubmit={handleCreateTask} className="task-form">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Optional details or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows="3"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-mini"></span> Creating...
                </>
              ) : (
                'Add Task'
              )}
            </button>
          </form>
        </section>

        {/* Task Dashboard Grid */}
        <section className="tasks-dashboard">
          <div className="dashboard-header">
            <h2>Your Board</h2>
            <span className="task-count-badge">{tasks.length} tasks</span>
          </div>

          {loading && tasks.length === 0 ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Fetching tasks from server...</p>
            </div>
          ) : error && tasks.length === 0 ? (
            <div className="empty-state card glass">
              <span className="empty-icon" style={{ color: 'var(--accent-red)' }}>⚠️</span>
              <h3>Connection Failed</h3>
              <p style={{ marginBottom: '16px' }}>Could not connect to the backend server at port 5000.</p>
              <button onClick={loadTasks} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                Retry Connection
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state card glass">
              <span className="empty-icon">📂</span>
              <h3>No tasks found</h3>
              <p>Create a task on the left to get started!</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-card card glass ${task.completed ? 'completed' : ''} ${
                    actionLoadingId === task.id ? 'performing-action' : ''
                  }`}
                >
                  <div className="task-card-header">
                    <span className="task-id"># {task.id}</span>
                    <span className={`status-pill ${task.completed ? 'done' : 'pending'}`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="task-card-body">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                  </div>

                  <div className="task-card-actions">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      disabled={actionLoadingId !== null}
                      className={`btn-action btn-toggle ${task.completed ? 'active' : ''}`}
                      title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      {task.completed ? '✓ Done' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={actionLoadingId !== null}
                      className="btn-action btn-delete"
                      title="Delete Task"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with Node.js, Express, React, and Vite</p>
      </footer>
    </div>
  );
}

export default App;
