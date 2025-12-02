// validators/authValidators.js

exports.validateSignup = (req, res, next) => {
  const { firstName, lastName, username, email, dateOfBirth, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !username || !email || !dateOfBirth || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  next();
};

exports.validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  next();
};
