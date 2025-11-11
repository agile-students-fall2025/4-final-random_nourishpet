import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaLockOpen, FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './MyMealPlan.css';

function MyMealPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusLock, setFocusLock] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const [mealPlanData, setMealPlanData] = useState({
    goal: 'Balanced Diet',
    duration: '30-Day Plan',
    calories: '2000 Calories',
    progress: 'Day 5 of 30'
  });

  useEffect(() => {
    if (location.state) {
      setMealPlanData(location.state);
    }
  }, [location.state]);


  return (
    <div className="my-meal-plan-container">
      <header className={`my-meal-plan-header ${focusLock ? 'disabled' : ''}`}>
        <button
          className="icon-button"
          onClick={() => navigate(-1)}
          disabled={focusLock}
        >
          <FaArrowLeft />
        </button>
        <h2 className="my-meal-plan-title">
          {focusLock ? 'Focus Lock Enabled' : 'My Meal Plan'}
        </h2>

        <HamburgerMenu disabled={focusLock} />
      </header>

      <div className="my-meal-plan-card">
        <div className="my-meal-plan-content">
            <div className="my-meal-plan-box">
              <div className="box-label">Goal</div>
              <div className="box-value">{mealPlanData.goal}</div>
            </div>

            <div className="my-meal-plan-box">
              <div className="box-label">Duration</div>
              <div className="box-value">{mealPlanData.duration}</div>
            </div>

            <div className="my-meal-plan-box">
              <div className="box-label">Calories per Day</div>
              <div className="box-value">{mealPlanData.calories}</div>
            </div>

            <div className="my-meal-plan-box">
              <div className="box-label">Progress</div>
              <div className="box-value">{mealPlanData.progress}</div>
            </div>
          </div>

          
      </div>

      <div className="my-meal-plan-card">
        <p className="update-link">
          Click <span className="link-text" onClick={() => navigate('/manage-plan')}>here</span> to update meal plan
        </p>
      </div>
    </div>
  );
}

export default MyMealPlan;

