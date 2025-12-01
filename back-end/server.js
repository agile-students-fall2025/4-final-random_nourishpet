const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Database connection
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const UserProfile = require('./models/UserProfile');
const PetData = require('./models/PetData');
const StreakData = require('./models/StreakData');
const BiometricData = require('./models/BiometricData');

// Services
const { calculateBMI } = require('./services/bmiService');

// Prototype collections (in-memory) for features still under development
const meals = [];
const Meal = require('./models/Meal');

// Validators
const { validateSignup, validateSignin } = require('./validators/authValidators');
const { validateProfileUpdate, validateUsernameUpdate } = require('./validators/profileValidators');
const { validateMeal } = require('./validators/mealValidators');
const { validateActivity, validateStreak, validateBiometrics } = require('./validators/activityValidators');

const app = express();
const PORT = process.env.PORT || 3001;
const dbConnectionPromise = connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});


// ---------------------------------------------------
// Authentication routes 
// ---------------------------------------------------

// Sign Up route
app.post('/api/auth/signup', validateSignup, async (req, res) => {
  try {
    const { firstName, lastName, username, email, dateOfBirth, password, confirmPassword } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !dateOfBirth || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username }]
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password, // this will be hashed after the next sprint
    });

    await newUser.save();

    // Initialize profile data for Main Screen & Profile
    const newProfile = new UserProfile({
      email: email.toLowerCase(),
      firstName,
      lastName,
      dateOfBirth,
      username,
      bio: '',
      profilePicture: '/user.png'
    });
    await newProfile.save();

    // Initialize pet data for Main Screen
    const newPetData = new PetData({
      email: email.toLowerCase(),
      petImage: '/dog.png',
      petName: 'Buddy',
      petType: 'dog',
      happiness: 100,
      health: 100
    });
    await newPetData.save();

    // Initialize streak data for Main Screen
    const newStreakData = new StreakData({
      email: email.toLowerCase(),
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null
    });
    await newStreakData.save();

    // Return success response (without password)
    res.status(201).json({
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
      // Duplicate key error
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
});

// Sign In route
app.post('/api/auth/signin', validateSignin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password (in production, use bcrypt to compare hashes)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Return success response (without password)
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
});

// Activity submission route
app.post('/api/activities', validateActivity, (req, res) => {
  const { activityType, timeSpent, imageName, imageType } = req.body;

  console.log('Activity submission received:', {
    activityType,
    timeSpent,
    imageName: imageName || null,
    imageType: imageType || null
  });

  res.status(200).json({
    success: true,
    message: 'Activity logged successfully'
  });
});

// Streak share route
app.post('/api/streak', validateStreak, (req, res) => {
  const { message } = req.body;

  console.log('Streak share message:', message);

  res.status(200).json({
    success: true,
    message: 'Streak message logged'
  });
});

