const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Profile API Tests', () => {
  
  let testUserEmail = 'profile@example.com';
  let testUsername = 'profileuser';

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

  describe('GET /api/profile/:email', () => {
    it('should return profile data for valid user', async () => {
      const res = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('profile');
      expect(res.body.profile).to.have.property('firstName');
      expect(res.body.profile).to.have.property('lastName');
      expect(res.body.profile).to.have.property('email', testUserEmail);
      expect(res.body.profile).to.have.property('username', testUsername);
      expect(res.body.profile).to.have.property('bio');
      expect(res.body.profile).to.have.property('profilePicture');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/profile/nonexistent@example.com')
        .expect(404);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User not found');
    });

    it('should return empty strings for unset profile fields', async () => {
      const res = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      expect(res.body.profile.firstName).to.equal('');
      expect(res.body.profile.lastName).to.equal('');
      expect(res.body.profile.bio).to.equal('');
    });

    it('should include all required profile fields', async () => {
      const res = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      const requiredFields = ['firstName', 'lastName', 'email', 'dateOfBirth', 'username', 'bio', 'profilePicture'];
      requiredFields.forEach(field => {
        expect(res.body.profile).to.have.property(field);
      });
    });
  });
});