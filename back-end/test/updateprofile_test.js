const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Update Profile API Tests', () => {
  
  let testUserEmail = 'updateprofile@example.com';
  let testUsername = 'updateprofileuser';

  before(async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        username: testUsername,
        email: testUserEmail,
        password: 'password123',
        confirmPassword: 'password123'
      });
  });

  describe('POST /api/profile/update', () => {
    it('should update profile successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/profile/update')
        .send({
          email: testUserEmail,
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          bio: 'Test bio'
        })
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Profile updated successfully');
      expect(res.body).to.have.property('profile');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/profile/update')
        .send({
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email is required');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/profile/update')
        .send({
          email: 'nonexistent@example.com',
          firstName: 'John'
        })
        .expect(404);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User not found');
    });

    it('should update only provided fields', async () => {
      const res = await request(app)
        .post('/api/profile/update')
        .send({
          email: testUserEmail,
          firstName: 'Jane'
        })
        .expect(200);
      
      expect(res.body.success).to.be.true;
      
      // Verify the update persisted
      const profileRes = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      expect(profileRes.body.profile.firstName).to.equal('Jane');
    });

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .post('/api/profile/update')
        .send({
          email: testUserEmail,
          firstName: 'Alice',
          lastName: 'Smith',
          bio: 'Software developer'
        })
        .expect(200);
      
      expect(res.body.success).to.be.true;
      
      // Verify all updates persisted
      const profileRes = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      expect(profileRes.body.profile.firstName).to.equal('Alice');
      expect(profileRes.body.profile.lastName).to.equal('Smith');
      expect(profileRes.body.profile.bio).to.equal('Software developer');
    });
  });
});