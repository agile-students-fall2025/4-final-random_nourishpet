// controllers/authController.js

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const PetData = require('../models/PetData');
const StreakData = require('../models/StreakData');

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, username, email, dateOfBirth, password, confirmPassword } = req.body;

    // Required fields check (kept to match original)
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

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create base user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password, // hashing added in next sprint
    });

    await newUser.save();

    // Initialize related records
    await UserProfile.create({
      email: email.toLowerCase(),
      firstName,
      lastName,
      dateOfBirth,
      username,
      bio: '',
      profilePicture: '/user.png'
    });

    await PetData.create({
      email: email.toLowerCase(),
      petImage: '/dog.png',
      petName: 'Buddy',
      petType: 'dog',
      happiness: 100,
      health: 100
    });

    await StreakData.create({
      email: email.toLowerCase(),
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
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

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
