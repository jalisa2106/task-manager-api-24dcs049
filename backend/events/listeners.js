const taskEvents = require('./events');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

// Artificial delay so the "response first, notification later" order is easy to see.
// Set NOTIFY_DELAY_MS=0 (e.g. in tests) to switch it off.
const DELAY_MS = Number(process.env.NOTIFY_DELAY_MS ?? 2000);

taskEvents.on('task-created', async ({ title, userName }) => {
  try {
    console.log(`[EVENT] task-created handler started at ${now()}`);
    await wait(DELAY_MS); // pretend we are sending an email / push notification
    console.log(`[Notification] Task "${title}" created by ${userName} at ${now()}`);
  } catch (err) {
    taskEvents.emit('error', err); // an async listener that throws would otherwise crash Node
  }
});

taskEvents.on('task-deleted', ({ title, userName }) => {
  console.log(`[Notification] Task "${title}" deleted by ${userName} at ${now()}`);
});

// Without an 'error' listener, emit('error') throws and crashes the process
taskEvents.on('error', (err) => {
  console.error(`[EVENT ERROR] ${err.message}`);
});
