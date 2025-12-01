const { body, validationResult } = require('express-validator');

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Check if it's a signup with missing required fields
    const missingFields = ['firstName', 'lastName', 'username', 'email', 'dateOfBirth', 'password', 'confirmPassword'];
    const hasMissingRequired = missingFields.some(field => 
      errors.array().some(err => err.path === field && err.msg.includes('required'))
    );
    
    if (hasMissingRequired && req.path === '/api/auth/signup') {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if it's a signin with missing email or password
    if (req.path === '/api/auth/signin') {
      const hasMissingEmail = errors.array().some(err => err.path === 'email' && err.msg.includes('required'));
      const hasMissingPassword = errors.array().some(err => err.path === 'password' && err.msg.includes('required'));
      if (hasMissingEmail || hasMissingPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
    }
    
    // For other validation errors, return the first error message
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg
    });
  }
  next();
};

// Signup validation rules
const validateSignup = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('dateOfBirth')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Signin validation rules
const validateSignin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateSignin
};

