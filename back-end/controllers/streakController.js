// controllers/streakController.js

// POST /api/streak
exports.logStreakMessage = (req, res) => {
  const { message } = req.body;

  console.log('Streak share message:', message);

  res.status(200).json({
    success: true,
    message: 'Streak message logged'
  });
};
