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

// Sanitize short user-provided strings to reduce prompt injection and length
const sanitize = (input, maxLen = 300) => {
  if (input === undefined || input === null) return '';
  let s = String(input);
  // Collapse newlines and trim
  s = s.replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
};

// Fallback deterministic meal plan generator (used when AI fails or for validation)
const generateFallbackMealPlan = (dailyCalories, numDays) => {
  const perMeal = Math.max(100, Math.round(dailyCalories / 3));
  const schedule = [];
  for (let i = 0; i < numDays; i++) {
    schedule.push({
      date: null, // will be filled by caller
      meals: [
        { type: 'Breakfast', name: 'Oatmeal with fruit', calories: perMeal, description: '' },
        { type: 'Lunch', name: 'Grain bowl with veggies', calories: perMeal, description: '' },
        { type: 'Dinner', name: 'Protein + veggies', calories: Math.max(0, dailyCalories - perMeal * 2), description: '' }
      ],
      totalCalories: dailyCalories
    });
  }
  return { dailyCalories, schedule };
};

// Validate AI response structure and reasonable values
const validateMealPlanData = (data, numDays) => {
  if (!data || !Array.isArray(data.schedule)) return false;
  if (data.schedule.length === 0) return false;
  // Ensure schedule length is <= requested days (we will pad if fewer)
  if (data.schedule.length > numDays * 2) return false; // suspiciously large

  // Validate each day
  for (let i = 0; i < data.schedule.length; i++) {
    const day = data.schedule[i];
    if (!day || typeof day !== 'object') return false;
    if (!Array.isArray(day.meals)) return false;
    if (day.meals.length === 0) return false;
    // Each meal should have reasonable fields
    for (const meal of day.meals) {
      if (!meal || typeof meal !== 'object') return false;
      if (!meal.name || typeof meal.name !== 'string') return false;
      const calories = Number(meal.calories || 0);
      if (Number.isNaN(calories) || calories < 0 || calories > 5000) return false;
    }
    const total = Number(day.totalCalories || 0);
    if (Number.isNaN(total) || total < 0 || total > 20000) return false;
  }

  return true;
};

