// routes/focusSessionRoutes.js

const express = require('express');
const router = express.Router();

const { logFocusSession } = require('../controllers/focusSessionController');
const { validateFocusSession } = require('../middleware/validators/focusSessionValidators');
// Note: Auth is checked in controller, not middleware, to allow userId in body for testing

// POST /api/focus-sessions
router.post('/', validateFocusSession, logFocusSession);

module.exports = router;

