import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainScreen.css';

function MainScreen() {
  const navigate = useNavigate();

  return (
    <div className="main-screen">
      <div className="main-card">
        <div className="header">
          <div className="profile-avatar" onClick={() => navigate('/profile')}>
            <img 
              src="/user.png" 
              alt="Profile"
              className="avatar-image"
            />
          </div>
          <div className="menu-icon">
            <div className="menu-line"></div>
            <div className="menu-line"></div>
            <div className="menu-line"></div>
          </div>
        </div>

        <div className="streak-button">
          <span>Streak</span>
        </div>

        <div className="pet-container">
          <img 
            src="/dog.png" 
            alt="Pet"
            className="pet-image"
          />
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={() => navigate('/log-calories')}>Log</button>
          <button className="action-btn" onClick={() => navigate('/generate-meal-plan')}>Plan</button>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;