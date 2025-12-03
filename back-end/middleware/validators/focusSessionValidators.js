const { body, validationResult } = require('express-validator');

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Get the first error message for the response
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg || 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Focus session validation rules
const validateFocusSession = [
  body('durationInSeconds')
    .notEmpty()
    .withMessage('durationInSeconds is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be greater than zero'),
  
  body('endedReason')
    .optional()
    .isString()
    .withMessage('Invalid type for endedReason'),
  
  body('userId')
    .optional()
    .trim()
    .isString()
    .withMessage('userId must be a string'),
  
  handleValidationErrors
];

module.exports = {
  validateFocusSession
};

