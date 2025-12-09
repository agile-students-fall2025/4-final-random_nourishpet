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

Please generate a detailed meal plan in JSON format with the following EXACT structure (use double quotes, proper JSON syntax):
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
        },
        {
          "type": "Lunch",
          "name": "Meal name",
          "calories": 600,
          "description": "Brief description"
        },
        {
          "type": "Dinner",
          "name": "Meal name",
          "calories": 700,
          "description": "Brief description"
        }
      ],
      "totalCalories": 1800
    }
  ]
}

IMPORTANT: 
- Use proper JSON format with double quotes for all strings
- meals must be an array of objects, not a string
- All numeric values must be numbers, not strings
- Generate meals for each day of the ${preferences.duration}
- Ensure meals are varied, nutritious, and align with the user's preferences and restrictions
- Return ONLY valid JSON that can be parsed with JSON.parse(), no markdown, no code blocks, no additional text`;

  try {
    const completionParams = {
      model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are a nutritionist AI assistant. Generate detailed, personalized meal plans in JSON format only. Always return valid JSON that can be parsed directly. Do not include any markdown formatting, code blocks, or additional text - only the JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    // Add JSON mode if supported by the model (llama 3.1+ and mixtral support JSON mode)
    if (model.includes('llama-3.1') || model.includes('llama3.1') || model.includes('mixtral')) {
      completionParams.response_format = { type: 'json_object' };
    }

    const completion = await groq.chat.completions.create(completionParams);

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty content');
    }

    // Debug: Log raw content first
    console.log('Raw Groq content (first 2000 chars):', content.substring(0, 2000));

    // Parse JSON response
    let mealPlanData;
    try {
      mealPlanData = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        mealPlanData = JSON.parse(jsonMatch[1]);
      } else {
        console.error('Failed to parse JSON. Content:', content.substring(0, 500));
        throw new Error('Failed to parse meal plan JSON');
      }
    }

    // Validate the structure (Groq should return proper JSON)
    if (!mealPlanData.schedule || !Array.isArray(mealPlanData.schedule)) {
      console.error('Invalid meal plan structure:', mealPlanData);
      throw new Error('Invalid meal plan structure from AI');
    }

    // Return as-is - normalization happens in generateMealPlan
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
    let generatedPlan;
    try {
      generatedPlan = await generateMealPlanWithGroq(user, biometrics, preferences);
      console.log('Generated plan structure:', JSON.stringify(generatedPlan, null, 2).substring(0, 2000));
    } catch (error) {
      console.error('Meal plan generation failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate meal plan. Please try again later.'
      });
    }

    // Ensure schedule is properly normalized before saving
    if (!generatedPlan.schedule || !Array.isArray(generatedPlan.schedule)) {
      console.error('Invalid schedule structure:', generatedPlan);
      return res.status(500).json({
        success: false,
        message: 'Invalid meal plan structure generated'
      });
    }

    // Calculate start and end dates
    const startDate = new Date();
    const durationDays = parseInt(duration.match(/\d+/)?.[0] || '7');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);

    // Format dates for schedule
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Ensure schedule has dates and validate structure
    if (generatedPlan.schedule && Array.isArray(generatedPlan.schedule)) {
      generatedPlan.schedule = generatedPlan.schedule.map((day, index) => {
        // Ensure date exists
        if (!day.date) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + index);
          day.date = formatDate(date);
        }
        
        // Validate meals - should already be an array from Groq
        if (!day.meals || !Array.isArray(day.meals)) {
          console.warn(`Day ${index} has invalid meals, using empty array. Type: ${typeof day.meals}`);
          day.meals = [];
        } else {
          // Filter out any non-object entries and ensure proper structure
          day.meals = day.meals
            .filter(meal => {
              const isValid = meal && typeof meal === 'object' && !Array.isArray(meal);
              if (!isValid) {
                console.warn(`Day ${index} has invalid meal entry:`, typeof meal, meal);
              }
              return isValid;
            })
            .map(meal => ({
              type: String(meal.type || 'Meal'),
              name: String(meal.name || 'Unnamed'),
              calories: Number(meal.calories || 0),
              description: String(meal.description || '')
            }));
        }
        
        // Calculate total calories if not provided
        if (!day.totalCalories || typeof day.totalCalories !== 'number') {
          day.totalCalories = day.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        }
        
        // Create a completely new object to avoid any reference issues
        const cleanDay = {
          date: String(day.date),
          meals: [],
          totalCalories: Number(day.totalCalories || 0)
        };
        
        // Manually copy each meal to ensure clean structure
        if (Array.isArray(day.meals)) {
          for (const meal of day.meals) {
            if (meal && typeof meal === 'object' && !Array.isArray(meal)) {
              cleanDay.meals.push({
                type: String(meal.type || 'Meal'),
                name: String(meal.name || 'Unnamed'),
                calories: Number(meal.calories || 0),
                description: String(meal.description || '')
              });
            }
          }
        }
        
        // Recalculate total if needed
        if (cleanDay.totalCalories === 0) {
          cleanDay.totalCalories = cleanDay.meals.reduce((sum, m) => sum + m.calories, 0);
        }
        
        return cleanDay;
      });
    }

    // Final check - ensure schedule is clean before saving
    const cleanSchedule = JSON.parse(JSON.stringify(generatedPlan.schedule)); // Deep clone to ensure clean structure
    
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

