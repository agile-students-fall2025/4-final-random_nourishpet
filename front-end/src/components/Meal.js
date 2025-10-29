import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Meal.css';

function Meal() {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend only - just log the values
    // console.log('Sign in attempted with:', { email, password });
    // In a real app, you would navigate to dashboard here
    // navigate('/dashboard');
  };

return (
    <div className="generateplan-container">
        <div className="generateplan-card">
            <div className="generateplan-header">
                <h1 className="app-logo">NourishPet</h1>
                <h2 className="meal-subheader">Generate Meal Plan</h2>
            </div>

            <form className="generateplan-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <select
                        id="goal"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    >
                        <option value="" disabled>Select Goal</option>
                        <option value="goal 1">Goal 1</option>
                        <option value="goal 2">Goal 2</option>
                        <option value="goal 3">Goal 3</option>
                    </select>
                    <label htmlFor="goal">Choose what you'd like to focus on: weight loss, muscle gain, or balance</label>
                </div>

                <div className="form-group">
                    <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="" disabled>Choose Duration</option>
                        <option value="duration 1">Duration 1</option>
                        <option value="duration 2">Duration 2</option>
                        <option value="duration 3">Duration 3</option>
                    </select>
                    <label htmlFor="duration">Select how long you want your plan to last</label>
                </div>

                <div className="form-group">
                    <input
                        type="restrictions"
                        id="restrictions"
                        name="restrictions"
                        value={restrictions}
                        onChange={(e) => setRestrictions(e.target.value)}
                        placeholder="Dietary Restrictions (if any)"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="allergies"
                        id="allergies"
                        name="allergies"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Allergies (if any)"
                        required
                    />
                </div>

                <div className="form-group">
                    <input
                        type="budget"
                        id="budget"
                        name="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Ideal Budget (in USD)"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="description"
                        id="description"
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please describe your ideal meal plan in up to 400 characters..."
                        required
                    />
                </div>

                <button type="submit" className="generate-button">
                    Generate
                </button>
            </form>
        </div>
    </div>
);
}

export default Meal;

