const request = require('supertest');
const assert = require('chai').assert;
const app = require('../server');
const User = require('../models/User');
const Activity = require('../models/Activity');
const StreakData = require('../models/StreakData');
const StreakMessage = require('../models/StreakMessage');
const mongoose = require('mongoose');

describe('Database Integration Tests', () => {
  let testUser;
  const testEmail = 'testdb@example.com';
  const testPassword = 'testpass123';
  const testUsername = 'testuserdb';

  before(async () => {
    // Ensure test user exists
    try {
      testUser = await User.findOne({ email: testEmail });
      if (!testUser) {
        testUser = new User({
          email: testEmail,
          username: testUsername,
          password: testPassword
        });
        await testUser.save();
      }
    } catch (error) {
      console.error('Error setting up test user:', error);
    }
  });

  after(async () => {
    // Clean up test data
    try {
      await Activity.deleteMany({ email: testEmail });
      await StreakData.deleteMany({ email: testEmail });
      await StreakMessage.deleteMany({ email: testEmail });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  describe('Activity Database Integration', () => {
    it('should save activity to database', async () => {
      const activityData = {
        email: testEmail,
        activityType: 'cardio',
        timeSpent: '30'
      };

      const res = await request(app)
        .post('/api/activities')
        .send(activityData)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.exists(res.body.activity);
      assert.strictEqual(res.body.activity.activityType, 'cardio');
      assert.strictEqual(res.body.activity.timeSpent, 30);
      assert.strictEqual(res.body.activity.email, testEmail);

      // Verify it's in database
      const savedActivity = await Activity.findOne({ email: testEmail, activityType: 'cardio' });
      assert.exists(savedActivity);
      assert.strictEqual(savedActivity.timeSpent, 30);
    });

    it('should query activities by email', async () => {
      // Create another activity
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'running',
          timeSpent: '45'
        })
        .expect(200);

      // Query from database
      const activities = await Activity.find({ email: testEmail });
      assert.isAtLeast(activities.length, 2);
      
      const activityTypes = activities.map(a => a.activityType);
      assert.include(activityTypes, 'cardio');
      assert.include(activityTypes, 'running');
    });

    it('should save activity with optional image fields', async () => {
      const activityData = {
        email: testEmail,
        activityType: 'yoga',
        timeSpent: '60',
        imageName: 'yoga.jpg',
        imageType: 'image/jpeg'
      };

      const res = await request(app)
        .post('/api/activities')
        .send(activityData)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.activity.imageName, 'yoga.jpg');
      assert.strictEqual(res.body.activity.imageType, 'image/jpeg');
    });
  });

  describe('Streak Calculation Logic', () => {
    beforeEach(async () => {
      // Clean up streak data before each test
      await StreakData.deleteMany({ email: testEmail });
    });

    it('should create streak data on first activity', async () => {
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(200);

      const streakData = await StreakData.findOne({ email: testEmail });
      assert.exists(streakData);
      assert.strictEqual(streakData.currentStreak, 1);
      assert.strictEqual(streakData.longestStreak, 1);
      assert.exists(streakData.lastLogDate);
    });

    it('should not change streak for same day activities', async () => {
      // First activity
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(200);

      const streakAfterFirst = await StreakData.findOne({ email: testEmail });
      const initialStreak = streakAfterFirst.currentStreak;

      // Second activity same day
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'running',
          timeSpent: '45'
        })
        .expect(200);

      const streakAfterSecond = await StreakData.findOne({ email: testEmail });
      assert.strictEqual(streakAfterSecond.currentStreak, initialStreak);
    });

    it('should increment streak for consecutive days', async () => {
      // First activity - day 1
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(200);

      let streakData = await StreakData.findOne({ email: testEmail });
      assert.strictEqual(streakData.currentStreak, 1);

      // Simulate next day by updating lastLogDate
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      await StreakData.findOneAndUpdate(
        { email: testEmail },
        { $set: { lastLogDate: yesterday, currentStreak: 1 } }
      );

      // Activity on consecutive day
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'running',
          timeSpent: '45'
        })
        .expect(200);

      streakData = await StreakData.findOne({ email: testEmail });
      assert.strictEqual(streakData.currentStreak, 2);
      assert.strictEqual(streakData.longestStreak, 2);
    });

    it('should reset streak for gap > 1 day', async () => {
      // First activity
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(200);

      // Set streak to 5 and lastLogDate to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);
      await StreakData.findOneAndUpdate(
        { email: testEmail },
        { $set: { lastLogDate: threeDaysAgo, currentStreak: 5, longestStreak: 5 } }
      );

      // Activity after gap
      await request(app)
        .post('/api/activities')
        .send({
          email: testEmail,
          activityType: 'yoga',
          timeSpent: '60'
        })
        .expect(200);

      const streakData = await StreakData.findOne({ email: testEmail });
      assert.strictEqual(streakData.currentStreak, 1);
      assert.strictEqual(streakData.longestStreak, 5); // Longest streak preserved
    });
  });

  describe('StreakMessage Database Integration', () => {
    it('should save streak message to database', async () => {
      const messageData = {
        email: testEmail,
        message: 'Test streak message!'
      };

      const res = await request(app)
        .post('/api/streak')
        .send(messageData)
        .expect(200);

      assert.strictEqual(res.body.success, true);
      assert.exists(res.body.streakMessage);
      assert.strictEqual(res.body.streakMessage.message, 'Test streak message!');
      assert.strictEqual(res.body.streakMessage.email, testEmail);

      // Verify it's in database
      const savedMessage = await StreakMessage.findOne({ email: testEmail });
      assert.exists(savedMessage);
      assert.strictEqual(savedMessage.message, 'Test streak message!');
    });

    it('should query streak messages by email', async () => {
      // Create another message
      await request(app)
        .post('/api/streak')
        .send({
          email: testEmail,
          message: 'Another test message'
        })
        .expect(200);

      // Query from database
      const messages = await StreakMessage.find({ email: testEmail });
      assert.isAtLeast(messages.length, 2);
      
      const messageTexts = messages.map(m => m.message);
      assert.include(messageTexts, 'Test streak message!');
      assert.include(messageTexts, 'Another test message');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent user in activities', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          email: 'nonexistent@example.com',
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(404);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'User not found');
    });

    it('should return 404 for non-existent user in streak', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({
          email: 'nonexistent@example.com',
          message: 'Test message'
        })
        .expect(404);

      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'User not found');
    });

    it('should return 400 for missing email in activities', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cardio',
          timeSpent: '30'
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
    });

    it('should return 400 for missing email in streak', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({
          message: 'Test message'
        })
        .expect(400);

      assert.strictEqual(res.body.success, false);
    });
  });
});

