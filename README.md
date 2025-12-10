# NutriPal

**🌐 Live Application:** http://167.172.223.98:3000/

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
# NutriPal

NutriPal is a gamified nutrition tracker that helps users build healthy habits by caring for a virtual pet. The pet's health and mood reflect the user's logged meals, activities, and biometric data.

Live demo: http://167.172.223.98:3000/ (production)

---

## Key features

- Gamified virtual pet that reflects user behavior
- Meal logging and nutrition analysis
- Profile, biometric tracking, activities, focus sessions, and streaks
- JWT-based authentication with cookie sessions
- Dockerized for local development and production

---

## Tech stack

- Frontend: React (Create React App)
- Backend: Node.js + Express
- Database: MongoDB Atlas (Mongoose)
- Deployment: Docker, Docker Compose, DigitalOcean

---

## Quick start (development)

Prerequisites:

- Node.js (v18+)
- npm
- MongoDB Atlas account (or a local MongoDB instance)

1. Clone the repo

```bash
git clone https://github.com/agile-students-fall2025/4-final-random_nutripal.git
cd 4-final-random_nutripal
```

2. Backend

```bash
cd back-end
npm install
cp .env.example .env
# edit back-end/.env and provide MONGODB_URI, JWT_SECRET, etc.
npm start
```

The backend listens on http://localhost:3001 by default.

3. Frontend

```bash
cd ../front-end
npm install
# The development server is configured to proxy API requests to the backend
npm start
```

The frontend runs on http://localhost:3000 and the CRA dev-server proxies /api requests to the backend so cookies work during development.

---

## Environment variables

Backend environment variables are defined in `back-end/.env.example`. Required values include:

- MONGODB_URI — MongoDB connection string
- JWT_SECRET — secret used to sign JWTs

Optional variables (examples): PORT, ALLOWED_ORIGINS, GROQ_API_KEY, EMAIL_USER, EMAIL_PASSWORD, FRONTEND_URL

Frontend: `front-end/.env` may contain `REACT_APP_API_BASE_URL` for direct backend targeting; by default the app uses relative URLs so the CRA proxy will forward requests to the backend during development.

---

## Running tests

Backend tests (uses an in-memory MongoDB):

```bash
cd back-end
npm test
```

Frontend tests:

```bash
cd front-end
npm test
```

---

## Project layout

Top-level directories:

- `back-end/` — Express API, controllers, models, middleware, and tests
- `front-end/` — React application

Refer to the folder READMEs and `back-end/.env.example` for more details.

---

## Deployment

The project includes Docker and Docker Compose configurations for both development and production. CI/CD is implemented via GitHub Actions and deployment targets a DigitalOcean droplet (see `docker-compose.prod.yml` and CI workflow files for details).

Basic Docker usage:

```bash
docker-compose up -d --build
docker-compose logs -f
```

---

## API (summary)

Authentication endpoints (all under `/api/auth`):

- `POST /api/auth/signup`
- `POST /api/auth/signin` (sets JWT cookie)
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected — requires cookie)

Other resources include `/api/meals`, `/api/profile`, `/api/activities`, `/api/biometrics`, `/api/focus-sessions`, `/api/streak`.

Refer to the code (`back-end/routes`) for exact routes and payloads.

---

## Troubleshooting & tips

- If cookies are not saved during development, ensure the CRA dev-server proxy is enabled (front-end `package.json` contains a `proxy` entry) or use `credentials: 'include'` in fetch requests.
- Ensure `JWT_SECRET` is set in the backend `.env`.
- Check backend logs for `Setting JWT cookie` messages to confirm the server is issuing the cookie.

---

## Contributing

Please read `CONTRIBUTING.md` for contribution guidelines. Typical workflow:

1. Create a feature branch
2. Implement changes and add tests
3. Open a Pull Request

---

## License

This project is licensed under the terms in `LICENSE.md`.

---

If you'd like, I can add badges (build, tests, coverage), a short architecture diagram, or a one-page developer onboarding checklist — tell me which you'd prefer and I will add it.
