const request = require('supertest');
const assert = require('chai').assert;
const app = require('../server');

describe('Biometrics API Tests', () => {
  
  describe('POST /api/biometrics/update', () => {
    const validBiometricData = {
      height: '5\'10"',
      weight: '70kg',
      bmi: '22.5',
      ethnicity: 'Asian',
      gender: 'Male',
      age: '30'
    };

    it('should successfully log biometric data with all fields', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send(validBiometricData)
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Biometric data logged');
    });

    it('should successfully log biometric data with only height', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ height: '180cm' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with only weight', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ weight: '154lbs' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with only bmi', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ bmi: '24.0' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with only ethnicity', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ ethnicity: 'White' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with only gender', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ gender: 'Female' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with only age', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({ age: '25' })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should successfully log biometric data with multiple fields', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: '175cm',
          weight: '68kg',
          age: '28'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept empty string values for fields', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: '',
          weight: '',
          bmi: '',
          ethnicity: '',
          gender: '',
          age: ''
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept various height formats', async () => {
      const heightFormats = ['5\'10"', '180cm', '180 cm', '70 inches', '1.8m'];
      
      for (const height of heightFormats) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ height })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept various weight formats', async () => {
      const weightFormats = ['70kg', '70 kg', '154lbs', '154 lbs', '11 stone'];
      
      for (const weight of weightFormats) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ weight })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept all valid ethnicity options', async () => {
      const ethnicities = ['Asian', 'Black', 'Hispanic', 'White', 'Native American', 'Pacific Islander', 'Other'];
      
      for (const ethnicity of ethnicities) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ ethnicity })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept all valid gender options', async () => {
      const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
      
      for (const gender of genders) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ gender })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept numeric age values', async () => {
      const ages = ['18', '25', '50', '100'];
      
      for (const age of ages) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ age })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should accept numeric BMI values', async () => {
      const bmis = ['18.5', '22.0', '25.5', '30.0'];
      
      for (const bmi of bmis) {
        const res = await request(app)
          .post('/api/biometrics/update')
          .send({ bmi })
          .expect(200);
        
        assert.strictEqual(res.body.success, true);
      }
    });

    it('should return 400 if no biometric data is provided', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({})
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'No biometric data provided');
    });

    it('should return 400 if all fields are null', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: null,
          weight: null,
          bmi: null,
          ethnicity: null,
          gender: null,
          age: null
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'No biometric data provided');
    });

    it('should return 400 if all fields are undefined', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: undefined,
          weight: undefined,
          bmi: undefined,
          ethnicity: undefined,
          gender: undefined,
          age: undefined
        })
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'No biometric data provided');
    });

    it('should handle empty request body', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send()
        .expect(400);
      
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'No biometric data provided');
    });

    it('should accept partial updates with some fields missing', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: '6\'0"',
          weight: '80kg'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should handle mixed null and valid values', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: null,
          weight: '75kg',
          bmi: null,
          age: '35'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should accept whitespace-only strings as valid empty strings', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: '   ',
          weight: '70kg'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should handle very long string values', async () => {
      const longString = 'A'.repeat(1000);
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: longString,
          weight: '70kg'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });

    it('should handle special characters in text fields', async () => {
      const res = await request(app)
        .post('/api/biometrics/update')
        .send({
          height: '5\'10"',
          weight: '70kg',
          ethnicity: 'Mixed/Other'
        })
        .expect(200);
      
      assert.strictEqual(res.body.success, true);
    });
  });
});
