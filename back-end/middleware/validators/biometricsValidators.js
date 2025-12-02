const BiometricData = require('../../models/BiometricData');

exports.validateBiometrics = async (req, res, next) => {
  const { email, height, weight } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingRecord = await BiometricData.findOne({ email: normalizedEmail });

  // If creating a new record, height + weight are required
  if (!existingRecord) {
    if (height === undefined || weight === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Height (cm) and weight (lbs) are required'
      });
    }
  }

  // If updating an existing record, allow partial updates
  return next();
};
