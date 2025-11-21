const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Update Username API Tests', () => {
  
  let testUserEmail = 'updateusername@example.com';
  let testUsername = 'updateusernameuser';

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

  describe('POST /api/profile/update-username', () => {
    it('should update username successfully with valid data', async () => {
      const newUsername = 'updatedusername';
      const res = await request(app)
        .post('/api/profile/update-username')
        .send({
          email: testUserEmail,
          newUsername: newUsername
        })
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Username updated successfully');
      expect(res.body).to.have.property('username', newUsername);
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/profile/update-username')
        .send({
          newUsername: 'someusername'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email and new username are required');
    });

    it('should return 400 if newUsername is missing', async () => {
      const res = await request(app)
        .post('/api/profile/update-username')
        .send({
          email: testUserEmail
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email and new username are required');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/profile/update-username')
        .send({
          email: 'nonexistent@example.com',
          newUsername: 'someusername'
        })
        .expect(404);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User not found');
    });

    it('should return 409 if username already exists', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Try to change first user's username to the existing username
      const res = await request(app)
        .post('/api/profile/update-username')
        .send({
          email: testUserEmail,
          newUsername: 'existinguser'
        })
        .expect(409);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Username already taken');
    });

    it('should persist username update across profile requests', async () => {
      const uniqueUsername = 'uniqueuser' + Date.now();
      
      await request(app)
        .post('/api/profile/update-username')
        .send({
          email: testUserEmail,
          newUsername: uniqueUsername
        })
        .expect(200);
      
      // Verify the update persisted in profile
      const profileRes = await request(app)
        .get(`/api/profile/${testUserEmail}`)
        .expect(200);
      
      expect(profileRes.body.profile.username).to.equal(uniqueUsername);
    });

    it('should update username in both users array and userProfiles', async () => {
      const anotherUsername = 'anotheruser' + Date.now();
      
      await request(app)
        .post('/api/profile/update-username')
        .send({
          email: testUserEmail,
          newUsername: anotherUsername
        })
        .expect(200);
      
      // Verify in main screen (uses users array)
      const mainScreenRes = await request(app)
        .get(`/api/main-screen/${testUserEmail}`)
        .expect(200);
      
      expect(mainScreenRes.body.data.user.username).to.equal(anotherUsername);
    });
  });
});