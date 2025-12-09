// routes/mealPlanRoutes.js

const express = require('express');
const router = express.Router();
const { generateMealPlan, getMealPlan } = require('../controllers/mealPlanController');

// POST /api/meal-plans/generate
router.post('/generate', generateMealPlan);

// GET /api/meal-plans/:email
router.get('/:email', getMealPlan);

module.exports = router;

