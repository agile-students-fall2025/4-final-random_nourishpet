const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  goal: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  restrictions: {
    type: String,
    default: '',
  },
  allergies: {
    type: String,
    default: '',
  },
  budget: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  dailyCalories: {
    type: Number,
  },
  schedule: [{
    date: { type: String }, // MM/DD/YYYY
    meals: [{
      type: { type: String }, // Breakfast, Lunch, Dinner, Snack
      name: { type: String },
      calories: { type: Number },
      description: { type: String },
    }],
    totalCalories: { type: Number },
  }],
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

MealPlanSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('MealPlan', MealPlanSchema);

