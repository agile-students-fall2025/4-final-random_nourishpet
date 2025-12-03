const request = require('supertest');
const { assert } = require('chai');
const app = require('../server');

describe('Password Reset API Tests', () => {

  describe('POST /api/password/forgot', () => {

    const VALID_EMAIL = 'user@example.com';
    const UNREGISTERED_EMAIL = 'unregistered@example.com';
    const BLOCKED_EMAIL = 'blocked@company.com';
    
    it('should successfully initiate password reset for a valid, existing email', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: VALID_EMAIL });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
      assert.include(res.body.message, 'If an account exists, a reset link has been sent');
    });

    it('should return a success-like message for an unregistered email to prevent user enumeration', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: UNREGISTERED_EMAIL });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
    });
    
    it('should fail validation when the required email field is missing', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({});

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Email is required');
    });

    it('should fail validation when the email field is an empty string', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: '' });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Email cannot be empty');
    });

    it('should fail validation when the email format is invalid (e.g., missing @)', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'invalid-email-format' });

      assert.equal(res.status, 400);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Must be a valid email address');
    });

    it('should return 429 Too Many Requests if the user/IP has exceeded the reset limit', async () => {
      const res = await request(app)
        .post('/api/password/forgot?simulateRateLimit=true') 
        .send({ email: VALID_EMAIL });

      assert.equal(res.status, 429);
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Too many requests');
    });

    it('should return a successful message even if the account is blocked/deactivated (for security)', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: BLOCKED_EMAIL });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
    });
    
    it('should ignore unexpected fields in the payload and still proceed (or fail due to strict validation)', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ 
            email: VALID_EMAIL, 
            unexpectedField: 'data' 
        });

      assert.equal(res.status, 200); 
      assert.isTrue(res.body.success);
    });

    it('should process the request successfully even if the email has different casing', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'UsEr@eXaMpLe.com' });

      assert.equal(res.status, 200);
      assert.isTrue(res.body.success);
    });

    it('should return 500 Internal Server Error if the email dispatch service fails', async () => {
      const res = await request(app)
        .post('/api/password/forgot?simulateEmailFailure=true')
        .send({ email: VALID_EMAIL });

      assert.equal(res.status, 500); 
      assert.isFalse(res.body.success);
      assert.include(res.body.message, 'Could not send reset email');
    });
  });
});