// Update biometrics route
app.post('/api/biometrics/update', validateBiometrics, async (req, res) => {
  try {
    const {
      email,
      height,
      weight,
      ethnicity,
      ethnicityOther,
      sex,
      age
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Helper utilities
    const valueProvided = (value) => !(value === undefined || value === null || (typeof value === 'string' && value.trim() === ''));
    const parseNumber = (value) => {
      if (!valueProvided(value)) {
        return undefined;
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        return undefined;
      }
      return parsed;
    };

    const heightCmInput = parseNumber(height);
    if (valueProvided(height) && heightCmInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Height must be a numeric value in centimeters'
      });
    }

    const weightLbsInput = parseNumber(weight);
    if (valueProvided(weight) && weightLbsInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a numeric value in pounds'
      });
    }

    const ageInput = parseNumber(age);
    if (valueProvided(age) && ageInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Age must be a numeric value'
      });
    }

    const existingRecord = await BiometricData.findOne({ email: normalizedEmail });

    const merged = {
      heightCm: heightCmInput ?? existingRecord?.heightCm,
      weightLbs: weightLbsInput ?? existingRecord?.weightLbs,
      ethnicity: (typeof ethnicity === 'string' && ethnicity.trim().length > 0)
        ? ethnicity.trim()
        : (existingRecord?.ethnicity || ''),
      ethnicityOther: ethnicityOther ?? existingRecord?.ethnicityOther ?? '',
      sex: (typeof sex === 'string' && sex.trim().length > 0)
        ? sex.trim()
        : (existingRecord?.sex || ''),
      age: Number.isFinite(ageInput) ? ageInput : (existingRecord?.age ?? null)
    };

    if (!merged.heightCm || !merged.weightLbs) {
      return res.status(400).json({
        success: false,
        message: 'Height (cm) and weight (lbs) are required'
      });
    }

    if (merged.ethnicity !== 'Other') {
      merged.ethnicityOther = '';
    } else {
      merged.ethnicityOther = (typeof ethnicityOther === 'string' && ethnicityOther.trim().length > 0)
        ? ethnicityOther.trim()
        : (existingRecord?.ethnicityOther || '');
    }

    const bmiResult = await calculateBMI({
      heightCm: merged.heightCm,
      weightLbs: merged.weightLbs,
      sex: merged.sex,
      age: merged.age,
      ethnicity: merged.ethnicity,
      ethnicityOther: merged.ethnicityOther,
    });

    const updatedBiometrics = await BiometricData.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          heightCm: merged.heightCm,
          weightLbs: merged.weightLbs,
          ethnicity: merged.ethnicity,
          ethnicityOther: merged.ethnicity === 'Other' ? merged.ethnicityOther : '',
          sex: merged.sex,
          age: merged.age ?? null,
          bmi: bmiResult.bmi,
          bmiSource: bmiResult.source,
          lastCalculatedAt: new Date(),
        },
        $setOnInsert: { email: normalizedEmail }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Biometric data updated',
      biometrics: updatedBiometrics,
    });
  } catch (error) {
    console.error('Update biometrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get biometrics for a user
app.get('/api/biometrics/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const biometrics = await BiometricData.findOne({ email: normalizedEmail });

    if (!biometrics) {
      return res.status(404).json({
        success: false,
        message: 'No biometrics found for this user'
      });
    }

    res.json({
      success: true,
      biometrics,
    });
  } catch (error) {
    console.error('Get biometrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get all users (for testing purposes - would not exist in production)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


// ---------------------------------------------------
// MAIN SCREEN ROUTES
// ---------------------------------------------------

// Get main screen data (user, pet, streak)
app.get('/api/main-screen/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await UserProfile.findOne({ email: email.toLowerCase() }) || {};
    const pet = await PetData.findOne({ email: email.toLowerCase() }) || {};
    const streak = await StreakData.findOne({ email: email.toLowerCase() }) || {};

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          profilePicture: profile.profilePicture || '/user.png'
        },
        pet: pet || {},
        streak: streak || {}
      }
    });
  } catch (error) {
    console.error('Get main screen error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


// ---------------------------------------------------
// PROFILE ROUTES
// ---------------------------------------------------

// Get user profile
app.get('/api/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await UserProfile.findOne({ email: email.toLowerCase() }) || {};

    res.json({
      success: true,
      profile: {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || email,
        dateOfBirth: profile.dateOfBirth || '',
        username: user.username,
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '/user.png'
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update profile
app.post('/api/profile/update', validateProfileUpdate, async (req, res) => {
  try {
    const { email, firstName, lastName, dateOfBirth, bio } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update or create profile data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (bio !== undefined) updateData.bio = bio;

    const profile = await UserProfile.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update username
app.post('/api/profile/update-username', validateUsernameUpdate, async (req, res) => {
  try {
    const { email, newUsername } = req.body;

    if (!email || !newUsername) {
      return res.status(400).json({
        success: false,
        message: 'Email and new username are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if new username already exists
    const usernameExists = await User.findOne({ 
      username: newUsername, 
      email: { $ne: email.toLowerCase() } 
    });
    
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Update username in User
    user.username = newUsername;
    await user.save();

    // Update username in UserProfile
    await UserProfile.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { username: newUsername } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Username updated successfully',
      username: newUsername
    });
  } catch (error) {
    console.error('Update username error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update password
app.post('/api/profile/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate new password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


// Test Groq route
app.post('/api/groq/test', async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: "llama3-8b-8192",
    });
    
    res.json({
      success: true,
      response: chatCompletion.choices[0]?.message?.content
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------
// Prototype routes for meals
// ---------------------------------------------------

// Create a meal
app.post('/api/meals', validateMeal, async (req, res) => {
  try {
    const { userEmail, name, calories, date } = req.body;

    if (!userEmail || !name || !calories) {
      return res.status(400).json({
        success: false,
        message: 'userEmail, meal name, and calories are required.'
      });
    }

    const meal = new Meal({
      userEmail: userEmail.toLowerCase(),
      name,
      calories: parseInt(calories, 10),
      date: date || new Date().toLocaleDateString('en-US')
    });

    await meal.save();

    res.status(201).json({
      success: true,
      meal
    });
  } catch (error) {
    console.error('Meal POST error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get meals for a user (optionally filtered by date)
app.get('/api/meals/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { date } = req.query;

    const query = { userEmail: email.toLowerCase() };
    if (date) query.date = date;

    const meals = await Meal.find(query).sort({ _id: -1 });

    res.json({
      success: true,
      meals
    });
  } catch (error) {
    console.error('Meal GET error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ---------------------------------------------------
// Error Handling 
// ---------------------------------------------------

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server (only if not being required for testing)
if (require.main === module) {
  dbConnectionPromise.then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

// Export for testing
module.exports = app;