const request = require('supertest');
const assert = require('assert');
const app = require('../server');

// Test user constants
const TEST_EMAIL = 'testprofile@example.com';
const INITIAL_USERNAME = 'testuser_profile';
const UPDATED_USERNAME = 'updateduser_profile';

describe('Profile Routes', function () {
  // Before running profile tests, we must create the user so profile endpoints work.
  before(async function () {
    await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'Profile',
        username: INITIAL_USERNAME,
        email: TEST_EMAIL,
        dateOfBirth: '2000-01-01',
        password: 'password123',
        confirmPassword: 'password123'
      })
      .expect(201);
  });

  // ----------------------------------------------------------
  // GET /api/profile/:email
  // ----------------------------------------------------------
  it('should return the user profile', async function () {
    const res = await request(app)
      .get(`/api/profile/${TEST_EMAIL}`)
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.profile);
    assert.strictEqual(res.body.profile.email, TEST_EMAIL);
    assert.strictEqual(res.body.profile.username, INITIAL_USERNAME);
  });

  // ----------------------------------------------------------
  // POST /api/profile/update
  // ----------------------------------------------------------
  it('should update the user profile fields', async function () {
    const res = await request(app)
      .post('/api/profile/update')
      .send({
        email: TEST_EMAIL,
        firstName: 'UpdatedName',
        bio: 'This is a test bio'
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.profile);
    assert.strictEqual(res.body.profile.firstName, 'UpdatedName');
    assert.strictEqual(res.body.profile.bio, 'This is a test bio');
  });

  // ----------------------------------------------------------
  // POST /api/profile/update-username
  // ----------------------------------------------------------
  it('should update the username', async function () {
    const res = await request(app)
      .post('/api/profile/update-username')
      .send({
        email: TEST_EMAIL,
        newUsername: UPDATED_USERNAME
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.username, UPDATED_USERNAME);
  });

  
  // ----------------------------------------------------------
  // POST /api/profile/update-password
  // ----------------------------------------------------------
  it('should update the password successfully', async function () {
    const res = await request(app)
      .post('/api/profile/update-password')
      .send({
        email: TEST_EMAIL,
        currentPassword: 'password123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      })
      .expect(200);

    assert.strictEqual(res.body.success, true);
  });

  it('should reject incorrect current password', async function () {
    const res = await request(app)
      .post('/api/profile/update-password')
      .send({
        email: TEST_EMAIL,
        currentPassword: 'wrongpassword',
        newPassword: 'newpassXYZ',
        confirmPassword: 'newpassXYZ'
      })
      .expect(401);

    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, 'Current password is incorrect');
  });
});
