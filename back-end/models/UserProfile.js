const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  profilePicture: {
    type: String,
    default: '/user.png',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserProfile', userProfileSchema);

