// routes/profileRoutes.js

const express = require('express');
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateUsername,
  updatePassword
} = require('../controllers/profileController');

const {
  validateProfileUpdate,
  validateUsernameUpdate
} = require('../middleware/validators/profileValidators');

// GET /api/profile/:email
router.get('/:email', getProfile);

// POST /api/profile/update
router.post('/update', validateProfileUpdate, updateProfile);

// POST /api/profile/update-username
router.post('/update-username', validateUsernameUpdate, updateUsername);

// POST /api/profile/update-password
router.post('/update-password', updatePassword);

module.exports = router;
