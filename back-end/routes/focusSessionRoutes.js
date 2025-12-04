// routes/focusSessionRoutes.js

const express = require('express');
const router = express.Router();

const { logFocusSession } = require('../controllers/focusSessionController');
const { validateFocusSession } = require('../middleware/validators/focusSessionValidators');

// POST /api/focus-sessions
// Note: Auth is handled by protect middleware in server.js
router.post('/', validateFocusSession, logFocusSession);

module.exports = router;

