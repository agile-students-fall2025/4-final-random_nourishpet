// controllers/authController.js

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const PetData = require('../models/PetData');
const StreakData = require('../models/StreakData');
const generateToken = require('../utils/generateToken');

// Helper to determine if request is secure (HTTPS)
const isSecure = (req) => {
  // Check X-Forwarded-Proto header (set by nginx/proxy)
  if (req.headers['x-forwarded-proto'] === 'https') {
    return true;
  }
  // Check if connection is secure
  return req.secure || req.protocol === 'https';
};

// Helper to create JWT, set cookie, and send response
const sendAuthResponse = (req, res, user, message = 'Authentication successful') => {
  const token = generateToken(user);

  // Cookie configuration optimized for Chromium compatibility on HTTP
  const cookieOptions = {
    httpOnly: true,
    secure: false, // Must be false for HTTP (Chromium requirement)
    sameSite: 'lax', // Works for same-site requests
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - persist across sessions
    path: '/', // Explicitly set path
  };

  console.log('Setting JWT cookie with options:', cookieOptions);
  res.cookie('jwt', token, cookieOptions);

  return res.status(200).json({
    success: true,
    message,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, username, email, dateOfBirth, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !username || !email || !dateOfBirth || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const loweredEmail = email.toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: loweredEmail }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create base user
    const newUser = new User({
      username,
      email: loweredEmail,
      password: hashedPassword,
    });

    await newUser.save();

    // Initialize related records
    await UserProfile.create({
      email: loweredEmail,
      firstName,
      lastName,
      dateOfBirth,
      username,
      bio: '',
      profilePicture: '/user.png',
    });

    await PetData.create({
      email: loweredEmail,
      petImage: '/dog.png',
      petName: 'Buddy',
      petType: 'dog',
      happiness: 100,
      health: 100,
    });

    await StreakData.create({
      email: loweredEmail,
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
    });

    // Set cookie + send response
    const token = generateToken(newUser);

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    console.log('Setting JWT cookie on signup with options:', cookieOptions);
    res.cookie('jwt', token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// POST /api/auth/signin
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const loweredEmail = email.toLowerCase();
    const user = await User.findOne({ email: loweredEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Set cookie + send response
    return sendAuthResponse(req, res, user, 'Sign in successful');
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  console.log('JWT cookie cleared on logout');
  
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// GET /api/auth/me
exports.me = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};
