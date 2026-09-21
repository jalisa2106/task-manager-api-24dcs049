require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to backend/.env (see .env.example).');
  process.exit(1);
}

// Never print the connection string: it contains the database password
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log(`MongoDB connected (database: ${mongoose.connection.name})`))
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
