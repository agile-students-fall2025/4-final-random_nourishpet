# Deployment Notes - Chromium Cookie Fix

## Critical Configuration for Production

To ensure cookies work correctly in **both Firefox and Chromium** on your droplet:

### 1. Update Backend `.env` File

**IMPORTANT:** On your droplet, update `/back-end/.env` with:

```bash
ALLOWED_ORIGINS=http://167.172.223.98:3000,http://localhost:3000,http://frontend:80
FRONTEND_URL=http://167.172.223.98:3000
```

Replace `167.172.223.98` with your actual droplet IP if different.

### 2. What Was Fixed

#### Cookie Settings (authController.js)
- Set `secure: false` for HTTP connections (Chromium requirement)
- Added explicit `path: '/'` to ensure cookies are sent on all routes
- Increased `maxAge` to 7 days for session persistence
- Added logging to debug cookie issues

#### CORS Configuration (server.js)
- Enhanced origin validation with better logging
- Added explicit `allowedHeaders` and `methods`
- Enabled preflight caching for better performance
- Made CORS more permissive for debugging

#### Auth Middleware (authMiddleware.js)
- Added comprehensive logging for cookie debugging
- Better error messages for JWT validation failures
- Logs request origin, method, and available cookies

### 3. Restart Services After Deployment

```bash
cd /home/aviherman/School/Junior/Agile/4-final-random_nourishpet
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### 4. Testing Checklist

- [ ] Login works in Firefox
- [ ] Login works in Chromium
- [ ] Main screen loads in both browsers
- [ ] Generate meal plan works in Firefox
- [ ] Generate meal plan works in Chromium
- [ ] Manual navigation to other pages maintains session
- [ ] Cookies persist after page refresh

### 5. Debugging Tips

If issues persist, check Docker logs:
```bash
docker logs nourishpet-backend -f
```

Look for:
- `CORS Allowed Origins:` - Should include your droplet URL
- `Setting JWT cookie with options:` - Should show secure: false
- `Auth middleware - checking cookies:` - Should show hasJWT: true
- Any 401 errors with cookie information

### 6. Why This Fix Works

**The Problem:** Chromium is stricter than Firefox about:
1. Cookie SameSite policies on POST requests
2. Secure flag requirements
3. Cookie path matching

**The Solution:**
- Explicitly set `secure: false` for HTTP (Chromium won't send secure cookies on HTTP)
- Use `sameSite: 'lax'` which allows same-site POST requests
- Set explicit `path: '/'` to ensure cookies are available everywhere
- Added `maxAge` so cookies persist across sessions
- Enhanced CORS to ensure proper origin handling
