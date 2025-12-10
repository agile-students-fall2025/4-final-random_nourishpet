const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const Groq = require('groq-sdk');
const { protect } = require('./middleware/authMiddleware');

// Initialize Groq only if API key is provided
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

const connectDB = require('./config/db');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;

console.log("SERVER STARTED ON PORT:", PORT);

const dbConnectionPromise = connectDB();

// CORS configuration - supports both local development and Docker
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://frontend:80', 'http://localhost'];

console.log('CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) {
      console.log('Request with no origin header - allowing');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`Origin ${origin} is in allowed list - allowing`);
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not in allowed list - allowing anyway (permissive mode)`);
      // Allow all origins for now - change to callback(new Error('Not allowed by CORS')) in production
      callback(null, true);
    }
  },
  credentials: true,
  // Explicitly allow common headers
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Allow common methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Enable preflight caching
  maxAge: 86400
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    console.log("HEALTH ROUTE HIT");
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/groq/debug', (req, res) => {
  res.json({
    GROQ_MODEL: process.env.GROQ_MODEL || null,
    GROQ_API_KEY_PRESENT: !!process.env.GROQ_API_KEY
  });
});

// Protected test route
app.get('/api/test-protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route hit',
    user: req.user,
  });
});

// Route mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meals', protect, require('./routes/mealsRoutes'));
app.use('/api/meal-plans', protect, require('./routes/mealPlanRoutes'));
app.use('/api/profile', protect, require('./routes/profileRoutes'));
app.use('/api/biometrics', protect, require('./routes/biometricsRoutes'));
app.use('/api/main-screen', protect, require('./routes/mainScreenRoutes'));
app.use('/api/activities', protect, require('./routes/activityRoutes'));
app.use('/api/streak', protect, require('./routes/streakRoutes'));
app.use('/api/focus-sessions', protect, require('./routes/focusSessionRoutes'));

// INLINE ROUTES for testing

app.get('/api/users', protect, async (req, res) => {
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

app.post('/api/groq/test', protect, async (req, res) => {
  try {
    if (!groq) {
      return res.status(400).json({
        success: false,
        error: 'Groq API key not configured'
      });
    }
    const modelToUse = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: modelToUse
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

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

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
