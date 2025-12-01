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
  body('height')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Height must be at most 50 characters'),
  
  body('weight')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Weight must be at most 50 characters'),
  
  body('bmi')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('BMI must be at most 20 characters'),
  
  body('ethnicity')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ethnicity must be at most 100 characters'),
  
  body('gender')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Gender must be at most 50 characters'),
  
  body('age')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Age must be at most 10 characters'),
  
  body()
    .custom((value) => {
      const hasField = Object.keys(value).some(key => {
        const val = value[key];
        return val !== null && val !== undefined && val !== '';
      });
      if (!hasField) {
        throw new Error('At least one biometric field must be provided');
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

