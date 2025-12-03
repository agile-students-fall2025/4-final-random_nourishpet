const request = require('supertest');
const assert = require('assert');
const app = require('../server'); // adjust path if needed

describe('POST /api/streak', () => {

  it('should log a streak message successfully with valid input', async () => {
    const response = await request(app)
      .post('/api/streak')
      .send({ message: 'Just hit a 5-day streak!' })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.message, 'Streak message logged');
  });

  it('should fail when message is missing', async () => {
    const response = await request(app)
      .post('/api/streak')
      .send({ })                      // missing "message"
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.ok(response.body.message); // validator should provide error text
  });

  it('should fail when message is an empty string', async () => {
    const response = await request(app)
      .post('/api/streak')
      .send({ message: '' })
      .expect(400);

    assert.strictEqual(response.body.success, false);
    assert.ok(response.body.message);
  });

});
