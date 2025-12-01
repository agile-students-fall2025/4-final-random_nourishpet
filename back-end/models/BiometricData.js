const mongoose = require('mongoose');

const biometricDataSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  heightCm: {
    type: Number,
    min: 0,
  },
  weightLbs: {
    type: Number,
    min: 0,
  },
  bmi: {
    type: Number,
    min: 0,
  },
  ethnicity: {
    type: String,
    default: '',
    trim: true,
  },
  ethnicityOther: {
    type: String,
    default: '',
    trim: true,
  },
  sex: {
    type: String,
    default: '',
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  bmiSource: {
    type: String,
    default: 'groq',
  },
  lastCalculatedAt: {
    type: Date,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('BiometricData', biometricDataSchema);

