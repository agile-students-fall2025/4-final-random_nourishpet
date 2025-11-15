const request = require('supertest');
const assert = require('chai').assert;
const app = require('../server');

describe('Activities, Socials, and Streak API Tests', () => {
  
  describe('POST /api/activities', () => {
    const validActivityData = {
      activityType: 'cardio',
      timeSpent: '30',
      imageName: 'workout.jpg',
      imageType: 'image/jpeg'
    };

    it('should successfully log an activity with all fields', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send(validActivityData)
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Activity logged successfully');
    });

    it('should successfully log an activity with only required fields', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'running',
          timeSpent: '60'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Activity logged successfully');
    });

    it('should successfully log an activity with null image fields', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'yoga',
          timeSpent: '45',
          imageName: null,
          imageType: null
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept all valid activity types', async () => {
      const activityTypes = ['cardio', 'strength', 'yoga', 'running', 'cycling', 'swimming'];
      
      for (const type of activityTypes) {
        const res = await request(app)
          .post('/api/activities')
          .send({
            activityType: type,
            timeSpent: '30'
          })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept all valid time spent values', async () => {
      const timeValues = ['15', '30', '45', '60', '90', '120'];
      
      for (const time of timeValues) {
        const res = await request(app)
          .post('/api/activities')
          .send({
            activityType: 'cardio',
            timeSpent: time
          })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should return 400 if activityType is missing', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          timeSpent: '30'
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Activity type and time spent are required');
    });

    it('should return 400 if timeSpent is missing', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cardio'
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Activity type and time spent are required');
    });

    it('should return 400 if both activityType and timeSpent are missing', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({})
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Activity type and time spent are required');
    });

    it('should return 400 if activityType is empty string', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: '',
          timeSpent: '30'
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
    });

    it('should return 400 if timeSpent is empty string', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cardio',
          timeSpent: ''
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
    });

    it('should handle imageName as optional field', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'strength',
          timeSpent: '45',
          imageType: 'image/png'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should handle imageType as optional field', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send({
          activityType: 'cycling',
          timeSpent: '60',
          imageName: 'bike_ride.jpg'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should handle empty request body gracefully', async () => {
      const res = await request(app)
        .post('/api/activities')
        .send()
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('POST /api/streak', () => {
    const validStreakMessage = "I'm on a #-day streak with NourishPet! Take care of your pet, take care of yourself.";

    it('should successfully log a streak message', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: validStreakMessage })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Streak message logged');
    });

    it('should accept any non-empty message string', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: 'Custom streak message!' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept a long message', async () => {
      const longMessage = 'A'.repeat(500);
      const res = await request(app)
        .post('/api/streak')
        .send({ message: longMessage })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept a short message', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: 'Hi' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should return 400 if message is missing', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({})
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Message is required');
    });

    it('should return 400 if message is null', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: null })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Message is required');
    });

    it('should return 400 if message is undefined', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: undefined })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Message is required');
    });

    it('should return 400 if message is empty string', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: '' })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Message is required');
    });

    it('should handle empty request body', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send()
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Message is required');
    });

    it('should accept message with special characters', async () => {
      const specialMessage = "I'm on a #7-day streak! 🎉 Take care of your pet, take care of yourself. #NourishPet";
      const res = await request(app)
        .post('/api/streak')
        .send({ message: specialMessage })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept message with numbers and symbols', async () => {
      const res = await request(app)
        .post('/api/streak')
        .send({ message: 'Day 42 of my streak! 100% committed!' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });
  });
});
