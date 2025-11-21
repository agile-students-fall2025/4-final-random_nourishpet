const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Main Screen API Tests', () => {
  
  let testUserEmail = 'mainscreen@example.com';
  let testUsername = 'mainscreenuser';

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

  describe('GET /api/main-screen/:email', () => {
    it('should return main screen data for valid user', async () => {
      const res = await request(app)
        .get(`/api/main-screen/${testUserEmail}`)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.have.property('user');
      expect(res.body.data).to.have.property('pet');
      expect(res.body.data).to.have.property('streak');
      expect(res.body.data.user).to.have.property('username', testUsername);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/main-screen/nonexistent@example.com')
        .expect(404);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User not found');
    });

    it('should return pet data with correct structure', async () => {
      const res = await request(app)
        .get(`/api/main-screen/${testUserEmail}`)
        .expect(200);
      
      expect(res.body.data.pet).to.have.property('petImage');
      expect(res.body.data.pet).to.have.property('petName');
      expect(res.body.data.pet).to.have.property('petType');
      expect(res.body.data.pet).to.have.property('happiness');
      expect(res.body.data.pet).to.have.property('health');
    });

    it('should return streak data with correct structure', async () => {
      const res = await request(app)
        .get(`/api/main-screen/${testUserEmail}`)
        .expect(200);
      
      expect(res.body.data.streak).to.have.property('currentStreak');
      expect(res.body.data.streak).to.have.property('longestStreak');
      expect(res.body.data.streak).to.have.property('lastLogDate');
    });

    it('should return user data with username and profile picture', async () => {
      const res = await request(app)
        .get(`/api/main-screen/${testUserEmail}`)
        .expect(200);
      
      expect(res.body.data.user).to.have.property('username');
      expect(res.body.data.user).to.have.property('profilePicture');
    });
  });
});