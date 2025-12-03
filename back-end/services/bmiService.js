// bmiServiceDebug.js
const Groq = require("groq-sdk");

const calculateBmiFallback = (heightCm, weightLbs) => {
  console.log("[SERVER] FALLBACK BMI calculation triggered");

  const heightMeters = heightCm / 100;
  const weightKg = weightLbs * 0.45359237;
  const bmi = weightKg / (heightMeters * heightMeters);

  console.log("[SERVER] FALLBACK BMI result:", bmi);

  return Number(bmi.toFixed(2));
};

const requestBMIFromGroq = async (heightCm, weightLbs) => {
  console.log("[SERVER] Entered requestBMIFromGroq");
  console.log("[SERVER] ENV CHECK:", {
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL
  });

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;

  if (!apiKey || !model) {
    console.log("[SERVER] Groq config missing");
    throw new Error("Groq API is not configured");
  }

  console.log("[SERVER] Groq config OK, creating client...");

  const client = new Groq({ apiKey });

  const prompt = `
    Return ONLY a number. No words. No JSON.
    height_cm: ${heightCm}
    weight_lbs: ${weightLbs}
  `;

  console.log("[SERVER] Prompt sent to Groq:\n", prompt);

  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: "Return only a numeric BMI value." },
        { role: "user", content: prompt }
      ]
    });
  } catch (err) {
    console.error("[SERVER] Groq SDK error:", err);
    throw new Error("Groq API call failed");
  }

  console.log("[SERVER] Raw Groq completion object:", JSON.stringify(completion, null, 2));

  const content = completion?.choices?.[0]?.message?.content;
  console.log("[SERVER] Groq content:", content);

  if (!content) {
    throw new Error("Groq returned empty content");
  }

  const match = content.match(/-?\d+(\.\d+)?/);
  console.log("[SERVER] Number regex match:", match);

  if (!match) {
    throw new Error("Groq did not return a numeric BMI");
  }

  const bmi = Number(Number(match[0]).toFixed(2));
  console.log("[SERVER] Parsed Groq BMI:", bmi);

  return bmi;
};

const calculateBMI = async ({ heightCm, weightLbs }) => {
  console.log("[SERVER] calculateBMI called with:", { heightCm, weightLbs });

  try {
    const result = await requestBMIFromGroq(heightCm, weightLbs);
    console.log("[SERVER] Groq BMI success:", result);
    return result;
  } catch (err) {
    console.warn("[SERVER] Groq BMI calculation failed. Falling back to formula.", err.message);
    return calculateBmiFallback(heightCm, weightLbs);
  }
};

module.exports = { calculateBMI };
