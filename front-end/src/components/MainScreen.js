import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import Streak from './Streak';
import './MainScreen.css';

function MainScreen() {
  const navigate = useNavigate();
  const [showStreak, setShowStreak] = useState(false);

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
          <HamburgerMenu />
        </div>

        <div className="streak-button" onClick={() => setShowStreak(true)}>
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
          <button className="action-btn">Log</button>
          <button className="action-btn">Plan</button>
        </div>
      </div>
      {showStreak && <Streak onClose={() => setShowStreak(false)} />}
    </div>
  );
}

export default MainScreen;