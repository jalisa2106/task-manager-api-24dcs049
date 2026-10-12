const EventEmitter = require('events');

class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents(); // one shared instance for the whole app
