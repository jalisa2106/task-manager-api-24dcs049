const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// In-memory ring buffer for request logs
const maxLogs = 10;
const requestLogs = [];

// 1. Request logging middleware at the top of the pipeline
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  requestLogs.push({
    method: req.method,
    url: req.url,
    timestamp: timestamp
  });
  
  if (requestLogs.length > maxLogs) {
    requestLogs.shift();
  }
  
  next();
});

// 2. Middleware to reject POST/PUT requests missing Content-Type: application/json
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

// 3. Parse incoming JSON payloads
app.use(express.json());

// 3. In-memory storage for tasks
let tasks = [];
let nextId = 1;

// 4. REST Endpoints

// GET /tasks - Retrieve all tasks
app.get('/tasks', (req, res, next) => {
  try {
    res.status(200).json(tasks);
  } catch (error) {
    next(error); // Forward to global error handler
  }
});

// GET /logs - Retrieve the last 10 request logs
app.get('/logs', (req, res, next) => {
  try {
    res.status(200).json(requestLogs);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update an existing task by ID
app.put('/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    const { title, description, completed } = req.body;

    // Validate if title is provided but invalid
    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    // Update fields if provided
    if (title !== undefined) tasks[taskIndex].title = title.trim();
    if (description !== undefined) tasks[taskIndex].description = description.trim();
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
      }
      tasks[taskIndex].completed = completed;
    }

    res.status(200).json(tasks[taskIndex]);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    next(error);
  }
});

// A test endpoint to trigger an error for global error handler verification
app.get('/trigger-error', (req, res, next) => {
  next(new Error('This is a simulated server error for testing global error handling middleware!'));
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} not found` });
});

// 5. Global error handling middleware as the very last middleware
app.use((err, req, res, next) => {
  console.error('Error occurred in pipeline:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
