import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './MyMealPlan.css';

const DUMMY_SCHEDULE = {
    'Sun 19': { meals: [], total: null, mood: null },
    'Mon 13': { meals: [{ type: 'Meal 1', name: 'Oats' }, { type: 'Meal 2', name: 'Fish' }, { type: 'Meal 3', name: 'Steak' }], total: '1850 kcal', mood: 'Happy' },
    'Tue 14': { meals: [{ type: 'Meal 1', name: 'Yogurt' }, { type: 'Meal 2', name: 'Pasta' }, { type: 'Meal 3', name: 'Chicken' }], total: '1920 kcal', mood: 'Energetic' },
    'Wed 15': { meals: [{ type: 'Meal 1', name: 'Eggs' }, { type: 'Meal 2', name: 'Salad' }, { type: 'Meal 3', name: 'Soup' }], total: '1950 kcal', mood: 'Calm', currentDay: true },
    'Thu 16': { meals: [], total: null, mood: null },
    'Fri 17': { meals: [], total: null, mood: null },
    'Sat 18': { meals: [], total: null, mood: null },
};

const TARGET_MONTH = 9;
const TARGET_YEAR = 2025;
const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const getMonthlyCalendarDays = (year, month) => {
    const today = new Date();
    const firstDayOfMonth = new Date(year, month, 1);
    
    const startDayOffset = firstDayOfMonth.getDay(); 
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDayOffset); 
    
    const days = [];
    let currentDate = startDate;

    for (let i = 0; i < 42; i++) {
        const dayOfMonth = currentDate.getDate();
        const monthIndex = currentDate.getMonth();
        const yearValue = currentDate.getFullYear();
        const dayOfWeek = currentDate.getDay();
        const dayName = DAY_ORDER[dayOfWeek];
        
        let dayData = {};
        
        const isTargetDate = (monthIndex === TARGET_MONTH && yearValue === TARGET_YEAR);
        
        const dummyKey = `${dayName} ${dayOfMonth}`;

        if (isTargetDate && DUMMY_SCHEDULE[dummyKey]) {
             dayData = DUMMY_SCHEDULE[dummyKey];
        }

        days.push({
            date: new Date(currentDate),
            dayOfMonth,
            isCurrentMonth: monthIndex === month,
            isCurrentDay: today.toDateString() === currentDate.toDateString(),
            dayName: dayName,
            ...dayData
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
};


function MyMealPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const [focusLock] = useState(false);
  const [currentView, setCurrentView] = useState('Weekly');
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(2);
  
  const [currentDate, setCurrentDate] = useState(new Date(TARGET_YEAR, TARGET_MONTH, 15)); 


  const [mealPlanData, setMealPlanData] = useState({
    goal: 'Balanced Diet',
    duration: '30-Day Plan',
    calories: '2000 Calories',
    progress: 'Day 5 of 30'
  });

  const weeklySchedule = useMemo(() => {
    const entries = Object.entries(DUMMY_SCHEDULE).map(([day, data]) => ({ day, ...data }));
    
    return entries.sort((a, b) => {
        const dayA = a.day.split(' ')[0];
        const dayB = b.day.split(' ')[0];
        return DAY_ORDER.indexOf(dayA) - DAY_ORDER.indexOf(dayB);
    });
  }, []);
  
  const selectedDayData = weeklySchedule[selectedDayIndex];

  const monthlyCalendarDays = useMemo(() => {
    return getMonthlyCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);


  useEffect(() => {
    if (location.state) {
      setMealPlanData(location.state);
    }
  }, [location.state]);

  const navigateDay = useCallback((direction) => {
    setSelectedDayIndex(prevIndex => {
      const newIndex = prevIndex + direction;
      return Math.max(0, Math.min(weeklySchedule.length - 1, newIndex));
    });
  }, [weeklySchedule.length]);
  
  const navigateMonth = useCallback((direction) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + direction, 15); 
          return newDate;
      });
  }, []);

  const getCalendarLabel = () => {
      if (currentView === 'Daily') {
          return selectedDayData ? selectedDayData.day : 'Loading...';
      }
      if (currentView === 'Monthly') {
          return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      if (weeklySchedule.length >= 7) {
          const firstDay = weeklySchedule[0].day;
          const lastDay = weeklySchedule[weeklySchedule.length - 1].day;
          return `${firstDay} - ${lastDay.split(' ')[0]} 2025`; 
      }
      return 'October 2025';
  };

  const renderMonthlyCalendar = () => {
    const daysOfWeek = DAY_ORDER;

    return (
        <div className="monthly-calendar-container">
            <div className="days-of-week-header">
                {daysOfWeek.map(day => <div key={day} className="day-name-header">{day}</div>)}
            </div>
            <div className="calendar-grid monthly-grid">
                {monthlyCalendarDays.map((dayData, index) => (
                    <div 
                        key={index} 
                        className={`day-cell monthly-day-cell ${!dayData.isCurrentMonth ? 'other-month' : ''} ${dayData.isCurrentDay ? 'current-day' : ''}`}
                        onClick={() => {
                            const dayIndex = weeklySchedule.findIndex(d => d.day.includes(dayData.dayOfMonth));
                            if (dayIndex !== -1) {
                                setCurrentView('Daily');
                                setSelectedDayIndex(dayIndex);
                            }
                        }}
                    >
                        <span className="monthly-day-date">{dayData.dayOfMonth}</span>
                        {dayData.meals && dayData.meals.length > 0 && (
                            <div className="monthly-meal-summary">
                                {/* Display up to 2 meal type acronyms/initials (e.g., '1' for Meal 1) */}
                                {dayData.meals.slice(0, 2).map((meal, mealIndex) => (
                                    <span key={mealIndex} className="meal-dot">{meal.type.split(' ')[1]}</span>
                                ))}
                            </div>
                        )}
                        {dayData.total && <span className="monthly-total-summary">{dayData.total.split(' ')[0]}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
  };


  const renderWeeklyCalendar = () => (
    <div className="calendar-grid">
      {weeklySchedule.map((dayData, index) => (
        <div
          key={index}
          className={`day-cell ${dayData.currentDay ? 'current-day' : ''}`}
          onClick={() => {
              setCurrentView('Daily');
              setSelectedDayIndex(index);
          }}
        >
          <div className={`day-header ${dayData.currentDay ? 'current-day-header' : ''}`}>
            {/* Extract Sun 19 to Sun and 19 */}
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
                onClick={() => currentView === 'Daily' ? navigateDay(-1) : currentView === 'Monthly' ? navigateMonth(-1) : null}
                disabled={focusLock || (currentView === 'Daily' && selectedDayIndex === 0)}
              >
                &lt;
              </button>
              <span className="month-label">
                {getCalendarLabel()}
              </span>
              <button 
                className="nav-arrow" 
                onClick={() => currentView === 'Daily' ? navigateDay(1) : currentView === 'Monthly' ? navigateMonth(1) : null}
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
          
          {/* WRAPPER ADDED HERE TO STABILIZE HEIGHT */}
          <div className="schedule-content-wrapper">
              {currentView === 'Weekly' && renderWeeklyCalendar()}
              {currentView === 'Daily' && renderDailyView()}
              {currentView === 'Monthly' && renderMonthlyCalendar()}
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