// Generate meal plan using Groq
const generateMealPlanWithGroq = async (userData, biometrics, preferences, numDays) => {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('Groq API is not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const dailyCalories = calculateDailyCalories(biometrics, preferences.goal);

  // Sanitize user-provided fields to reduce prompt injection and length
  const safePreferences = {
    goal: sanitize(preferences.goal, 100),
    duration: sanitize(preferences.duration, 50),
    restrictions: sanitize(preferences.restrictions, 200),
    allergies: sanitize(preferences.allergies, 200),
    budget: sanitize(preferences.budget, 50),
    description: sanitize(preferences.description, 500),
  };

  const safeBiometrics = biometrics ? {
    age: biometrics.age || null,
    sex: sanitize(biometrics.sex || '', 20),
    heightCm: biometrics.heightCm || null,
    weightLbs: biometrics.weightLbs || null,
    bmi: biometrics.bmi || null
  } : null;

  // Build prompt for Groq. Embed structured JSON to reduce interpretation ambiguity.
  const promptObj = {
    instructions: `Generate a meal plan for the user. Return ONLY valid JSON with the exact structure described in 'response_structure'. Do not include markdown or explanatory text.`,
    request: {
      duration: safePreferences.duration,
      days: numDays,
      dailyCalories,
      preferences: safePreferences,
      biometrics: safeBiometrics
    },
    response_structure: {
      dailyCalories: 'number',
      schedule: [
        {
          date: 'MM/DD/YYYY',
          meals: [
            { type: 'string', name: 'string', calories: 'number', description: 'string' }
          ],
          totalCalories: 'number'
        }
      ]
    }
  };

  const prompt = JSON.stringify(promptObj);

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

    // Parse JSON - Groq should return valid JSON or an object
    let mealPlanData;
    try {
      if (typeof content === 'object') {
        mealPlanData = content;
      } else {
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
            mealPlanData = null;
          }
        }
      }
    } catch (err) {
      console.error('Unexpected parse error:', err);
      mealPlanData = null;
    }

    // Validate AI data; if invalid, use deterministic fallback
    if (!validateMealPlanData(mealPlanData, numDays)) {
      console.error('✗ Invalid or unsafe meal plan structure from AI, falling back to deterministic generator');
      mealPlanData = generateFallbackMealPlan(dailyCalories, numDays);
    } else {
      console.log('✓ Groq response validated');
      console.log('Schedule entries:', mealPlanData.schedule.length);
      if (mealPlanData.schedule.length > 0) {
        console.log('First day date:', mealPlanData.schedule[0].date);
        console.log('First day meals:', mealPlanData.schedule[0].meals?.length || 0);
      }
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
      return res.status(400).json({ success: false, message: 'Email, goal, and duration are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Only allow the authenticated user to create their own meal plan
    if (!req.user || String(req.user.email).toLowerCase().trim() !== normalizedEmail) {
      return res.status(403).json({ success: false, message: 'Forbidden: can only generate meal plans for your own account' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user biometrics
    const biometrics = await BiometricData.findOne({ email: normalizedEmail });

    const preferences = {
      goal: sanitize(goal || ''),
      duration: sanitize(duration || ''),
      restrictions: sanitize(restrictions || ''),
      allergies: sanitize(allergies || ''),
      budget: sanitize(budget || ''),
      description: sanitize(description || '')
    };

    // Calculate dates - always start from today
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Parse and clamp durationDays
    let durationDays = parseInt(String(preferences.duration).match(/\d+/)?.[0] || '7');
    if (Number.isNaN(durationDays) || durationDays < 1) durationDays = 7;
    const MAX_DAYS = 30;
    if (durationDays > MAX_DAYS) durationDays = MAX_DAYS;

    // Generate meal plan using Groq (or fallback)
    console.log('=== GENERATING MEAL PLAN ===');
    console.log('Account:', normalizedEmail);
    console.log('Goal:', preferences.goal);
    console.log('Duration:', preferences.duration, `(${durationDays} days)`);
    console.log('Restrictions:', preferences.restrictions || 'None');
    console.log('Allergies:', preferences.allergies || 'None');

    let generatedPlan = null;
    try {
      generatedPlan = await generateMealPlanWithGroq(user, biometrics, preferences, durationDays);
      console.log('✓ Meal plan generated successfully from Groq');
    } catch (err) {
      console.error('✗ Meal plan generation failed:', err && err.message);
      console.error('Falling back to deterministic generator');
      generatedPlan = generateFallbackMealPlan(calculateDailyCalories(biometrics, preferences.goal), durationDays);
    }

    if (!generatedPlan || !Array.isArray(generatedPlan.schedule)) {
      // Ensure fallback
      generatedPlan = generateFallbackMealPlan(calculateDailyCalories(biometrics, preferences.goal), durationDays);
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);
    endDate.setHours(23, 59, 59, 999); // End of day

    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Build a clean schedule of exactly durationDays entries
    const cleanSchedule = [];
    const baseSchedule = Array.isArray(generatedPlan.schedule) && generatedPlan.schedule.length > 0
      ? generatedPlan.schedule
      : generateFallbackMealPlan(calculateDailyCalories(biometrics, preferences.goal), durationDays).schedule;

    for (let i = 0; i < durationDays; i++) {
      const sourceDay = baseSchedule[i % baseSchedule.length] || { meals: [], totalCalories: 0 };
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayDate = formatDate(d);

      const meals = Array.isArray(sourceDay.meals) ? sourceDay.meals.map(meal => ({
        type: String(meal.type || 'Meal').slice(0, 50),
        name: String(meal.name || 'Unnamed').slice(0, 200),
        calories: Math.max(0, Number(meal.calories || 0)),
        description: String(meal.description || '').slice(0, 500)
      })) : [];

      const totalCal = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);

      cleanSchedule.push({
        date: dayDate,
        meals,
        totalCalories: Number(sourceDay.totalCalories || totalCal)
      });
    }

    // Save meal plan to database
    const mealPlan = new MealPlan({
      email: normalizedEmail,
      goal: preferences.goal,
      duration: preferences.duration,
      restrictions: preferences.restrictions,
      allergies: preferences.allergies,
      budget: preferences.budget,
      description: preferences.description,
      dailyCalories: generatedPlan.dailyCalories || calculateDailyCalories(biometrics, preferences.goal),
      schedule: cleanSchedule,
      startDate,
      endDate
    });

    await mealPlan.save();

    console.log('=== MEAL PLAN SAVED ===');
    console.log('Account:', normalizedEmail, 'MealPlanID:', mealPlan._id);

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
    res.status(500).json({ success: false, message: 'Internal server error' });
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
