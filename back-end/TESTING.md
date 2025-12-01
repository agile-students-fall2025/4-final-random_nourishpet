# Testing MongoDB Connection and Authentication

## Quick Start

1. **Set up your MongoDB Atlas connection** (see `MONGODB_SETUP.md`)

2. **Create a `.env` file** in the `back-end` directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/nutripal?retryWrites=true&w=majority
   PORT=3001
   ```

3. **Start the backend server**:
   ```bash
   cd back-end
   npm start
   ```

   You should see:
   ```
   MongoDB connected successfully
   Server is running on http://localhost:3001
   ```

## Testing Signup

### Using the Frontend:
1. Start your frontend (if not already running)
2. Navigate to the signup page
3. Fill in all required fields:
   - First Name
   - Last Name
   - Email
   - Date of Birth
   - Username
   - Password (at least 6 characters)
   - Confirm Password
4. Submit the form
5. You should be redirected to the main screen on success

### Using curl:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-01",
    "username": "johndoe",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "..."
  }
}
```

## Testing Sign In

### Using the Frontend:
1. Navigate to the sign in page
2. Enter the email and password you used during signup
3. Click Sign In
4. You should be redirected to the main screen on success

### Using curl:
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Sign in successful",
  "user": {
    "id": "...",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "..."
  }
}
```

## Verifying Data in MongoDB

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect using your connection string
3. Navigate to the `nutripal` database
4. You should see these collections:
   - `users` - Contains user accounts
   - `userprofiles` - Contains user profile information
   - `petdatas` - Contains pet data for each user
   - `streakdatas` - Contains streak data for each user

5. After signing up, check the `users` collection - you should see your new user document

## Running Tests

Run the existing test suite:
```bash
cd back-end
npm test
```

**Note**: The tests may need to be updated to work with MongoDB. They currently use in-memory arrays, but the server now uses MongoDB.

## Troubleshooting

### "MongoDB connection error"
- Check that your `.env` file exists and contains `MONGODB_URI`
- Verify your connection string is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Check that your cluster is running (not paused)

### "User with this email or username already exists"
- This is expected if you try to sign up with the same email/username twice
- Try with a different email/username, or check MongoDB Compass to see existing users

### "Invalid email or password"
- Make sure you're using the correct email and password
- Check that the user exists in the database (via MongoDB Compass)

### Server starts but can't connect to database
- The server will exit if it can't connect to MongoDB
- Check your connection string and network settings
- Verify MongoDB Atlas cluster is accessible

