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

// Activity submission validation rules
const validateActivity = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('User email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('activityType')
    .trim()
    .notEmpty()
    .withMessage('Activity type is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Activity type must be between 1 and 50 characters'),
  
  body('timeSpent')
    .trim()
    .notEmpty()
    .withMessage('Time spent is required')
    .custom((value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 1440) {
        throw new Error('Time spent must be a number between 1 and 1440 minutes');
      }
      return true;
    }),
  
  body('imageName')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Image name must be at most 255 characters'),
  
  body('imageType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Image type must be at most 100 characters'),
  
  handleValidationErrors
];

// Streak share validation rules
const validateStreak = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  
  handleValidationErrors
];

// Biometrics update validation rules
const validateBiometrics = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('height')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) {
        throw new Error('Height must be a positive number in centimeters');
      }
      return true;
    }),
  
  body('weight')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      const num = Number(value);
      if (Number.isNaN(num) || num <= 0) {
        throw new Error('Weight must be a positive number in pounds');
      }
      return true;
    }),
  
  body('ethnicity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ethnicity must be at most 100 characters'),
  
  body('ethnicityOther')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ethnicity other must be at most 100 characters'),
  
  body('sex')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sex must be at most 50 characters'),
  
  body('age')
    .optional()
    .custom((value) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 150) {
        throw new Error('Age must be a number between 0 and 150');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateActivity,
  validateStreak,
  validateBiometrics
};

