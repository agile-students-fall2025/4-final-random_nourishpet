// test/mainScreen.test.js

const request = require('supertest');
const { expect, assert } = require('chai');
const app = require('../server');

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const PetData = require('../models/PetData');
const StreakData = require('../models/StreakData');

describe('GET /api/main-screen/:email', () => {

  beforeEach(async () => {
    await User.deleteMany({});
    await UserProfile.deleteMany({});
    await PetData.deleteMany({});
    await StreakData.deleteMany({});
  });

  it('should return main screen data for an existing user', async () => {
    const email = 'test@example.com';

    await User.create({
      email,
      username: 'tester',
      password: '123456'
    });

    await UserProfile.create({
      email,
      username: 'tester',
      profilePicture: '/custom.png'
    });

    await PetData.create({
      email,
      petName: 'Buddy'
    });

    await StreakData.create({
      email,
      currentStreak: 5,
    });

    const res = await request(app)
      .get(`/api/main-screen/${email}`)
      .expect(200);

    // Assertions
    assert.isTrue(res.body.success);

    assert.equal(res.body.data.user.username, 'tester');
    assert.equal(res.body.data.user.profilePicture, '/custom.png');

    assert.equal(res.body.data.pet.petName, 'Buddy');
    assert.equal(res.body.data.streak.currentStreak, 5);
  });

  it('should use default profile picture when none exists', async () => {
    const email = 'noprofile@example.com';

    await User.create({
      email,
      username: 'noprof',
      password: 'pass'
    });

    // No UserProfile created

    const res = await request(app)
      .get(`/api/main-screen/${email}`)
      .expect(200);

    assert.isTrue(res.body.success);

    assert.equal(res.body.data.user.username, 'noprof');
    assert.equal(res.body.data.user.profilePicture, '/user.png'); // default
  });

  it('should return empty objects for pet and streak when missing', async () => {
    const email = 'empty@example.com';

    await User.create({
      email,
      username: 'emptyuser',
      password: 'pass'
    });

    // No UserProfile, no PetData, no StreakData

    const res = await request(app)
      .get(`/api/main-screen/${email}`)
      .expect(200);

    assert.isTrue(res.body.success);

    assert.equal(res.body.data.user.username, 'emptyuser');
    assert.deepEqual(res.body.data.pet, {});
    assert.deepEqual(res.body.data.streak, {});
  });

  it('should return 404 when user does not exist', async () => {
    const res = await request(app)
      .get('/api/main-screen/nonexistent@example.com')
      .expect(404);

    assert.isFalse(res.body.success);
    assert.equal(res.body.message, 'User not found');
  });
});
