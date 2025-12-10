const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Testing environment:
    if (process.env.NODE_ENV === 'test') {
      req.user = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
      };
      return next();
    }
    
    // Normal logic:
    console.log('Auth middleware - checking cookies:', {
      hasCookies: !!req.cookies,
      hasJWT: !!req.cookies?.jwt,
      cookieKeys: Object.keys(req.cookies || {}),
      origin: req.headers.origin,
      referer: req.headers.referer,
      method: req.method,
      path: req.path
    });

    const token = req.cookies?.jwt;

    if (!token) {
      console.error('Auth middleware - no JWT token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - token verified for user:', decoded.email);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      name: error.name,
      message: error.message,
      hasCookies: !!req.cookies,
      cookieKeys: Object.keys(req.cookies || {})
    });
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
      error: error.name === 'JsonWebTokenError' ? 'Invalid token' : 'Token verification failed'
    });
  }
};

module.exports = { protect };
