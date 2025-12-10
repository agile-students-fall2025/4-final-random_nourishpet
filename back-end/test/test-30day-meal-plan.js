// Test script specifically for 30-day meal plan generation
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const BiometricData = require('../models/BiometricData');
const MealPlan = require('../models/MealPlan');
const { generateMealPlan, getMealPlan } = require('../controllers/mealPlanController');

async function test30DayMealPlan() {
  try {
    console.log('=== 30-DAY MEAL PLAN GENERATION TEST ===\n');
    
    // Connect to database
    console.log('1. Connecting to database...');
    await connectDB();
    console.log('   ✓ Connected\n');
    
    // Setup test user
    const testEmail = `test-30day-${Date.now()}@example.com`;
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
    
    // Test 30-day meal plan generation
    console.log('4. Generating 30-day meal plan...');
    const mockReq = {
      body: {
        email: testEmail,
        goal: 'Weight Loss',
        duration: '30-Day Plan',
        restrictions: 'none',
        allergies: 'none',
        budget: '100',
        description: 'balanced nutrition'
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
      
      const plan = result.data.mealPlan;
      const scheduleLength = plan.schedule ? plan.schedule.length : 0;
      
      console.log('5. Generated meal plan details:');
      console.log(`   - Goal: ${plan.goal}`);
      console.log(`   - Duration: ${plan.duration}`);
      console.log(`   - Daily Calories: ${plan.dailyCalories}`);
      console.log(`   - Schedule Days: ${scheduleLength}`);
      
      // Verify we got 30 days
      if (scheduleLength === 30) {
        console.log('   ✓ Correct number of days (30)\n');
      } else {
        console.log(`   ✗ Expected 30 days, got ${scheduleLength}\n`);
        throw new Error(`Schedule length mismatch: expected 30, got ${scheduleLength}`);
      }
      
      // Verify dates are sequential and start from today
      if (plan.schedule && plan.schedule.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDateStr = plan.schedule[0].date;
        const [firstMonth, firstDay, firstYear] = firstDateStr.split('/').map(Number);
        const firstDate = new Date(firstYear, firstMonth - 1, firstDay);
        firstDate.setHours(0, 0, 0, 0);
        
        console.log('6. Verifying date sequence...');
        console.log(`   - First date: ${firstDateStr}`);
        console.log(`   - Today: ${today.toLocaleDateString('en-US')}`);
        
        if (Math.abs(firstDate - today) < 24 * 60 * 60 * 1000) { // Within 1 day
          console.log('   ✓ First date matches today\n');
        } else {
          console.log(`   ✗ First date doesn't match today\n`);
          throw new Error(`Date mismatch: first date is ${firstDateStr}, today is ${today.toLocaleDateString('en-US')}`);
        }
        
        // Check last date
        const lastDateStr = plan.schedule[plan.schedule.length - 1].date;
        console.log(`   - Last date: ${lastDateStr}`);
        
        // Verify dates are sequential
        let allSequential = true;
        for (let i = 1; i < plan.schedule.length; i++) {
          const prevDateStr = plan.schedule[i - 1].date;
          const currDateStr = plan.schedule[i].date;
          const [prevMonth, prevDay, prevYear] = prevDateStr.split('/').map(Number);
          const [currMonth, currDay, currYear] = currDateStr.split('/').map(Number);
          const prevDate = new Date(prevYear, prevMonth - 1, prevDay);
          const currDate = new Date(currYear, currMonth - 1, currDay);
          const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays !== 1) {
            console.log(`   ✗ Date gap at index ${i}: ${prevDateStr} -> ${currDateStr} (${diffDays} days)`);
            allSequential = false;
          }
        }
        
        if (allSequential) {
          console.log('   ✓ All dates are sequential\n');
        } else {
          throw new Error('Dates are not sequential');
        }
        
        // Verify each day has meals
        console.log('7. Verifying meal structure...');
        let allHaveMeals = true;
        for (let i = 0; i < Math.min(5, plan.schedule.length); i++) {
          const day = plan.schedule[i];
          if (!day.meals || day.meals.length === 0) {
            console.log(`   ✗ Day ${i + 1} (${day.date}) has no meals`);
            allHaveMeals = false;
          } else {
            console.log(`   ✓ Day ${i + 1} (${day.date}): ${day.meals.length} meals`);
          }
        }
        
        if (allHaveMeals) {
          console.log('   ✓ All checked days have meals\n');
        }
      }
      
      // Verify saved to database
      console.log('8. Verifying database save...');
      const savedPlan = await MealPlan.findOne({ email: testEmail }).sort({ createdAt: -1 });
      if (savedPlan) {
        console.log('   ✓ Meal plan saved to database');
        console.log(`   - Database ID: ${savedPlan._id}`);
        console.log(`   - Schedule entries: ${savedPlan.schedule.length}`);
        
        if (savedPlan.schedule.length === 30) {
          console.log('   ✓ Database has correct number of days (30)\n');
        } else {
          console.log(`   ✗ Database has ${savedPlan.schedule.length} days, expected 30\n`);
          throw new Error(`Database schedule length mismatch: expected 30, got ${savedPlan.schedule.length}`);
        }
      } else {
        console.log('   ✗ Meal plan not found in database');
        throw new Error('Meal plan not found in database');
      }
      
      // Test retrieval via API
      console.log('9. Testing meal plan retrieval...');
      const getReq = { params: { email: testEmail } };
      let getResult = null;
      const getRes = {
        json: (data) => {
          getResult = data;
        },
        status: (code) => ({
          json: (data) => {
            getResult = { status: code, ...data };
          }
        })
      };
      
      await getMealPlan(getReq, getRes);
      
      if (getResult && getResult.success && getResult.mealPlan) {
        const retrievedScheduleLength = getResult.mealPlan.schedule ? getResult.mealPlan.schedule.length : 0;
        console.log(`   ✓ Meal plan retrieved successfully`);
        console.log(`   - Retrieved schedule length: ${retrievedScheduleLength}`);
        
        if (retrievedScheduleLength === 30) {
          console.log('   ✓ Retrieved plan has correct number of days (30)\n');
        } else {
          console.log(`   ✗ Retrieved plan has ${retrievedScheduleLength} days, expected 30\n`);
          throw new Error(`Retrieved schedule length mismatch: expected 30, got ${retrievedScheduleLength}`);
        }
      } else {
        console.log('   ✗ Failed to retrieve meal plan');
        throw new Error('Failed to retrieve meal plan');
      }
      
      // Cleanup
      console.log('10. Cleaning up test data...');
      await MealPlan.deleteMany({ email: testEmail });
      await BiometricData.deleteOne({ email: testEmail });
      await User.deleteOne({ email: testEmail });
      console.log('   ✓ Cleanup complete\n');
      
      console.log('=== TEST PASSED ===');
      process.exit(0);
    } else {
      console.log('   ✗ Meal plan generation failed');
      console.log(`   Error: ${result ? result.data.message : 'Unknown error'}`);
      if (result && result.data) {
        console.log('   Response:', JSON.stringify(result.data, null, 2));
      }
      
      // Cleanup on failure
      await User.deleteOne({ email: testEmail }).catch(() => {});
      await BiometricData.deleteOne({ email: testEmail }).catch(() => {});
      await MealPlan.deleteMany({ email: testEmail }).catch(() => {});
      
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

test30DayMealPlan();

