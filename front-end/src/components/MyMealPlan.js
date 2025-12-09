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

  // Get today's date (memoized to avoid recreating)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  
  // Get start of week (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const [currentDate, setCurrentDate] = useState(() => new Date(today));
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(today));
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Parse date string from schedule (MM/DD/YYYY)
  const parseScheduleDate = (dateString) => {
    try {
      const [month, day, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  };

  // Format date to "Mon DD" format
  const formatDayLabel = (dateString) => {
    const date = parseScheduleDate(dateString);
    if (!date) return dateString;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate()}`;
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Format date range for weekly view
  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (weekStart.getMonth() === weekEnd.getMonth() && weekStart.getFullYear() === weekEnd.getFullYear()) {
      return `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
      return `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    } else {
      return `${months[weekStart.getMonth()]} ${weekStart.getDate()}, ${weekStart.getFullYear()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    }
  };

  // Format month/year for monthly view
  const formatMonthYear = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Find schedule entry for a specific date (bulletproof date matching)
  const findScheduleEntry = (date) => {
    if (!schedule || schedule.length === 0) return null;
    
    // Format date consistently with leading zeros (MM/DD/YYYY)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${month}/${day}/${year}`;
    
    // Try exact match first
    let entry = schedule.find(day => day.date === dateStr);
    if (entry) return entry;
    
    // Fallback: try without leading zeros
    const dateStrNoPad = `${date.getMonth() + 1}/${date.getDate()}/${year}`;
    entry = schedule.find(day => day.date === dateStrNoPad);
    if (entry) return entry;
    
    // Fallback: try parsing schedule dates and comparing Date objects
    for (const scheduleDay of schedule) {
      if (!scheduleDay.date) continue;
      const parsedDate = parseScheduleDate(scheduleDay.date);
      if (parsedDate && 
          parsedDate.getDate() === date.getDate() &&
          parsedDate.getMonth() === date.getMonth() &&
          parsedDate.getFullYear() === date.getFullYear()) {
        return scheduleDay;
      }
    }
    
    return null;
  };

  // Get date label based on current view
  const getDateLabel = () => {
    switch (currentView) {
      case 'Daily':
        return formatDateForDisplay(currentDate);
      case 'Weekly':
        return formatWeekRange(currentWeekStart);
      case 'Monthly':
        return formatMonthYear(currentMonth);
      default:
        return '';
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

  // Navigation handlers
  const handlePrevious = () => {
    switch (currentView) {
      case 'Daily': {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setCurrentDate(prevDate);
        break;
      }
      case 'Weekly': {
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeekStart(prevWeek);
        break;
      }
      case 'Monthly': {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
        break;
      }
      default:
        break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case 'Daily': {
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        setCurrentDate(nextDate);
        break;
      }
      case 'Weekly': {
        const nextWeek = new Date(currentWeekStart);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeekStart(nextWeek);
        break;
      }
      case 'Monthly': {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
        break;
      }
      default:
        break;
    }
  };

  // Reset to today when view changes
  useEffect(() => {
    if (currentView === 'Daily') {
      setCurrentDate(new Date(today));
    } else if (currentView === 'Weekly') {
      setCurrentWeekStart(getWeekStart(today));
    } else if (currentView === 'Monthly') {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

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
          console.log('Meal plan loaded:', {
            goal: plan.goal,
            duration: plan.duration,
            scheduleLength: plan.schedule?.length,
            firstDate: plan.schedule?.[0]?.date
          });
          setMealPlanData({
            goal: plan.goal || '',
            duration: plan.duration || '',
            calories: plan.dailyCalories ? `${plan.dailyCalories} Calories` : '',
            progress: calculateProgress(plan.startDate, plan.duration)
          });
          setSchedule(plan.schedule || []);
        } else {
          console.error('Meal plan fetch failed:', data.message);
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

  // Get schedule entries for the current week
  const weeklySchedule = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return [];
    }
    
    console.log('Building weekly schedule. Schedule entries:', schedule.length);
    console.log('Schedule dates:', schedule.map(d => d.date).slice(0, 3));
    console.log('Current week start:', currentWeekStart.toISOString().split('T')[0]);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const scheduleEntry = findScheduleEntry(date);
      
      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      // Format date consistently with leading zeros
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const dateStr = `${month}/${day}/${year}`;
      
      if (scheduleEntry) {
        console.log(`Found schedule entry for ${dateStr}:`, scheduleEntry.meals?.length, 'meals');
      }
      
      weekDays.push({
        date: date,
        dateString: dateStr,
        day: formatDayLabel(dateStr),
        meals: scheduleEntry?.meals || [],
        total: scheduleEntry?.totalCalories ? `${scheduleEntry.totalCalories} kcal` : null,
        currentDay: isToday
      });
    }
    
    console.log('Weekly schedule built. Days with meals:', weekDays.filter(d => d.meals.length > 0).length);
    return weekDays;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, currentWeekStart]);

  // Render daily view
  const renderDailyCalendar = () => {
    const scheduleEntry = findScheduleEntry(currentDate);
    const isToday = currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    if (!scheduleEntry || !scheduleEntry.meals || scheduleEntry.meals.length === 0) {
      return (
        <div className="daily-view">
          <p style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
            No meals scheduled for {formatDateForDisplay(currentDate)}.
          </p>
        </div>
      );
    }

    return (
      <div className="daily-view">
        <div className={`daily-day-card ${isToday ? 'current-day' : ''}`}>
          <div className={`daily-day-header ${isToday ? 'current-day-header' : ''}`}>
            <span className="daily-day-name">{formatDateForDisplay(currentDate)}</span>
          </div>
          <div className="daily-meal-list">
            {scheduleEntry.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="daily-meal-entry">
                <div className="daily-meal-type">{meal.type}</div>
                <div className="daily-meal-name">{meal.name}</div>
                {meal.description && (
                  <div className="daily-meal-description">{meal.description}</div>
                )}
                {meal.calories && (
                  <div className="daily-meal-calories">{meal.calories} cal</div>
                )}
              </div>
            ))}
            {scheduleEntry.totalCalories && (
              <div className="daily-total">
                Total: {scheduleEntry.totalCalories} kcal
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyCalendar = () => {
    if (weeklySchedule.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: '#777', padding: '2rem' }}>
          No meal schedule available. Generate a meal plan to see your schedule.
        </p>
      );
    }

    return (
      <div className="calendar-grid weekly-scrollable">
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

  // Render monthly view
  const renderMonthlyCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    // Create calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const scheduleEntry = findScheduleEntry(date);
      const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      calendarDays.push({
        date,
        day,
        hasMeals: scheduleEntry && scheduleEntry.meals && scheduleEntry.meals.length > 0,
        mealCount: scheduleEntry?.meals?.length || 0,
        isToday
      });
    }
    
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="monthly-calendar">
        <div className="monthly-weekdays">
          {weekDays.map(day => (
            <div key={day} className="monthly-weekday">{day}</div>
          ))}
        </div>
        <div className="monthly-days-grid">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={index} className="monthly-day-empty"></div>;
            }
            
            return (
              <div
                key={index}
                className={`monthly-day-cell ${dayData.isToday ? 'monthly-today' : ''} ${dayData.hasMeals ? 'monthly-has-meals' : ''}`}
                onClick={() => {
                  setCurrentDate(dayData.date);
                  setCurrentView('Daily');
                }}
              >
                <div className="monthly-day-number">{dayData.day}</div>
                {dayData.hasMeals && (
                  <div className="monthly-meal-indicator">
                    {dayData.mealCount} meal{dayData.mealCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
              <button className="nav-arrow" onClick={handlePrevious}>&lt;</button>
              <span className="month-label">{getDateLabel()}</span>
              <button className="nav-arrow" onClick={handleNext}>&gt;</button>
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
          {currentView === 'Daily' && renderDailyCalendar()}
          {currentView === 'Weekly' && renderWeeklyCalendar()}
          {currentView === 'Monthly' && renderMonthlyCalendar()}
          
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

