// routes/biometricsRoutes.js

const express = require('express');
const router = express.Router();

const {
  updateBiometrics,
  getBiometrics
} = require('../controllers/biometricsController');

const { validateBiometrics } = require('../middleware/validators/biometricsValidators');

// POST /api/biometrics/update
router.post('/update', validateBiometrics, updateBiometrics);

// GET /api/biometrics/:email
router.get('/:email', getBiometrics);

module.exports = router;
