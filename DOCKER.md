# Docker Deployment Guide

This guide explains how to run NutriPal using Docker for both local development and production deployment.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- `.env` files configured (see below)

## Environment Variables

### Backend `.env` file

Create `back-end/.env` with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nourishpet?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port (optional, defaults to 3001)
PORT=3001

# CORS Allowed Origins (comma-separated for multiple origins)
# For local development: http://localhost:3000
# For Docker: http://localhost:3000,http://frontend:80
ALLOWED_ORIGINS=http://localhost:3000,http://frontend:80

# Groq API (optional, for BMI calculations)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama3-8b-8192

# Email Service (optional, for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` file (for local development only)

Create `front-end/.env` for local development:

```env
# API Base URL (for local development)
REACT_APP_API_BASE_URL=http://localhost:3001
```

**Note:** In Docker, the frontend uses relative URLs since nginx proxies `/api` requests to the backend.

## Local Development with Docker

1. **Create `.env` files** as described above

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

## Production Deployment

For production deployment on Digital Ocean:

1. **SSH into your droplet:**
   ```bash
   ssh user@your-droplet-ip
   ```

2. **Clone the repository:**
   ```bash
   cd /var/www
   git clone <your-repo-url> nourishpet
   cd nourishpet
   ```

3. **Create `.env` files** on the server with production values

4. **Start the services:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

5. **Set up a reverse proxy (nginx) on the host** to route traffic to the containers, or configure firewall rules to expose ports 3000 and 3001.

## Docker Commands Reference

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

## Troubleshooting

### Containers won't start
- Check that `.env` files exist and have correct values
- Check logs: `docker-compose logs`
- Verify MongoDB connection string is correct

### Frontend can't connect to backend
- Ensure CORS settings in backend `.env` include the frontend URL
- Check that both containers are on the same Docker network
- Verify nginx proxy configuration in `front-end/nginx.conf`

### Port conflicts
- Change ports in `docker-compose.yml` if 3000 or 3001 are already in use
- Update `ALLOWED_ORIGINS` in backend `.env` if you change the frontend port

