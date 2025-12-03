const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  activityType: {
    type: String,
    required: true,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 1,
    max: 1440,
  },
  imageName: {
    type: String,
    default: null,
  },
  imageType: {
    type: String,
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index for performance (email already has index: true)
activitySchema.index({ email: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);

