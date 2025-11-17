import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import Streak from './Streak';
import './MainScreen.css';

function MainScreen() {
  const navigate = useNavigate();
  const [showStreak, setShowStreak] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get email from localStorage (set during login)
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    // Fetch main screen data from backend
    const fetchMainScreenData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/main-screen/${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error('Error fetching main screen data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchMainScreenData();
    }
  }, [userEmail]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-screen">
      <div className="main-card">
        <div className="header">
          <div className="profile-avatar" onClick={() => navigate('/profile')}>
            <img 
              src={userData?.user?.profilePicture || "/user.png"} 
              alt="Profile"
              className="avatar-image"
            />
          </div>
          <HamburgerMenu />
        </div>

        <div className="streak-button" onClick={() => setShowStreak(true)}>
          <span>Streak: {userData?.streak?.currentStreak || 0} days</span>
        </div>

        <div className="pet-container">
          <img 
            src={userData?.pet?.petImage || "/dog.png"} 
            alt="Pet"
            className="pet-image"
          />
        </div>

        <div className="action-buttons">
          <button className="action-btn" onClick={() => navigate('/log-calories')}>
            Log
          </button>
          <button className="action-btn" onClick={() => navigate('/my-meal-plan')}>
            Plan
          </button>
        </div>
      </div>
      {showStreak && <Streak onClose={() => setShowStreak(false)} />}
    </div>
  );
}

export default MainScreen;