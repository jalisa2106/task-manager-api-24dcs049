const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Task title cannot be longer than 100 characters']
  },
  description: { type: String, trim: true, default: '' },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: { values: ['low', 'medium', 'high'], message: 'Priority must be low, medium or high' },
    default: 'medium'
  },
  createdAt: { type: Date, default: Date.now }
});

// Practical 5 (supplementary): pre-save hook that trims the title
taskSchema.pre('save', function () {
  if (typeof this.title === 'string') this.title = this.title.trim();
});

taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Task', taskSchema);
