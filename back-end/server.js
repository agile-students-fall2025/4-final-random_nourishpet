const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Database connection
const connectDB = require('./config/db');
const User = require('./models/User'); // needed only for /api/users list

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
const dbConnectionPromise = connectDB();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Route mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meals', require('./routes/mealsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/biometrics', require('./routes/biometricsRoutes'));
app.use('/api/main-screen', require('./routes/mainScreenRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/streak', require('./routes/streakRoutes'));

// INLINE ROUTES (TODO: move these into controllers)

// Get all users (testing only)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Groq test route
app.post('/api/groq/test', async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: "llama3-8b-8192"
    });

    res.json({
      success: true,
      response: chatCompletion.choices[0]?.message?.content
    });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =========== END INLINE ROUTES ===========

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
if (require.main === module) {
  dbConnectionPromise
    .then(() => {
      app.listen(PORT, () =>
        console.log(`Server is running on http://localhost:${PORT}`)
      );
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = app;
