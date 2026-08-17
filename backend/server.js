require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Connect to MongoDB
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';
console.log('Connecting to MongoDB URI:', uri);
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// 4. REST Endpoints

// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
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
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    // Create new task
    const newTask = new Task({
      title: title,
      description: description
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update an existing task by ID
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, completed } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

    // Update fields if provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed must be a boolean' });
      }
      task.completed = completed;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ error: `Task with ID ${taskId} not found` });
    }

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

  // Mongoose validation error handler
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: messages.join(', ')
    });
  }

  // CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: `Invalid format for field ${err.path}`
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on the server'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
