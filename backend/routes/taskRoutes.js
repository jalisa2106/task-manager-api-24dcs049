const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validateTask } = require('../middleware/validate');

const router = express.Router();

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
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
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
    res.status(201).json(task);
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
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
