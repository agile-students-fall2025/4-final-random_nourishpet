const jwt = require('jsonwebtoken');

function generateToken(user) {
  // Use test secret if JWT_SECRET is not set (for test environment)
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-secret-key' : null);
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
    },
    secret
  );
}

module.exports = generateToken;
