// controllers/profileController.js

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

// GET /api/profile/:email
exports.getProfile = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = await UserProfile.findOne({ email: email.toLowerCase() }) || {};

    res.json({
      success: true,
      profile: {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || email,
        dateOfBirth: profile.dateOfBirth || '',
        username: user.username,
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '/user.png'
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/profile/update
exports.updateProfile = async (req, res) => {
  try {
    const { email, firstName, lastName, dateOfBirth, bio } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (bio !== undefined) updateData.bio = bio;

    const profile = await UserProfile.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/profile/update-username
exports.updateUsername = async (req, res) => {
  try {
    const { email, newUsername } = req.body;

    if (!email || !newUsername) {
      return res.status(400).json({
        success: false,
        message: 'Email and new username are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username exists on someone else
    const usernameExists = await User.findOne({
      username: newUsername, 
      email: { $ne: email.toLowerCase() }
    });

    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }

    user.username = newUsername;
    await user.save();

    await UserProfile.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { username: newUsername } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Username updated successfully',
      username: newUsername
    });
  } catch (error) {
    console.error('Update username error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// POST /api/profile/update-password
exports.updatePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
