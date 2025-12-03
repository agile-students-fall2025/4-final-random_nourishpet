// controllers/focusSessionController.js

const FocusSession = require('../models/FocusSession');

// POST /api/focus-sessions
exports.logFocusSession = async (req, res) => {
  try {
    const { userId, durationInSeconds, endedReason } = req.body;

    // Check authentication - if no user in request and no authenticated user, return 401
    if (!req.user && !userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validation
    if (!durationInSeconds) {
      return res.status(400).json({
        success: false,
        message: 'durationInSeconds is required'
      });
    }

    if (durationInSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be greater than zero'
      });
    }

    if (endedReason !== undefined && endedReason !== null && typeof endedReason !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid type for endedReason'
      });
    }

    // Use authenticated user ID if available, otherwise use provided userId
    const finalUserId = req.user?.id || req.user?._id?.toString() || userId || 'unknown';

    // Create focus session
    const session = new FocusSession({
      userId: finalUserId,
      durationInSeconds: parseInt(durationInSeconds, 10),
      endedReason: endedReason || null,
      startedAt: new Date(Date.now() - durationInSeconds * 1000),
      endedAt: new Date(),
    });

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Focus session saved successfully',
      sessionId: session._id.toString(),
    });
  } catch (error) {
    console.error('Log focus session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

