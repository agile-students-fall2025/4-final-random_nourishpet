const express = require('express');
const router = express.Router();

const { signup, signin, logout, me } = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validators/authValidators');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.post('/logout', logout);

router.get('/me', protect, me);

module.exports = router;
