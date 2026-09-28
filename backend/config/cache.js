const NodeCache = require('node-cache');

// stdTTL = 60 seconds. Cache lives in this process's memory only.
module.exports = new NodeCache({ stdTTL: 60, checkperiod: 120 });
