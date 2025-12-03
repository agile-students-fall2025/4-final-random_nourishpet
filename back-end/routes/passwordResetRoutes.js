// routes/passwordResetRoutes.js

const express = require('express');
const router = express.Router();

const {
  requestPasswordReset,
  resetPassword
} = require('../controllers/passwordResetController');

// POST /api/auth/forgot-password
router.post('/forgot-password', requestPasswordReset);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
