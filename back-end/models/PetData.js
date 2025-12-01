const mongoose = require('mongoose');

const petDataSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  petImage: {
    type: String,
    default: '/dog.png',
  },
  petName: {
    type: String,
    default: 'Buddy',
  },
  petType: {
    type: String,
    default: 'dog',
  },
  happiness: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  health: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PetData', petDataSchema);

