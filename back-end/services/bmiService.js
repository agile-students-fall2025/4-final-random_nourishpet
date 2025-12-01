const axios = require('axios');

const FALLBACK_LABEL = 'formula';

const calculateBmiFallback = (heightCm, weightLbs) => {
  if (!heightCm || !weightLbs) {
    throw new Error('Height and weight are required to calculate BMI');
  }

  const heightMeters = heightCm / 100;
  const weightKg = weightLbs * 0.45359237;
  const bmiValue = weightKg / (heightMeters * heightMeters);

  return {
    bmi: Number(bmiValue.toFixed(2)),
    source: FALLBACK_LABEL,
  };
};

const requestBMIFromGroq = async ({ heightCm, weightLbs, sex, age, ethnicity, ethnicityOther }) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!apiKey || !model) {
    throw new Error('Groq API is not configured');
  }

  const prompt = [
    `You are a BMI calculator. Respond ONLY with JSON that matches { "bmi": <number> }.`,
    `Use height (cm) and weight (lbs) to compute BMI. If inputs are invalid, throw an error.`,
    `height_cm: ${heightCm}`,
    `weight_lbs: ${weightLbs}`,
    `sex: ${sex || 'unknown'}`,
    `age: ${age ?? 'unknown'}`,
    `ethnicity: ${ethnicity || ethnicityOther || 'unknown'}`,
  ].join('\n');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical assistant that only returns valid JSON responses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response?.data?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content || '{}');
  const bmiValue = Number(parsed.bmi);

  if (!Number.isFinite(bmiValue)) {
    throw new Error('Groq response did not include a valid BMI');
  }

  return {
    bmi: Number(bmiValue.toFixed(2)),
    source: 'groq',
  };
};

const calculateBMI = async ({ heightCm, weightLbs, sex, age, ethnicity, ethnicityOther }) => {
  try {
    return await requestBMIFromGroq({ heightCm, weightLbs, sex, age, ethnicity, ethnicityOther });
  } catch (error) {
    console.warn('Groq BMI calculation failed. Falling back to formula.', error.message);
    return calculateBmiFallback(heightCm, weightLbs);
  }
};

module.exports = {
  calculateBMI,
};

