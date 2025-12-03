const mongoose = require('mongoose');

const streakMessageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StreakMessage', streakMessageSchema);

