// controllers/biometricsController.js

const User = require('../models/User');
const BiometricData = require('../models/BiometricData');
const { calculateBMI } = require('../services/bmiService');

// Helpers reproduced exactly from server.js behavior
const valueProvided = (value) =>
  !(value === undefined || value === null || (typeof value === 'string' && value.trim() === ''));

const parseNumber = (value) => {
  if (!valueProvided(value)) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

// -------------------------------------------
// POST /api/biometrics/update
// -------------------------------------------
exports.updateBiometrics = async (req, res) => {
  try {
    const {
      email,
      height,
      weight,
      ethnicity,
      ethnicityOther,
      sex,
      age
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse numeric values
    const heightCmInput = parseNumber(height);
    if (valueProvided(height) && heightCmInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Height must be a numeric value in centimeters'
      });
    }

    const weightLbsInput = parseNumber(weight);
    if (valueProvided(weight) && weightLbsInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a numeric value in pounds'
      });
    }

    const ageInput = parseNumber(age);
    if (valueProvided(age) && ageInput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Age must be a numeric value'
      });
    }

    // Fetch existing (if any)
    const existingRecord = await BiometricData.findOne({ email: normalizedEmail });

    const merged = {
      heightCm: heightCmInput ?? existingRecord?.heightCm,
      weightLbs: weightLbsInput ?? existingRecord?.weightLbs,
      ethnicity: (typeof ethnicity === 'string' && ethnicity.trim().length > 0)
        ? ethnicity.trim()
        : (existingRecord?.ethnicity || ''),
      ethnicityOther: ethnicityOther ?? existingRecord?.ethnicityOther ?? '',
      sex: (typeof sex === 'string' && sex.trim().length > 0)
        ? sex.trim()
        : (existingRecord?.sex || ''),
      age: Number.isFinite(ageInput) ? ageInput : (existingRecord?.age ?? null)
    };

    // Height/weight required
    if (!merged.heightCm || !merged.weightLbs) {
      return res.status(400).json({
        success: false,
        message: 'Height (cm) and weight (lbs) are required'
      });
    }

    // EthnicityOther reset logic
    if (merged.ethnicity !== 'Other') {
      merged.ethnicityOther = '';
    } else {
      merged.ethnicityOther = (typeof ethnicityOther === 'string' && ethnicityOther.trim().length > 0)
        ? ethnicityOther.trim()
        : (existingRecord?.ethnicityOther || '');
    }

    // BMI calculation
    const bmiResult = await calculateBMI({
      heightCm: merged.heightCm,
      weightLbs: merged.weightLbs,
      sex: merged.sex,
      age: merged.age,
      ethnicity: merged.ethnicity,
      ethnicityOther: merged.ethnicityOther,
    });

    // Upsert record
    const updatedBiometrics = await BiometricData.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          heightCm: merged.heightCm,
          weightLbs: merged.weightLbs,
          ethnicity: merged.ethnicity,
          ethnicityOther: merged.ethnicity === 'Other' ? merged.ethnicityOther : '',
          sex: merged.sex,
          age: merged.age ?? null,
          bmi: bmiResult.bmi,
          bmiSource: bmiResult.source,
          lastCalculatedAt: new Date(),
        },
        $setOnInsert: { email: normalizedEmail }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Biometric data updated',
      biometrics: updatedBiometrics,
    });
  } catch (error) {
    console.error('Update biometrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// -------------------------------------------
// GET /api/biometrics/:email
// -------------------------------------------
exports.getBiometrics = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const biometrics = await BiometricData.findOne({ email: normalizedEmail });

    if (!biometrics) {
      return res.status(404).json({
        success: false,
        message: 'No biometrics found for this user'
      });
    }

    res.json({
      success: true,
      biometrics,
    });
  } catch (error) {
    console.error('Get biometrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
