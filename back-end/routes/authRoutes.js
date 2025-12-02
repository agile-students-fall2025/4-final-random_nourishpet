// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const { signup, signin } = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validators/authValidators');

// POST /api/auth/signup
router.post('/signup', validateSignup, signup);

// POST /api/auth/signin
router.post('/signin', validateSignin, signin);

module.exports = router;
