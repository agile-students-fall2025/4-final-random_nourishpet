import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './MyMealPlan.css';
import { API_BASE_URL } from '../utils/api';

function MyMealPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('Weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [mealPlanData, setMealPlanData] = useState({
    goal: '',
    duration: '',
    calories: '',
    progress: ''
  });

  const [schedule, setSchedule] = useState([]);

  // Format date to "Mon DD" format
  const formatDayLabel = (dateString) => {
    try {
      const [month, day, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${days[date.getDay()]} ${day}`;
    } catch {
      return dateString;
    }
  };

  // Calculate progress
  const calculateProgress = (startDate, duration) => {
    if (!startDate || !duration) return '';
    const start = new Date(startDate);
    const today = new Date();
    const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    const durationDays = parseInt(duration.match(/\d+/)?.[0] || '7');
    return `Day ${Math.max(1, Math.min(daysDiff, durationDays))} of ${durationDays}`;
  };

  useEffect(() => {
    const loadMealPlan = async () => {
      setIsLoading(true);
      setError('');

      // Check if meal plan was passed via navigation state
      if (location.state?.mealPlan) {
        const plan = location.state.mealPlan;
        setMealPlanData({
          goal: plan.goal || '',
          duration: plan.duration || '',
          calories: plan.dailyCalories ? `${plan.dailyCalories} Calories` : '',
          progress: calculateProgress(plan.startDate, plan.duration)
        });
        setSchedule(plan.schedule || []);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from API
      const email = localStorage.getItem('email');
      if (!email) {
        setError('Please sign in to view your meal plan');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/meal-plans/${encodeURIComponent(email)}`, {
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const plan = data.mealPlan;
          setMealPlanData({
            goal: plan.goal || '',
            duration: plan.duration || '',
            calories: plan.dailyCalories ? `${plan.dailyCalories} Calories` : '',
            progress: calculateProgress(plan.startDate, plan.duration)
          });
          setSchedule(plan.schedule || []);
        } else {
          setError(data.message || 'No meal plan found');
        }
      } catch (err) {
        console.error('Error loading meal plan:', err);
        setError('Failed to load meal plan');
      } finally {
        setIsLoading(false);
      }
    };

    loadMealPlan();
  }, [location.state]);

  const weeklySchedule = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    
    // Get first 7 days for weekly view
    return schedule.slice(0, 7).map((day, index) => {
      const today = new Date();
      const dayDate = day.date ? (() => {
        try {
          const [month, dayNum, year] = day.date.split('/');
          return new Date(year, month - 1, dayNum);
        } catch {
          return null;
        }
      })() : null;
      
      const isToday = dayDate && 
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear();

      return {
        day: formatDayLabel(day.date || ''),
        meals: day.meals || [],
        total: day.totalCalories ? `${day.totalCalories} kcal` : null,
        currentDay: isToday
      };
    });
  }, [schedule]);

  const renderWeeklyCalendar = () => {
    if (weeklySchedule.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
          No meal schedule available. Generate a meal plan to see your schedule.
        </p>
      );
    }

    return (
      <div className="calendar-grid">
        {weeklySchedule.map((dayData, index) => (
          <div 
            key={index} 
            className={`day-cell ${dayData.currentDay ? 'current-day' : ''}`}
          >
            <div className={`day-header ${dayData.currentDay ? 'current-day-header' : ''}`}>
              <span className="day-name">{dayData.day.split(' ')[0]}</span>
              <span className="day-date">{dayData.day.split(' ')[1]}</span>
            </div>

            <div className="meal-list">
              {dayData.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="meal-entry">
                  <p className="meal-type">{meal.type}:</p>
                  <p className="meal-name">{meal.name}</p>
                  {meal.description && (
                    <p className="meal-description" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {meal.description}
                    </p>
                  )}
                  {meal.calories && (
                    <p className="meal-calories" style={{ fontSize: '0.8rem', color: '#999' }}>
                      {meal.calories} cal
                    </p>
                  )}
                </div>
              ))}
              {dayData.total && <p className="meal-total">Total: {dayData.total}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="my-meal-plan-container">
      <header className="my-meal-plan-header">
        <button
          className="icon-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>
        <h2 className="my-meal-plan-title">My Meal Plan</h2>

        <HamburgerMenu />
      </header>

      {isLoading ? (
        <div className="my-meal-plan-card">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading meal plan...</p>
        </div>
      ) : error ? (
        <div className="my-meal-plan-card">
          <p style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>{error}</p>
          <p style={{ textAlign: 'center', padding: '1rem' }}>
            <span className="link-text" onClick={() => navigate('/generate-meal-plan')}>
              Generate a new meal plan
            </span>
          </p>
        </div>
      ) : (
        <div className="my-meal-plan-card">
          <div className="my-meal-plan-content">
            {mealPlanData.goal && (
              <div className="my-meal-plan-box">
                <div className="box-label">Goal</div>
                <div className="box-value">{mealPlanData.goal}</div>
              </div>
            )}

            {mealPlanData.duration && (
              <div className="my-meal-plan-box">
                <div className="box-label">Duration</div>
                <div className="box-value">{mealPlanData.duration}</div>
              </div>
            )}

            {mealPlanData.calories && (
              <div className="my-meal-plan-box">
                <div className="box-label">Calories per Day</div>
                <div className="box-value">{mealPlanData.calories}</div>
              </div>
            )}

            {mealPlanData.progress && (
              <div className="my-meal-plan-box">
                <div className="box-label">Progress</div>
                <div className="box-value">{mealPlanData.progress}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="my-meal-plan-card schedule-card">
          {/* <h3 className="card-heading">Schedule</h3> */}

          <div className="calendar-controls">
            {/* Date Navigation */}
            <div className="date-navigation">
              <button className="nav-arrow">&lt;</button>
              <span className="month-label">October 2025</span>
              <button className="nav-arrow">&gt;</button>
            </div>

            {/* View Toggles */}
            <div className="view-toggles">
              {['Daily', 'Weekly', 'Monthly'].map(view => (
                <button
                  key={view}
                  className={`view-toggle-button ${currentView === view ? 'active' : ''}`}
                  onClick={() => setCurrentView(view)}
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

