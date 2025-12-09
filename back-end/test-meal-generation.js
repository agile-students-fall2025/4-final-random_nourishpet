// Local test script for meal plan generation
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const BiometricData = require('./models/BiometricData');
const MealPlan = require('./models/MealPlan');
const { generateMealPlan } = require('./controllers/mealPlanController');

async function testMealGeneration() {
  try {
    console.log('=== MEAL PLAN GENERATION TEST ===\n');
    
    // Connect to database
    console.log('1. Connecting to database...');
    await connectDB();
    console.log('   ✓ Connected\n');
    
    // Setup test user
    const testEmail = `test-meal-${Date.now()}@example.com`;
    const testPassword = 'test123';
    console.log(`2. Creating test user: ${testEmail}`);
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await User.create({
      email: testEmail,
      username: `testuser${Date.now()}`,
      password: hashedPassword
    });
    console.log('   ✓ User created\n');
    
    // Setup biometrics
    console.log('3. Setting up biometric data...');
    await BiometricData.findOneAndUpdate(
      { email: testEmail },
      {
        email: testEmail,
        heightCm: 175,
        weightLbs: 150,
        age: 25,
        sex: 'Male',
        bmi: 22.5
      },
      { upsert: true }
    );
    console.log('   ✓ Biometrics set\n');
    
    // Test meal plan generation
    console.log('4. Generating meal plan...');
    const mockReq = {
      body: {
        email: testEmail,
        goal: 'Weight Loss',
        duration: '3-Day Plan',
        restrictions: 'kosher',
        allergies: 'nuts',
        budget: '1000',
        description: 'high protein'
      }
    };
    
    let result = null;
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          result = { status: code, data };
        }
      }),
      json: (data) => {
        result = { status: 200, data };
      }
    };
    
    await generateMealPlan(mockReq, mockRes);
    
    if (result && result.data && result.data.success) {
      console.log('   ✓ Meal plan generated successfully!\n');
      console.log('5. Generated meal plan details:');
      console.log(`   - Goal: ${result.data.mealPlan.goal}`);
      console.log(`   - Duration: ${result.data.mealPlan.duration}`);
      console.log(`   - Daily Calories: ${result.data.mealPlan.dailyCalories}`);
      console.log(`   - Schedule Days: ${result.data.mealPlan.schedule.length}`);
      
      if (result.data.mealPlan.schedule.length > 0) {
        const firstDay = result.data.mealPlan.schedule[0];
        console.log(`   - Day 1 Date: ${firstDay.date}`);
        console.log(`   - Day 1 Meals: ${firstDay.meals.length}`);
        if (firstDay.meals.length > 0) {
          console.log(`   - First Meal: ${firstDay.meals[0].name} (${firstDay.meals[0].type})`);
          console.log(`     Calories: ${firstDay.meals[0].calories}`);
        }
      }
      console.log('');
      
      // Verify saved to database
      console.log('6. Verifying database save...');
      const savedPlan = await MealPlan.findById(result.data.mealPlan.id);
      if (savedPlan) {
        console.log('   ✓ Meal plan saved to database');
        console.log(`   - Database ID: ${savedPlan._id}`);
        console.log(`   - Schedule entries: ${savedPlan.schedule.length}`);
        if (savedPlan.schedule[0] && savedPlan.schedule[0].meals) {
          console.log(`   - First day meals count: ${savedPlan.schedule[0].meals.length}`);
          if (savedPlan.schedule[0].meals[0]) {
            console.log(`   - First meal type: ${typeof savedPlan.schedule[0].meals[0]}`);
            console.log(`   - First meal is object: ${typeof savedPlan.schedule[0].meals[0] === 'object'}`);
          }
        }
      } else {
        console.log('   ✗ Meal plan not found in database');
      }
      console.log('');
      
      // Cleanup
      console.log('7. Cleaning up test data...');
      await MealPlan.deleteOne({ _id: result.data.mealPlan.id });
      await BiometricData.deleteOne({ email: testEmail });
      await User.deleteOne({ email: testEmail });
      console.log('   ✓ Cleanup complete\n');
      
      console.log('=== TEST PASSED ===');
      process.exit(0);
    } else {
      console.log('   ✗ Meal plan generation failed');
      console.log(`   Error: ${result ? result.data.message : 'Unknown error'}`);
      
      // Cleanup on failure
      await User.deleteOne({ email: testEmail }).catch(() => {});
      await BiometricData.deleteOne({ email: testEmail }).catch(() => {});
      
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    if (error.errors) {
      console.error('\nValidation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

testMealGeneration();

