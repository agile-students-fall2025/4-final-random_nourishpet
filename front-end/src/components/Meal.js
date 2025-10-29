import React, { useState } from 'react';
import './Meal.css';

function Meal() {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
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
                        <option value="duration 1">3-Day Plan</option>
                        <option value="duration 2">7-Day Plan</option>
                        <option value="duration 3">14-Day Plan</option>
                        <option value="duration 4">30-Day Plan</option>
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

                <button type="submit" className="generate-button">
                    Generate
                </button>
            </form>
        </div>
    </div>
);
}

export default Meal;

