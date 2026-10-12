const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validateTask } = require('../middleware/validate');
const cache = require('../config/cache');
const taskEvents = require('../events/events');

const router = express.Router();

// Helper to check if cache is enabled dynamically
const isCacheEnabled = () => process.env.CACHE_ENABLED !== 'false';
// One cache entry per user, otherwise user A could be served user B's tasks
const tasksKey = (userId) => `tasks:${userId}`;

// Route-specific middleware: runs only when a route has an :id and rejects bad ID formats early
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid ID format', message: `"${id}" is not a valid task ID` });
  }
  next();
});

const pickUpdates = (body) => {
  const updates = {};
  ['title', 'description', 'completed', 'priority'].forEach((key) => {
    if (body[key] !== undefined) updates[key] = body[key];
  });
  return updates;
};

// GET /tasks - only the logged-in user's tasks
router.get('/', async (req, res, next) => {
  try {
    const key = tasksKey(req.user.id);
    const cacheActive = isCacheEnabled();

    if (cacheActive) {
      const cached = cache.get(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
    }

    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    // Store plain JSON objects (not Mongoose documents) so the cached copy is safe to reuse
    if (cacheActive) cache.set(key, tasks.map((t) => t.toJSON()));

    res.set('X-Cache', cacheActive ? 'MISS' : 'DISABLED');
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks
router.post('/', validateTask(false), async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const task = await Task.create({ title, description, priority, user: req.user.id });
    cache.del(tasksKey(req.user.id)); // invalidate after a successful write

    console.log(`[API] Response sent at ${new Date().toISOString()}`);
    res.status(201).json(task);

    // Emit AFTER responding, so the listener can never delay the API response
    taskEvents.emit('task-created', { id: task.id, title: task.title, userName: req.user.name });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id
router.put('/:id', validateTask(true), async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      pickUpdates(req.body),
      { returnDocument: 'after', runValidators: true }
    );
    if (!task) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    cache.del(tasksKey(req.user.id)); // invalidate after a successful write
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedTask) return res.status(404).json({ error: `Task with ID ${req.params.id} not found` });
    cache.del(tasksKey(req.user.id)); // invalidate after a successful write
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
    taskEvents.emit('task-deleted', { id: deletedTask.id, title: deletedTask.title, userName: req.user.name });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
