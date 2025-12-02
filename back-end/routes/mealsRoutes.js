// routes/mealsRoutes.js

const express = require('express');
const router = express.Router();

const { createMeal, getMeals } = require('../controllers/mealsController');
const { validateMeal } = require('../middleware/validators/mealValidators');

// POST /api/meals
router.post('/', validateMeal, createMeal);

// GET /api/meals/:email
router.get('/:email', getMeals);

module.exports = router;
