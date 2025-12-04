# NutriPal

## Project Description

**NutriPal** is a web application that transforms nutrition tracking into an engaging, game-like experience.  
Users "raise" a virtual pet that thrives when they make healthy food choices — turning meal logging and wellness tracking into a source of motivation and fun.

### Deployment & Infrastructure

NutriPal is deployed to **Digital Ocean** using Docker containers with fully automated CI/CD pipelines:

- ✅ **Docker Container Deployment** - Application runs in containerized environments for consistency and scalability
- ✅ **Continuous Integration (CI)** - Automated testing on every push/PR via GitHub Actions
- ✅ **Continuous Deployment (CD)** - Automated deployment to production on merge to main/master

See the [Production Deployment](#production-deployment) section for detailed information about the deployment architecture and process.

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
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: `http://localhost:3000,http://frontend:80`)
- `GROQ_API_KEY` - API key for Groq AI (BMI calculations)
- `GROQ_MODEL` - Groq model name (default: llama3-8b-8192)
- `EMAIL_USER` - Email address for password reset
- `EMAIL_PASSWORD` - Email app password
- `FRONTEND_URL` - Frontend URL for email links

### Frontend Variables

- `REACT_APP_API_BASE_URL` - API base URL for local development (default: `http://localhost:3001`)
  - **Note:** In Docker, the frontend uses relative URLs since nginx proxies `/api` requests to the backend.

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

## Docker Deployment

NutriPal can be run using Docker for both local development and production deployment.

### Prerequisites

- Docker installed on your system
- Docker Compose installed
- `.env` files configured (see [Environment Variables](#environment-variables) section above)

### Local Development with Docker

1. **Create `.env` files** as described in the [Environment Variables](#environment-variables) section

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the services:**
   ```bash
   docker-compose down
   ```

5. **Rebuild after code changes:**
   ```bash
   docker-compose up -d --build
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Deployment

NutriPal is deployed to a **Digital Ocean Droplet** using Docker containers with automated CI/CD pipelines.

#### Deployment Architecture

- **Hosting:** Digital Ocean Droplet (Ubuntu)
- **Containerization:** Docker & Docker Compose
- **Deployment Path:** `/var/www/nourishpet` on the droplet
- **CI/CD:** GitHub Actions for automated testing and deployment

#### Extra Credit Features Implemented

✅ **Docker Container Deployment** - Application runs in containerized environments for consistency and scalability  
✅ **Continuous Integration (CI)** - Automated testing on every push/PR via GitHub Actions  
✅ **Continuous Deployment (CD)** - Automated deployment to production on merge to main/master

#### How Deployment Works

1. **Initial Setup (One-time):**
   - Create a Digital Ocean Droplet
   - Install Docker and Docker Compose on the droplet
   - Configure GitHub Secrets:
     - `DO_HOST` - Droplet IP address or hostname
     - `DO_USER` - SSH username (e.g., `root`)
     - `DO_SSH_KEY` - Private SSH key for authentication
     - `DO_PORT` - SSH port (default: 22)
   - Create `.env` files on the droplet with production values

2. **Automated Deployment Process:**
   When code is pushed to `main` or `master` branch:
   
   a. **Continuous Integration (CI) Pipeline:**
      - Runs backend unit tests with MongoDB
      - Runs frontend tests and builds
      - Builds Docker images to verify they compile correctly
      - All tests must pass before deployment proceeds
   
   b. **Continuous Deployment (CD) Pipeline:**
      - Builds the frontend production bundle
      - Copies entire codebase to `/var/www/nourishpet` on the droplet via SCP
      - SSHes into the droplet and:
        - Stops existing containers
        - Builds new Docker images
        - Starts containers using `docker-compose.prod.yml`
        - Cleans up old Docker images
        - Shows container status and logs

3. **Manual Deployment (if needed):**
   ```bash
   # SSH into droplet
   ssh user@your-droplet-ip
   
   # Navigate to deployment directory
   cd /var/www/nourishpet
   
   # Pull latest code (if using git)
   git pull origin main
   
   # Rebuild and restart containers
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

4. **Access the Application:**
   - Configure a reverse proxy (nginx) on the host to route traffic
   - Or access directly via exposed ports (3000 for frontend, 3001 for backend)
   - Set up firewall rules to expose necessary ports

#### CI/CD Workflow Files

- **CI Workflow:** `.github/workflows/ci.yml`
  - Triggers on: push/PR to `main`, `master`, `develop`, `avi-deployment`
  - Tests: Backend (with MongoDB), Frontend, Docker builds
  
- **CD Workflow:** `.github/workflows/cd.yml`
  - Triggers on: push to `main`/`master` or manual workflow dispatch
  - Deploys: Full application to Digital Ocean Droplet

### Docker Commands Reference

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec backend npm test

# Rebuild and restart
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

### Docker Troubleshooting

#### Containers won't start
- Check that `.env` files exist and have correct values
- Check logs: `docker-compose logs`
- Verify MongoDB connection string is correct

#### Frontend can't connect to backend
- Ensure CORS settings in backend `.env` include the frontend URL (set `ALLOWED_ORIGINS`)
- Check that both containers are on the same Docker network
- Verify nginx proxy configuration in `front-end/nginx.conf`

#### Port conflicts
- Change ports in `docker-compose.yml` if 3000 or 3001 are already in use
- Update `ALLOWED_ORIGINS` in backend `.env` if you change the frontend port

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