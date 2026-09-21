const maxLogs = 10;
const requestLogs = [];

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  requestLogs.push({ method: req.method, url: req.url, timestamp });
  if (requestLogs.length > maxLogs) requestLogs.shift();
  next();
}

module.exports = logger;
module.exports.requestLogs = requestLogs;
