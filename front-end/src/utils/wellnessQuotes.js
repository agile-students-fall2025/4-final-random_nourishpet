// Collection of wellness and motivation quotes
const wellnessQuotes = [
  "Your body is your most priceless possession. Take care of it!",
  "Small progress is still progress. Keep going!",
  "Healthy habits create a healthy life!",
  "Nourish your body, feed your soul!",
  "Every meal is a chance to fuel your dreams!",
  "Your health is an investment, not an expense!",
  "Consistency is the key to wellness!",
  "Take care of your body. It's the only place you have to live!",
  "Healthy eating is a form of self-respect!",
  "Your wellness journey is unique. Celebrate your progress!",
  "Good nutrition is a foundation for good health!",
  "Make your health a priority before it becomes a necessity!",
  "You don't have to be perfect, just consistent!",
  "Fuel your body with good food and your mind with positivity!",
  "Healthy habits today, stronger body tomorrow!",
  "Your pet is counting on you! Stay healthy together!",
  "Take it one meal at a time. You've got this!",
  "Wellness is not a destination, it's a way of life!",
  "Eat well, feel well, live well!",
  "Your health journey matters. Keep showing up!",
  "Balance is not something you find, it's something you create!",
  "Treat your body like it belongs to someone you love!",
  "Every healthy choice is a step in the right direction!",
  "Your wellness is worth the effort!",
  "Nourish to flourish!",
  "Health is happiness. Happiness is health!",
  "Your pet grows stronger when you do!",
  "Progress over perfection, always!",
  "Choose foods that make you feel good inside and out!",
  "Healthy living is loving yourself one choice at a time!"
];

// Get a daily quote based on the current date
export const getDailyQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % wellnessQuotes.length;
  return wellnessQuotes[index];
};

export default wellnessQuotes;
