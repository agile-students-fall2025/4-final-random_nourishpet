// controllers/mealsController.js

const Meal = require('../models/Meal');

// POST /api/meals
exports.createMeal = async (req, res) => {
  try {
    const { email, name, calories, date } = req.body;

    if (!email || !name || !calories) {
      return res.status(400).json({
        success: false,
        message: 'email, meal name, and calories are required.'
      });
    }

    const meal = new Meal({
      email: email.toLowerCase(),
      name,
      calories: parseInt(calories, 10),
      date: date || new Date().toLocaleDateString('en-US')
    });

    await meal.save();

    res.status(201).json({
      success: true,
      meal
    });
  } catch (error) {
    console.error('Meal POST error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/meals/:email
// Optional query parameter: ?date=MM/DD/YYYY
exports.getMeals = async (req, res) => {
  try {
    const { email } = req.params;
    const { date } = req.query;

    const query = { email: email.toLowerCase() };
    if (date) query.date = date;

    const meals = await Meal.find(query).sort({ _id: -1 });

    res.json({
      success: true,
      meals
    });
  } catch (error) {
    console.error('Meal GET error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
