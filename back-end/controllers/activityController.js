// controllers/activityController.js

const Activity = require('../models/Activity');
const User = require('../models/User');

// POST /api/activities
exports.logActivity = async (req, res) => {
  try {
    const { activityType, timeSpent, imageName, imageType, email } = req.body;

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new activity record
    const activity = new Activity({
      email: email.toLowerCase(),
      activityType,
      timeSpent: parseInt(timeSpent, 10),
      imageName: imageName || null,
      imageType: imageType || null
    });

    await activity.save();

    console.log('Activity saved to database:', {
      activityType,
      timeSpent,
      imageName: imageName || null,
      imageType: imageType || null
    });

    res.status(200).json({
      success: true,
      message: 'Activity logged successfully',
      activity: activity
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /api/activities/:email - Get user's activities
exports.getActivities = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activities = await Activity.find({ 
      email: email.toLowerCase() 
    }).sort({ date: -1 });

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
