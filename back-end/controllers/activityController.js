// controllers/activityController.js

// POST /api/activities
exports.logActivity = (req, res) => {
  const { activityType, timeSpent, imageName, imageType } = req.body;

  console.log('Activity submission received:', {
    activityType,
    timeSpent,
    imageName: imageName || null,
    imageType: imageType || null
  });

  res.status(200).json({
    success: true,
    message: 'Activity logged successfully'
  });
};
