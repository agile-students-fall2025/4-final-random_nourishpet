// controllers/mealPlanController.js

const MealPlan = require('../models/MealPlan');
const BiometricData = require('../models/BiometricData');
const User = require('../models/User');
const Groq = require('groq-sdk');

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Calculate daily calorie needs based on biometrics
const calculateDailyCalories = (biometrics, goal) => {
  if (!biometrics || !biometrics.heightCm || !biometrics.weightLbs || !biometrics.age) {
    return 2000; // Default
  }

  // BMR calculation using Mifflin-St Jeor Equation
  const heightCm = biometrics.heightCm;
  const weightKg = biometrics.weightLbs * 0.453592;
  const age = biometrics.age;
  const isMale = biometrics.sex === 'Male' || biometrics.sex === 'male';

  // BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age + (sex === 'male' ? 5 : -161)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr += isMale ? 5 : -161;

  // Activity multiplier (assuming moderate activity)
  const activityMultiplier = 1.55;
  let dailyCalories = bmr * activityMultiplier;

  // Adjust based on goal
  if (goal.includes('Weight Loss') || goal.includes('weight loss')) {
    dailyCalories = dailyCalories - 500; // 500 calorie deficit
  } else if (goal.includes('Muscle Gain') || goal.includes('muscle gain')) {
    dailyCalories = dailyCalories + 300; // 300 calorie surplus
  }

  return Math.round(dailyCalories);
};

