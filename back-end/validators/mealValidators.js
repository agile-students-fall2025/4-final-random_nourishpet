const { body, validationResult } = require('express-validator');

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Meal creation validation rules
const validateMeal = [
  body('userEmail')
    .trim()
    .notEmpty()
    .withMessage('User email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Meal name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Meal name must be between 1 and 200 characters'),
  
  body('calories')
    .notEmpty()
    .withMessage('Calories are required')
    .isInt({ min: 0, max: 10000 })
    .withMessage('Calories must be a number between 0 and 10000')
    .toInt(),
  
  body('date')
    .optional()
    .trim()
    .matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    .withMessage('Date must be in MM/DD/YYYY format'),
  
  handleValidationErrors
];

module.exports = {
  validateMeal
};

