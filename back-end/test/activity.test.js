const request = require('supertest');
const { assert } = require('chai');
const app = require('../server');

describe('Activity API Tests', () => {

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
          // Missing fields on purpose
          activityType: '',
          timeSpent: null
        });

      // Validator should catch this → 400
      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.isString(res.body.message);
    });


    it('should fail when timeSpent is non-numeric (if validator enforces this)', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cycling',
          timeSpent: 'not-a-number'
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.isString(res.body.message);
    });

  });
});
