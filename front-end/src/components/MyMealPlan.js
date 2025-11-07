import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyMealPlan.css';

function MyMealPlan() {
  const navigate = useNavigate();

  return (
    <div className="my-meal-plan-container">
      <div className="my-meal-plan-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">My Meal Plan</h1>
        </div>

        <div className="meal-plan-content">
          <p>My Meal Plan page - Coming soon</p>
          <button className="generate-button" onClick={() => navigate('/generate-meal-plan')}>
            Generate New Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyMealPlan;

