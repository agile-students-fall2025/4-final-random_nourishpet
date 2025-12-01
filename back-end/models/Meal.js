const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  date: { type: String, required: true } // MM/DD/YYYY
});

module.exports = mongoose.model('Meal', MealSchema);
