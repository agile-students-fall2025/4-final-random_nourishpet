import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './MyMealPlan.css';

function MyMealPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusLock, setFocusLock] = useState(false);
  const [currentView, setCurrentView] = useState('Weekly');
  
  // 1. New state for the currently selected day
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Start at 'Wed 15' which is index 2

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
    'Mon 13': { meals: [{ type: 'Meal 1', name: 'Oats' }, { type: 'Meal 2', name: 'Fish' }, { type: 'Meal 3', name: 'Steak' }], total: '1850 kcal', mood: 'Happy' },
    'Tue 14': { meals: [{ type: 'Meal 1', name: 'Yogurt' }, { type: 'Meal 2', name: 'Pasta' }, { type: 'Meal 3', name: 'Chicken' }], total: '1920 kcal', mood: 'Energetic' },
    'Wed 15': { meals: [{ type: 'Meal 1', name: 'Eggs' }, { type: 'Meal 2', name: 'Salad' }, { type: 'Meal 3', name: 'Soup' }], total: '1950 kcal', mood: 'Calm', currentDay: true },
    'Thu 16': { meals: [], total: null, mood: null },
    'Fri 17': { meals: [], total: null, mood: null },
    'Sat 18': { meals: [], total: null, mood: null },
    'Sun 19': { meals: [], total: null, mood: null },
  };

  const weeklySchedule = useMemo(() =>
    Object.entries(DUMMY_SCHEDULE).map(([day, data]) => ({ day, ...data }))
  , []);
  
  const selectedDayData = weeklySchedule[selectedDayIndex];

  useEffect(() => {
    if (location.state) {
      setMealPlanData(location.state);
    }
  }, [location.state]);

  // Handler for day navigation arrows
  const navigateDay = useCallback((direction) => {
    setSelectedDayIndex(prevIndex => {
      const newIndex = prevIndex + direction;
      // Ensure the index stays within bounds [0, weeklySchedule.length - 1]
      return Math.max(0, Math.min(weeklySchedule.length - 1, newIndex));
    });
  }, [weeklySchedule.length]);

  const renderWeeklyCalendar = () => (
    <div className="calendar-grid">
      {weeklySchedule.map((dayData, index) => (
        <div
          key={index}
          className={`day-cell ${dayData.currentDay ? 'current-day' : ''}`}
          // Clicking a day cell in weekly view can switch to daily view for that day
          onClick={() => {
              setCurrentView('Daily');
              setSelectedDayIndex(index);
          }}
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

  // 2. New function to render the daily view
  const renderDailyView = () => {
    if (!selectedDayData) return <p style={{textAlign: 'center', color: '#777', padding: '2rem'}}>No schedule data for this day.</p>;

    return (
      <div className="daily-view-container">
        <div
          className={`day-cell daily-view-cell ${selectedDayData.currentDay ? 'current-day' : ''}`}
        >
          <div className={`day-header daily-view-header ${selectedDayData.currentDay ? 'current-day-header' : ''}`}>
            <span className="day-name" style={{fontSize: '1.2rem'}}>{selectedDayData.day.split(' ')[0]}</span>
            <span className="day-date" style={{fontSize: '2rem'}}>{selectedDayData.day.split(' ')[1]}</span>
          </div>

          <div className="meal-list daily-meal-list">
            {selectedDayData.meals.length > 0 ? (
                selectedDayData.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="meal-entry daily-meal-entry">
                      <p className="meal-type">{meal.type}:</p>
                      <p className="meal-name">{meal.name}</p>
                    </div>
                  ))
            ) : (
                <p style={{textAlign: 'center', color: '#aaa', padding: '1rem'}}>No meals planned for this day.</p>
            )}
            
            {selectedDayData.total && <p className="meal-total daily-meal-total">Total Calories: {selectedDayData.total}</p>}
            {selectedDayData.mood && <p className="meal-mood daily-meal-mood">Mood Tracked: {selectedDayData.mood}</p>}

          </div>
        </div>
        
      </div>
    );
  };


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
              <button 
                className="nav-arrow" 
                onClick={() => currentView === 'Daily' ? navigateDay(-1) : null}
                disabled={focusLock || (currentView === 'Daily' && selectedDayIndex === 0)}
              >
                &lt;
              </button>
              <span className="month-label">
                {currentView === 'Daily' ? selectedDayData.day : 'October 2025'}
              </span>
              <button 
                className="nav-arrow" 
                onClick={() => currentView === 'Daily' ? navigateDay(1) : null}
                disabled={focusLock || (currentView === 'Daily' && selectedDayIndex === weeklySchedule.length - 1)}
              >
                &gt;
              </button>
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
          {/* 4. Call renderDailyView for Daily view */}
          {currentView === 'Daily' && renderDailyView()}
          {currentView === 'Monthly' && (
             <p style={{textAlign: 'center', color: '#777', padding: '2rem'}}>
                Monthly view not yet implemented. Switch to 'Daily' or 'Weekly'.
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