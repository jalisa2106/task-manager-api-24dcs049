const jwt = require('jsonwebtoken');

// Verifies "Authorization: Bearer <token>" and puts the decoded payload on req.user
module.exports = function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authorization token is missing' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, name, iat, exp }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token';
    return res.status(401).json({ error: 'Unauthorized', message });
  }
};
