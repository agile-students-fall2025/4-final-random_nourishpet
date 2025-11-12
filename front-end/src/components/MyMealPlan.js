import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './MyMealPlan.css';

function MyMealPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusLock, setFocusLock] = useState(false);
  const [currentView, setCurrentView] = useState('Weekly'); 

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const [mealPlanData, setMealPlanData] = useState({
    goal: 'Balanced Diet',
    duration: '30-Day Plan',
    calories: '2000 Calories',
    progress: 'Day 5 of 30'
  });

  const DUMMY_SCHEDULE = {
    'Mon 13': { meals: [{ type: 'Meal 1', name: 'Oats' }, { type: 'Meal 2', name: 'Fish' }, { type: 'Meal 3', name: 'Shake' }], total: '1850 kcal', mood: 'Happy' },
    'Tue 14': { meals: [{ type: 'Meal 1', name: 'Yoghurt' }, { type: 'Meal 2', name: 'Pasta' }, { type: 'Meal 3', name: 'Chicken' }], total: '1920 kcal', mood: 'Energetic' },
    'Wed 15': { meals: [{ type: 'Meal 1', name: 'Eggs' }, { type: 'Meal 2', name: 'Salad' }, { type: 'Meal 3', name: 'Soup' }], total: '1950 kcal', mood: 'Calm', currentDay: true },
    'Thu 16': { meals: [], total: null, mood: null },
    'Fri 17': { meals: [], total: null, mood: null },
    'Sat 18': { meals: [], total: null, mood: null },
    'Sun 19': { meals: [], total: null, mood: null },
  };

  const weeklySchedule = useMemo(() => 
    Object.entries(DUMMY_SCHEDULE).map(([day, data]) => ({ day, ...data }))
  , []);

  useEffect(() => {
    if (location.state) {
      setMealPlanData(location.state);
    }
  }, [location.state]);

  const renderWeeklyCalendar = () => (
    <div className="calendar-grid">
      {weeklySchedule.map((dayData, index) => (
        <div 
          key={index} 
          className={`day-cell ${dayData.currentDay ? 'current-day' : ''}`}
        >
          <div className={`day-header ${dayData.currentDay ? 'current-day-header' : ''}`}>
            {/* Extract Mon 13 to Mon and 13 */}
            <span className="day-name">{dayData.day.split(' ')[0]}</span>
            <span className="day-date">{dayData.day.split(' ')[1]}</span>
          </div>

          <div className="meal-list">
            {dayData.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="meal-entry">
                <p className="meal-type">{meal.type}:</p>
                <p className="meal-name">{meal.name}</p>
              </div>
            ))}
            {dayData.total && <p className="meal-total">Total: {dayData.total}</p>}
            {dayData.mood && <p className="meal-mood">Mood: {dayData.mood}</p>}
          </div>
        </div>
      ))}
    </div>
  );


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

      <div className="my-meal-plan-card schedule-card">
          {/* <h3 className="card-heading">Schedule</h3> */}

          <div className="calendar-controls">
            {/* Date Navigation */}
            <div className="date-navigation">
              <button className="nav-arrow" disabled={focusLock}>&lt;</button>
              <span className="month-label">October 2025</span>
              <button className="nav-arrow" disabled={focusLock}>&gt;</button>
            </div>

            {/* View Toggles */}
            <div className="view-toggles">
              {['Daily', 'Weekly', 'Monthly'].map(view => (
                <button
                  key={view}
                  className={`view-toggle-button ${currentView === view ? 'active' : ''}`}
                  onClick={() => setCurrentView(view)}
                  disabled={focusLock}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
          
          {/* Render the calendar based on the current view */}
          {currentView === 'Weekly' && renderWeeklyCalendar()}
          {currentView !== 'Weekly' && (
             <p style={{textAlign: 'center', color: '#777', padding: '2rem'}}>
                Switch to 'Weekly' view to see the meal schedule.
             </p>
          )}
          
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