// Generate meal plan using Groq
const generateMealPlanWithGroq = async (userData, biometrics, preferences) => {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('Groq API is not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const dailyCalories = calculateDailyCalories(biometrics, preferences.goal);

  // Build prompt for Groq
  const prompt = `Generate a ${preferences.duration} meal plan with the following requirements:

User Profile:
- Goal: ${preferences.goal}
- Daily Calorie Target: ${dailyCalories} calories
- Dietary Restrictions: ${preferences.restrictions || 'None'}
- Allergies: ${preferences.allergies || 'None'}
- Budget: $${preferences.budget || 'flexible'} per week
- Additional Notes: ${preferences.description || 'None'}

${biometrics ? `
Biometric Information:
- Age: ${biometrics.age || 'Not provided'}
- Sex: ${biometrics.sex || 'Not provided'}
- Height: ${biometrics.heightCm || 'Not provided'} cm
- Weight: ${biometrics.weightLbs || 'Not provided'} lbs
- BMI: ${biometrics.bmi || 'Not provided'}
` : ''}

Return a JSON object with this exact structure:
{
  "dailyCalories": ${dailyCalories},
  "schedule": [
    {
      "date": "MM/DD/YYYY",
      "meals": [
        {
          "type": "Breakfast",
          "name": "Meal name",
          "calories": 500,
          "description": "Brief description"
        }
      ],
      "totalCalories": 1800
    }
  ]
}

Generate meals for each day. Return ONLY valid JSON, no markdown, no code blocks.`;

  try {
    const completionParams = {
      model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are a nutritionist AI. Return ONLY valid JSON that can be parsed with JSON.parse(). No markdown, no code blocks, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    // Add JSON mode if supported
    if (model.includes('llama-3.1') || model.includes('llama3.1') || model.includes('mixtral')) {
      completionParams.response_format = { type: 'json_object' };
    }

    const completion = await groq.chat.completions.create(completionParams);
    const content = completion?.choices?.[0]?.message?.content;
    
    console.log('=== GROQ RESPONSE ===');
    console.log('Raw content length:', content?.length || 0);
    console.log('Raw content preview (first 500 chars):', content?.substring(0, 500) || 'No content');
    
    if (!content) {
      throw new Error('Groq returned empty content');
    }

    // Parse JSON - Groq should return valid JSON
    let mealPlanData;
    try {
      mealPlanData = JSON.parse(content);
      console.log('✓ Successfully parsed Groq JSON response');
    } catch (parseError) {
      console.error('✗ Failed to parse JSON directly, trying markdown extraction');
      // Try extracting from markdown if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        mealPlanData = JSON.parse(jsonMatch[1]);
        console.log('✓ Successfully extracted JSON from markdown');
      } else {
        console.error('✗ Failed to parse meal plan JSON');
        throw new Error('Failed to parse meal plan JSON');
      }
    }

    // Validate basic structure
    if (!mealPlanData.schedule || !Array.isArray(mealPlanData.schedule)) {
      console.error('✗ Invalid meal plan structure from AI');
      console.error('Meal plan data:', JSON.stringify(mealPlanData, null, 2).substring(0, 500));
      throw new Error('Invalid meal plan structure from AI');
    }

    console.log('✓ Groq response validated');
    console.log('Schedule entries:', mealPlanData.schedule.length);
    if (mealPlanData.schedule.length > 0) {
      console.log('First day date:', mealPlanData.schedule[0].date);
      console.log('First day meals:', mealPlanData.schedule[0].meals?.length || 0);
    }

    return mealPlanData;
  } catch (error) {
    console.error('Groq meal plan generation error:', error);
    throw error;
  }
};

// POST /api/meal-plans/generate
exports.generateMealPlan = async (req, res) => {
  try {
    const { email, goal, duration, restrictions, allergies, budget, description } = req.body;

    if (!email || !goal || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Email, goal, and duration are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user biometrics
    const biometrics = await BiometricData.findOne({ email: normalizedEmail });

    const preferences = {
      goal,
      duration,
      restrictions: restrictions || '',
      allergies: allergies || '',
      budget: budget || '',
      description: description || ''
    };

    // Generate meal plan using Groq
    console.log('=== GENERATING MEAL PLAN ===');
    console.log('Account:', normalizedEmail);
    console.log('Goal:', goal);
    console.log('Duration:', duration);
    console.log('Restrictions:', restrictions || 'None');
    console.log('Allergies:', allergies || 'None');
    
    let generatedPlan;
    try {
      generatedPlan = await generateMealPlanWithGroq(user, biometrics, preferences);
      console.log('✓ Meal plan generated successfully from Groq');
    } catch (error) {
      console.error('✗ Meal plan generation failed:', error.message);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate meal plan. Please try again later.'
      });
    }

    // Validate schedule exists
    if (!generatedPlan.schedule || !Array.isArray(generatedPlan.schedule)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid meal plan structure generated'
      });
    }

    // Calculate dates - always start from today
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const durationDays = parseInt(duration.match(/\d+/)?.[0] || '7');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);
    endDate.setHours(23, 59, 59, 999); // End of day

    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Clean and normalize schedule - ensure dates start from today
    const cleanSchedule = generatedPlan.schedule.map((day, index) => {
      // Always calculate date from startDate (today) + index days
      // This ensures meal plans always start from the generation date
      const d = new Date(startDate);
      d.setDate(d.getDate() + index);
      const dayDate = formatDate(d);

      // Ensure meals is an array of objects
      let meals = [];
      if (Array.isArray(day.meals)) {
        meals = day.meals
          .filter(meal => meal && typeof meal === 'object' && !Array.isArray(meal))
          .map(meal => ({
            type: String(meal.type || 'Meal'),
            name: String(meal.name || 'Unnamed'),
            calories: Number(meal.calories || 0),
            description: String(meal.description || '')
          }));
      }

      // Calculate total calories
      const totalCal = meals.reduce((sum, m) => sum + m.calories, 0);

      return {
        date: String(dayDate),
        meals: meals,
        totalCalories: Number(day.totalCalories || totalCal)
      };
    });

    // Save meal plan to database
    const mealPlan = new MealPlan({
      email: normalizedEmail,
      goal,
      duration,
      restrictions: preferences.restrictions,
      allergies: preferences.allergies,
      budget: preferences.budget,
      description: preferences.description,
      dailyCalories: generatedPlan.dailyCalories || calculateDailyCalories(biometrics, goal),
      schedule: cleanSchedule,
      startDate,
      endDate
    });

    await mealPlan.save();

    console.log('=== MEAL PLAN SAVED ===');
    console.log('✓ Successfully saved meal plan to database');
    console.log('Account:', normalizedEmail);
    console.log('Meal Plan ID:', mealPlan._id);
    console.log('Goal:', mealPlan.goal);
    console.log('Duration:', mealPlan.duration);
    console.log('Daily Calories:', mealPlan.dailyCalories);
    console.log('Schedule Days:', mealPlan.schedule.length);
    console.log('Start Date:', mealPlan.startDate);
    console.log('End Date:', mealPlan.endDate);
    if (mealPlan.schedule.length > 0) {
      console.log('First Schedule Date:', mealPlan.schedule[0].date);
      console.log('First Day Meals:', mealPlan.schedule[0].meals?.length || 0);
    }

    res.json({
      success: true,
      message: 'Meal plan generated successfully',
      mealPlan: {
        id: mealPlan._id,
        goal: mealPlan.goal,
        duration: mealPlan.duration,
        dailyCalories: mealPlan.dailyCalories,
        schedule: mealPlan.schedule,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate
      }
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/meal-plans/:email
exports.getMealPlan = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get the most recent meal plan
    const mealPlan = await MealPlan.findOne({ email: normalizedEmail })
      .sort({ createdAt: -1 });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'No meal plan found'
      });
    }

    res.json({
      success: true,
      mealPlan: {
        id: mealPlan._id,
        goal: mealPlan.goal,
        duration: mealPlan.duration,
        dailyCalories: mealPlan.dailyCalories,
        schedule: mealPlan.schedule,
        startDate: mealPlan.startDate,
        endDate: mealPlan.endDate,
        createdAt: mealPlan.createdAt
      }
    });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
