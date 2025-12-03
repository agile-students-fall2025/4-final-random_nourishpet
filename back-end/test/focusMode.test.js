const request = require('supertest');
const { assert } = require('chai');
const app = require('../server');

describe('Focus Mode API Tests', () => {

  describe('POST /api/focus-sessions', () => {

    it('should successfully log a focus session with valid duration and user ID', async () => {
      const res = await request(app)
        .post('/api/focus-sessions')
        .send({
          userId: '123',
          durationInSeconds: 3600,
          endedReason: 'user-reset'
        });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
      assert.equal(res.body.message, 'Focus session saved successfully');
      assert.property(res.body, 'sessionId');
    });

    it('should fail validation when durationInSeconds is missing', async () => {
      const res = await request(app)
        .post('/api/focus-sessions')
        .send({
          userId: '123',
          endedReason: 'user-paused'
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'durationInSeconds is required');
    });

    it('should fail validation if durationInSeconds is 0 (session too short)', async () => {
      const res = await request(app)
        .post('/api/focus-sessions')
        .send({
          userId: '123',
          durationInSeconds: 0,
          endedReason: 'test-fail'
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Duration must be greater than zero');
    });

    it('should return 401 Unauthorized if the request is not authenticated', async () => {
      const res = await request(app)
        .post('/api/focus-sessions')
        .send({
          durationInSeconds: 120,
        });

      assert.equal(res.status, 401);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Unauthorized');
    });

    it('should fail validation if endedReason is not a string', async () => {
      const res = await request(app)
        .post('/api/focus-sessions')
        .send({
          userId: '123',
          durationInSeconds: 120,
          endedReason: 42
        });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Invalid type for endedReason');
    });

  });
});