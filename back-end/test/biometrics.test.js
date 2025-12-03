const request = require('supertest');
const { expect } = require('chai');
const bmiService = require('../services/bmiService');

before(() => {
  if (bmiService && typeof bmiService.calculateBMI === 'function') {
    bmiService.calculateBMI = async () => ({ bmi: 24.42, source: 'test' });
  }
});

const app = require('../server');

describe('Biometrics API Tests', () => {
  const baseUser = {
    firstName: 'Bio',
    lastName: 'Test',
    username: `biouser${Date.now()}`,
    email: `bio${Date.now()}@example.com`,
    dateOfBirth: '1990-01-01',
    password: 'password123',
    confirmPassword: 'password123',
  };

  before(async () => {
    await request(app).post('/api/auth/signup').send(baseUser);
  });

  describe('POST /api/biometrics/update', () => {
    it('creates a biometric record and calculates BMI', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          email: baseUser.email,
          height: 180,
          weight: 150,
          ethnicity: 'Asian',
          sex: 'Male',
          age: 30,
        })
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.biometrics).to.include({
        email: baseUser.email.toLowerCase(),
        heightCm: 180,
        weightLbs: 150,
        ethnicity: 'Asian',
        sex: 'Male',
        age: 30,
      });
      expect(res.body.biometrics).to.have.property('bmi');
    });

    it('updates an existing record with partial data', async () => {
      const updateResponse = await request(app)
        .post('/api/biometrics/update')
        .send({
          email: baseUser.email,
          age: 31,
        })
        .expect(200);

      expect(updateResponse.body.success).to.be.true;
      expect(updateResponse.body.biometrics.age).to.equal(31);
      expect(updateResponse.body.biometrics.heightCm).to.equal(180);
      expect(updateResponse.body.biometrics.weightLbs).to.equal(150);
    });

    it('rejects requests without an email', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: 180,
          weight: 150,
        })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Email is required');
    });

    it('rejects requests without height and weight for new records', async () => {
      const tempUser = {
        firstName: 'Temp',
        lastName: 'User',
        username: `tempuser${Date.now()}`,
        email: `temp${Date.now()}@example.com`,
        dateOfBirth: '1992-02-02',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await request(app).post('/api/auth/signup').send(tempUser);

      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          email: tempUser.email,
          age: 25,
        })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Height (cm) and weight (lbs) are required');
    });

    it('validates numeric inputs', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          email: baseUser.email,
          height: 'invalid',
          weight: 150,
        })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('Height must be a numeric value in centimeters');
    });

    it('returns 404 for unknown users', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          email: 'missing@example.com',
          height: 170,
          weight: 150,
        })
        .expect(404);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.equal('User not found');
    });
  });

  describe('GET /api/biometrics/:email', () => {
    it('retrieves the stored biometrics', async () => {
      const res = await request(app)
        .get(`/api/biometrics/${encodeURIComponent(baseUser.email)}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.biometrics.email).to.equal(baseUser.email.toLowerCase());
      expect(res.body.biometrics.heightCm).to.equal(180);
      expect(res.body.biometrics.weightLbs).to.equal(150);
    });

    it('returns 404 when no biometrics are stored', async () => {
      const res = await request(app)
        .get('/api/biometrics/unknown@example.com')
        .expect(404);

      expect(res.body.success).to.be.false;
    });
  });
});
