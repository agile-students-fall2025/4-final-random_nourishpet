// routes/mainScreenRoutes.js

const express = require('express');
const router = express.Router();

const { getMainScreenData } = require('../controllers/mainScreenController');

// GET /api/main-screen/:email
router.get('/:email', getMainScreenData);

module.exports = router;
