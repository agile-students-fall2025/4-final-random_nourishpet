// routes/activityRoutes.js

const express = require('express');
const router = express.Router();

const { logActivity } = require('../controllers/activityController');
const { validateActivity } = require('../middleware/validators/activityValidators');

// POST /api/activities
router.post('/', validateActivity, logActivity);

module.exports = router;
