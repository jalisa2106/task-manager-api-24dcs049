const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIORITIES = ['low', 'medium', 'high'];

const reject = (res, errors) =>
  res.status(400).json({ error: 'Validation Error', message: errors.join(', ') });

exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];
  if (typeof name !== 'string' || name.trim().length < 2) errors.push('Name is required (at least 2 characters)');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.push('A valid email address is required');
  if (typeof password !== 'string' || password.length < 6) errors.push('Password must be at least 6 characters');
  return errors.length ? reject(res, errors) : next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) errors.push('A valid email address is required');
  if (typeof password !== 'string' || password.length === 0) errors.push('Password is required');
  return errors.length ? reject(res, errors) : next();
};

// validateTask(false) for POST (title required), validateTask(true) for PUT (all fields optional)
exports.validateTask = (isUpdate) => (req, res, next) => {
  const { title, description, priority, completed } = req.body || {};
  const errors = [];

  if (!isUpdate || title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') errors.push('Title is required and must be a non-empty string');
    else if (title.trim().length > 100) errors.push('Title cannot be longer than 100 characters');
  }
  if (description !== undefined && typeof description !== 'string') errors.push('Description must be a string');
  if (priority !== undefined && !PRIORITIES.includes(priority)) errors.push('Priority must be low, medium or high');
  if (completed !== undefined && typeof completed !== 'boolean') errors.push('Completed must be a boolean');

  return errors.length ? reject(res, errors) : next();
};
