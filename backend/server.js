require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// ---- Database connection (never print the connection string: it contains the password)
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';
mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log(`MongoDB connected (database: ${mongoose.connection.name})`))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ---- Request log buffer
const maxLogs = 10;
const requestLogs = [];

// 1. Request logging middleware at the top of the pipeline
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  requestLogs.push({ method: req.method, url: req.url, timestamp });
  if (requestLogs.length > maxLogs) requestLogs.shift();
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

// ---- Routes

// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /logs - Retrieve the last 10 request logs
app.get('/logs', (req, res) => res.status(200).json(requestLogs));

// Practical 5 (assignment): GET one task, 404 if it does not exist
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority } = req.body || {};
    const task = new Task({ title, description, priority });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update an existing task by ID (uses findByIdAndUpdate per P5 rubric)
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (body.completed !== undefined && typeof body.completed !== 'boolean') {
      return res.status(400).json({ error: 'Validation Error', message: 'Completed must be a boolean' });
    }
    const updates = {};
    ['title', 'description', 'completed', 'priority'].forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: 'after',
      runValidators: true
    });
    if (!task) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    next(error);
  }
});

// A test endpoint to trigger an error for global error handler verification
app.get('/trigger-error', (req, res, next) => {
  next(new Error('Simulated server error for testing the global error handler'));
});

// ---- 404 + global error handler (must stay LAST)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error occurred in pipeline:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation Error', message: messages.join(', ') });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format', message: `Invalid value for field ${err.path}` });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON', message: 'Request body is not valid JSON' });
  }
  // Never send err.message / err.stack for unexpected errors
  res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong on the server' });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
