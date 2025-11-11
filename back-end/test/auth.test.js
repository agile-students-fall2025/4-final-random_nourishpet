const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Authentication API Tests', () => {
  
  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(res.body).to.have.property('status', 'ok');
      expect(res.body).to.have.property('message');
    });
  });

  describe('POST /api/auth/signup', () => {
    const validSignUpData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    it('should successfully create a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validSignUpData)
        .expect(201);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'User created successfully');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('username', validSignUpData.username);
      expect(res.body.user).to.have.property('email', validSignUpData.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test2@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'All fields are required');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser2',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'All fields are required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser3',
          email: 'test3@example.com',
          confirmPassword: 'password123'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'All fields are required');
    });

    it('should return 400 if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser4',
          email: 'test4@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Passwords do not match');
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser5',
          email: 'test5@example.com',
          password: '12345',
          confirmPassword: '12345'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Password must be at least 6 characters long');
    });

    it('should return 409 if user with same email already exists', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'uniqueuser',
          email: 'duplicate@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Try to signup again with same email
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'anotheruser',
          email: 'duplicate@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(409);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User with this email or username already exists');
    });

    it('should return 409 if user with same username already exists', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'duplicateusername',
          email: 'user1@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });

      // Try to signup again with same username
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'duplicateusername',
          email: 'user2@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        })
        .expect(409);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'User with this email or username already exists');
    });
  });

  describe('POST /api/auth/signin', () => {
    // Create a test user before running signin tests
    before(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'signinuser',
          email: 'signin@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        });
    });

    it('should successfully sign in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('message', 'Sign in successful');
      expect(res.body.user).to.have.property('email', 'signin@example.com');
      expect(res.body.user).to.not.have.property('password');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          password: 'password123'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com'
        })
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Email and password are required');
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'signin@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Invalid email or password');
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users without passwords', async () => {
      const res = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.an('array');
      
      // Verify no passwords are included
      res.body.users.forEach(user => {
        expect(user).to.not.have.property('password');
      });
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('message', 'Route not found');
    });
  });
});

