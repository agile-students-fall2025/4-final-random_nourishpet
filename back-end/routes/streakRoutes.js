// routes/streakRoutes.js

const express = require('express');
const router = express.Router();

const { logStreakMessage } = require('../controllers/streakController');
const { validateStreak } = require('../middleware/validators/activityValidators');

// POST /api/streak - No auth required for public streak sharing
router.post('/', validateStreak, logStreakMessage);

module.exports = router;
