const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user database (in-memory until we implement DB)
const users = []; 

// Mock meal database (in-memory until we implement DB)
const meals = []; 

// Mock user profiles (for Main Screen & Profile - linked by email)
const userProfiles = {};

// Mock pet data (for Main Screen - linked by email)
const petData = {};

// Mock streak data (for Main Screen - linked by email)
const streakData = {};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});


// ---------------------------------------------------
// Authentication routes 
// ---------------------------------------------------

// Sign Up route
app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validate required fields
  if (!username || !email || !password || !confirmPassword) {
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
  const existingUser = users.find(
    (u) => u.email === email || u.username === username
  );
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email or username already exists',
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password, // this will be hashed after the next sprint
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Initialize profile data for Main Screen & Profile
  userProfiles[email] = {
    firstName: '',
    lastName: '',
    email: email,
    dateOfBirth: '',
    username: username,
    bio: '',
    profilePicture: '/user.png'
  };

  // Initialize pet data for Main Screen
  petData[email] = {
    petImage: '/dog.png',
    petName: 'Buddy',
    petType: 'dog',
    happiness: 100,
    health: 100
  };

  // Initialize streak data for Main Screen
  streakData[email] = {
    currentStreak: 0,
    longestStreak: 0,
    lastLogDate: null
  };

  // Return success response (without password)
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
  });
});

// Sign In route
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user
  const user = users.find((u) => u.email === email);

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
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
});

// Activity submission route
app.post('/api/activities', (req, res) => {
  const { activityType, timeSpent, imageName, imageType } = req.body || {};

  if (!activityType || !timeSpent) {
    return res.status(400).json({
      success: false,
      message: 'Activity type and time spent are required'
    });
  }

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
app.post('/api/streak', (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  console.log('Streak share message:', message);

  res.status(200).json({
    success: true,
    message: 'Streak message logged'
  });
});

// Update biometrics route
app.post('/api/biometrics/update', (req, res) => {
  const {
    height,
    weight,
    bmi,
    ethnicity,
    gender,
    age
  } = req.body || {};

  const payload = {
    height: height ?? null,
    weight: weight ?? null,
    bmi: bmi ?? null,
    ethnicity: ethnicity ?? null,
    gender: gender ?? null,
    age: age ?? null
  };

  // Ensure at least one field provided (can be empty strings)
  const hasField = Object.values(payload).some(value => value !== null && value !== undefined);

  if (!hasField) {
    return res.status(400).json({
      success: false,
      message: 'No biometric data provided'
    });
  }

  console.log('Biometric update submission:', payload);

  res.status(200).json({
    success: true,
    message: 'Biometric data logged'
  });
});

// Get all users (for testing purposes - would not exist in production)
app.get('/api/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    success: true,
    users: usersWithoutPasswords,
  });
});


// ---------------------------------------------------
// MAIN SCREEN ROUTES
// ---------------------------------------------------

// Get main screen data (user, pet, streak)
app.get('/api/main-screen/:email', (req, res) => {
  const { email } = req.params;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const profile = userProfiles[email] || {};
  const pet = petData[email] || {};
  const streak = streakData[email] || {};

  res.json({
    success: true,
    data: {
      user: {
        username: user.username,
        profilePicture: profile.profilePicture
      },
      pet: pet,
      streak: streak
    }
  });
});


// ---------------------------------------------------
// PROFILE ROUTES
// ---------------------------------------------------

// Get user profile
app.get('/api/profile/:email', (req, res) => {
  const { email } = req.params;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const profile = userProfiles[email] || {};

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
});

// Update profile
app.post('/api/profile/update', (req, res) => {
  const { email, firstName, lastName, dateOfBirth, bio } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update profile data
  if (!userProfiles[email]) {
    userProfiles[email] = {};
  }

  userProfiles[email] = {
    ...userProfiles[email],
    firstName: firstName || userProfiles[email].firstName || '',
    lastName: lastName || userProfiles[email].lastName || '',
    dateOfBirth: dateOfBirth || userProfiles[email].dateOfBirth || '',
    bio: bio || userProfiles[email].bio || ''
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: userProfiles[email]
  });
});

// Update username
app.post('/api/profile/update-username', (req, res) => {
  const { email, newUsername } = req.body;

  if (!email || !newUsername) {
    return res.status(400).json({
      success: false,
      message: 'Email and new username are required'
    });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if new username already exists
  const usernameExists = users.find(u => u.username === newUsername && u.email !== email);
  if (usernameExists) {
    return res.status(409).json({
      success: false,
      message: 'Username already taken'
    });
  }

  // Update username in users array
  user.username = newUsername;

  // Update username in userProfiles
  if (userProfiles[email]) {
    userProfiles[email].username = newUsername;
  }

  res.json({
    success: true,
    message: 'Username updated successfully',
    username: newUsername
  });
});


// ---------------------------------------------------
// Prototype routes for meals
// ---------------------------------------------------

// Meals POST: Create a new meal
app.post('/api/meals', (req, res) => {
  const { userId, name, calories, date } = req.body;

  // Validate inputs
  if (!name || !calories) {
    return res.status(400).json({
      success: false,
      message: 'Meal name and calories are required.',
    });
  }

  const newMeal = {
    id: meals.length + 1,
    userId: userId || null, // optional for now, until we add JWT
    name,
    calories: parseInt(calories, 10),
    date: date || new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
  };

  meals.push(newMeal);

  res.status(201).json({
    success: true,
    message: 'Meal added successfully.',
    meal: newMeal,
  });
});

// Meals GET: Retrieve meals (optionally filter by date or user)
app.get('/api/meals', (req, res) => {
  const { userId, date } = req.query;

  let filteredMeals = meals;

  if (userId) {
    filteredMeals = filteredMeals.filter((m) => m.userId == userId);
  }

  if (date) {
    filteredMeals = filteredMeals.filter((m) => m.date === date);
  }

  res.json({
    success: true,
    meals: filteredMeals,
  });
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
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = app;