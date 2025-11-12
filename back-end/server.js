const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user database (in-memory until we implement DB)w)
const users = []; 

// Mock meal database (in-memory until we implement DB)
const meals = []; 

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

// Get all users (for testing purposes - would not exist in production)
app.get('/api/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    success: true,
    users: usersWithoutPasswords,
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
