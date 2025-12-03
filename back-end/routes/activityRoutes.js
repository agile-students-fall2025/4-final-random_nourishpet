// routes/activityRoutes.js

const express = require('express');
const router = express.Router();

const { logActivity, getActivities } = require('../controllers/activityController');
const { validateActivity } = require('../middleware/validators/activityValidators');

// POST /api/activities
router.post('/', validateActivity, logActivity);

// GET /api/activities/:email
router.get('/:email', getActivities);

module.exports = router;
