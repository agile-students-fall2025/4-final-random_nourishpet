# NutriPal

## Project Description

**NutriPal** is a web application that transforms nutrition tracking into an engaging, game-like experience.  
Users “raise” a virtual pet that thrives when they make healthy food choices — turning meal logging and wellness tracking into a source of motivation and fun.

---


## Vision Statement/Minimum Viable Product

**NutriPal** will include (at least) the following essential features:

- **Pet Growth Mechanic:** A virtual pet that grows, levels up, or changes mood based on the user’s nutritional choices.  
- **Meal Logging:** Users can log meals manually or by scanning barcodes.  
- **Nutrition Analysis:** Users can review their calories, macronutrients, and key vitamins/minerals.  
- **Daily Goal Tracking:** Visual indicators for meeting calorie and nutrient goals.  
- **Gamified Feedback:** Positive reinforcement through streaks, achievements, and animations.

---

## Team Members

- **Naseem Uddin** — [@Naseem-Uddin](https://github.com/Naseem-Uddin)  
- **Ethan Arnold** — [@ethanarnold](https://github.com/ethanarnold)  
- **Amal Faisal** — [@amal-faisal](https://github.com/amal-faisal)  
- **Becky Tan** — [@beckytan](https://github.com/beckytan)
- **Avi Herman** — [@avih7531](https://github.com/avih7531)

---

## Team History

We are a team of students collaborating on a class project for Agile Software development.  
During ideation, we chose to create **NutriPal** because we wanted to bring our creativity and lightheartedness to the difficult realm of nutrition. We hope to integrate technology, design, and behavioral psychology to promote healthier habits.  
We're hoping to practitce the Scrum framework, with sprint-based milestones, spikes, and task boards managed via GitHub Projects.

---

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **MongoDB Atlas** account (free tier works)
- **Git**

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/agile-students-fall2025/4-final-random_nourishpet.git
cd 4-final-random_nourishpet
```

### 2. Backend Setup

```bash
cd back-end
npm install
```

Create a `.env` file in the `back-end` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nourishpet?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port (optional, defaults to 3001)
PORT=3001

# Groq API (optional, for BMI calculations)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama3-8b-8192

# Email Service (optional, for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../front-end
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd back-end
npm start
```
Backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd front-end
npm start
```
Frontend will run on `http://localhost:3000` and open automatically in your browser.

---

## Development

### Backend Scripts

```bash
cd back-end

# Start server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Frontend Scripts

```bash
cd front-end

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## Environment Variables

### Required Backend Variables

- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT token signing

### Optional Backend Variables

- `PORT` - Server port (default: 3001)
- `GROQ_API_KEY` - API key for Groq AI (BMI calculations)
- `GROQ_MODEL` - Groq model name (default: llama3-8b-8192)
- `EMAIL_USER` - Email address for password reset
- `EMAIL_PASSWORD` - Email app password
- `FRONTEND_URL` - Frontend URL for email links

---

## Project Structure

```
4-final-random_nourishpet/
├── back-end/              # Express.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth & validation middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── test/             # Test files
│   └── server.js         # Express app entry point
│
├── front-end/            # React frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/    # React components
│       └── context/      # React context (Auth)
│
└── README.md
```

---

## API Endpoints

All API endpoints (except `/api/auth/*`) require JWT authentication via cookies.

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Meals
- `POST /api/meals` - Create meal (protected)
- `GET /api/meals/:email` - Get user meals (protected)

### Profile
- `GET /api/profile/:email` - Get user profile (protected)
- `POST /api/profile/update` - Update profile (protected)
- `POST /api/profile/update-username` - Update username (protected)
- `POST /api/profile/update-password` - Update password (protected)

### Activities
- `POST /api/activities` - Log activity (protected)
- `GET /api/activities/:email` - Get user activities (protected)

### Biometrics
- `POST /api/biometrics/update` - Update biometric data (protected)
- `GET /api/biometrics/:email` - Get biometric data (protected)

### Focus Sessions
- `POST /api/focus-sessions` - Log focus session (protected)

### Streak
- `POST /api/streak` - Log streak message (protected)

---

## Testing

### Backend Tests

```bash
cd back-end
npm test
```

Tests use an in-memory MongoDB instance (no setup required).

### Frontend Tests

```bash
cd front-end
npm test
```

---

## Database

The application uses **MongoDB Atlas** (cloud-hosted MongoDB).

### Models

- `User` - User accounts
- `UserProfile` - User profile information
- `PetData` - Virtual pet data
- `Meal` - Meal logs
- `Activity` - Activity logs
- `BiometricData` - Height, weight, BMI data
- `StreakData` - User streak information
- `FocusSession` - Focus mode sessions
- `PasswordReset` - Password reset tokens

### Indexes

Performance indexes are configured on:
- `Meal`: `email`, `email + date`
- `Activity`: `email`, `email + date`
- `FocusSession`: `userId + startedAt`

---

## Troubleshooting

### Backend won't start
- Check that MongoDB URI is correct in `.env`
- Ensure port 3001 is not in use
- Verify all dependencies are installed: `npm install`

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `back-end/server.js`
- Verify API calls use correct base URL

### Authentication issues
- Ensure `JWT_SECRET` is set in `.env`
- Check that cookies are enabled in browser
- Verify JWT token is being sent with requests

### Database connection errors
- Verify MongoDB Atlas connection string
- Check network/IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

---

## Contributing

For detailed contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Git Workflow

1. Create a feature branch: `git checkout -b feature-name`
2. Make your changes
3. Commit: `git commit -m "description"`
4. Push: `git push origin feature-name`
5. Create a Pull Request

---

## License

See [LICENSE.md](LICENSE.md) for details.