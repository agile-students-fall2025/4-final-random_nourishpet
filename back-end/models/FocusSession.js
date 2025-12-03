const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  durationInSeconds: {
    type: Number,
    required: true,
    min: 1,
  },
  endedReason: {
    type: String,
    default: null,
    trim: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for querying by user
focusSessionSchema.index({ userId: 1, startedAt: -1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);

