const request = require('supertest');
const { assert } = require('chai');
const app = require('../server');
const User = require('../models/User');

describe('Activity API Tests', () => {

  // Ensure DB has a valid user before each test
  beforeEach(async () => {
    await User.deleteMany({});

    await User.create({
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123' // hashing not required for this test
    });
  });

  describe('POST /api/activities', () => {

    it('should log an activity successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          email: 'test@example.com',
          activityType: 'running',
          timeSpent: 30,
          imageName: 'run.png',
          imageType: 'image/png'
        });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
      assert.equal(res.body.message, 'Activity logged successfully');
    });

    it('should fail validation when missing required fields', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: '',
          timeSpent: null
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.isString(res.body.message);
    });

    it('should fail when timeSpent is non-numeric (if validator enforces this)', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cycling',
          timeSpent: 'not-a-number',
          email: 'test@example.com'
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.isString(res.body.message);
    });

  });
});
