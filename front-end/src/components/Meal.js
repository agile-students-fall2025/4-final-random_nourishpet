import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './Meal.css';
import { API_BASE_URL } from '../utils/api';

function Meal() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    // Validate required fields
    if (!goal || !duration) {
      setError('Please select a goal and duration');
      return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
      setError('Please sign in to generate a meal plan');
      navigate('/signin');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/meal-plans/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          goal,
          duration,
          restrictions,
          allergies,
          budget,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Navigate to meal plan page with generated data
        navigate('/my-meal-plan', { state: { mealPlan: data.mealPlan } });
      } else {
        setError(data.message || 'Failed to generate meal plan');
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

//   const handlePost = () => {
//     console.log('Posting activity:', { activityType, timeSpent, selectedImage });
//     navigate('/connect-socials'); //take them to add socials page
//   };

return (
    <div className="generateplan-container">
        <header className="generate-plan-header">
          <button
            className="icon-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h2 className="generate-plan-title">Generate Plan</h2>

          <HamburgerMenu />
        </header>
        
        <div className="generateplan-card">
            <form className="generateplan-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <select
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    >
                        <option value="" disabled>Select Goal</option>
                        <option value="goal 1">Weight Loss</option>
                        <option value="goal 2">Muscle Gain</option>
                        <option value="goal 3">Balanced Diet</option>
                        <option value="goal 4">Mindful Eating</option>
                    </select>
                    <label htmlFor="goal">Choose your focus: weight loss, muscle gain, balance, or mindful eating</label>
                </div>

                <div className="form-group">
                    <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="" disabled>Choose Duration</option>
                        <option value="3-Day Plan">3-Day Plan</option>
                        <option value="7-Day Plan">7-Day Plan</option>
                        <option value="14-Day Plan">14-Day Plan</option>
                        <option value="30-Day Plan">30-Day Plan</option>
                    </select>
                    <label htmlFor="duration">Select the duration of your meal plan</label>
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        id="restrictions"
                        name="restrictions"
                        value={restrictions}
                        onChange={(e) => setRestrictions(e.target.value)}
                        placeholder="Enter dietary restrictions (if any)"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        id="allergies"
                        name="allergies"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Enter allergies (if any)"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        id="budget"
                        name="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter your ideal budget (in USD)"
                        required
                    />
                </div>

                <div className="form-group">
                    <textarea
                        id="description-input"
                        name="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your ideal meal plan (in up to 400 characters)"
                        maxLength="400"
                        required
                    />
                </div>

                {error && (
                  <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}
                <button 
                  type="button" 
                  className="generate-button" 
                  onClick={handleClick}
                  disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </form>
        </div>
    </div>
);
}

export default Meal;
