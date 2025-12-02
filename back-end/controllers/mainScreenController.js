// controllers/mainScreenController.js

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const PetData = require('../models/PetData');
const StreakData = require('../models/StreakData');

// GET /api/main-screen/:email
exports.getMainScreenData = async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile =
      (await UserProfile.findOne({ email: normalizedEmail })) || {};
    const pet =
      (await PetData.findOne({ email: normalizedEmail })) || {};
    const streak =
      (await StreakData.findOne({ email: normalizedEmail })) || {};

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          profilePicture: profile.profilePicture || '/user.png'
        },
        pet: pet || {},
        streak: streak || {}
      }
    });
  } catch (error) {
    console.error('Get main screen error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
