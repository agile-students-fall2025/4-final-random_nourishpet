const assert = require('chai').assert;
const request = require('supertest');
beforeEach(() => {
  if (app.locals) {
    if (app.locals.users) app.locals.users.length = 0;
    if (app.locals.meals) app.locals.meals.length = 0;
  }
});
const app = require('../server'); //import app

describe('NourishPet API', function () {
  // Meal routes
  describe('Meal Routes', function () {
    const testEmail = 'testmeals@example.com';

    // Create a test user first
    before(async function () {
      await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Test',
          lastName: 'User',
          username: `testuser${Date.now()}`,
          email: testEmail,
          dateOfBirth: '1990-01-01',
          password: 'password123',
          confirmPassword: 'password123'
        });
    });

    it('should add a new meal', async function () {
      const res = await request(app)
        .post('/api/meals')
        .send({ 
          email: testEmail,
          name: 'Chicken Wrap', 
          calories: 450, 
          date: '11/12/2025' 
        });

      assert.strictEqual(res.status, 201);
      assert.isTrue(res.body.success);
      assert.strictEqual(res.body.meal.name, 'Chicken Wrap');
      assert.strictEqual(res.body.meal.calories, 450);
    });

    it('should reject invalid meal (missing name)', async function () {
      const res = await request(app)
        .post('/api/meals')
        .send({ 
          email: testEmail,
          calories: 100 
        });
      assert.strictEqual(res.status, 400);
      assert.isFalse(res.body.success);
      assert.strictEqual(res.body.message, 'Meal name and calories are required.');
    });

    it('should return a list of meals', async function () {
      const res = await request(app).get(`/api/meals/${testEmail}`);
      assert.strictEqual(res.status, 200);
      assert.isTrue(res.body.success);
      assert.isArray(res.body.meals);
      if (res.body.meals.length > 0) {
        assert.property(res.body.meals[0], 'name');
      }
    });

    it('should filter meals by date', async function () {
      const res = await request(app).get(`/api/meals/${testEmail}?date=11/12/2025`);
      assert.strictEqual(res.status, 200);
      assert.isTrue(res.body.success);
      assert.isArray(res.body.meals);
      res.body.meals.forEach((m) => {
        assert.strictEqual(m.date, '11/12/2025');
      });
    });
  });
});
