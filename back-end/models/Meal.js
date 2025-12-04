const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  date: { type: String, required: true } // MM/DD/YYYY
});

// Indexes for performance
MealSchema.index({ email: 1 });
MealSchema.index({ email: 1, date: 1 });

module.exports = mongoose.model('Meal', MealSchema);
