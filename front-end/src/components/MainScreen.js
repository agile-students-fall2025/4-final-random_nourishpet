import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import Streak from './Streak';
import './MainScreen.css';
import { API_BASE_URL } from '../utils/api';

function MainScreen() {
  const navigate = useNavigate();
  const [showStreak, setShowStreak] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [petClicked, setPetClicked] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Get email from localStorage (set during login)
  const email = localStorage.getItem('email');

  useEffect(() => {
    // Fetch main screen data from backend
    const fetchMainScreenData = async () => {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${API_BASE_URL}/api/main-screen/${email}`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.success) {
          setUserData(data.data);
        } else {
          console.warn('Main screen data fetch unsuccessful, using defaults');
          setUserData(null);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Fetch timeout - continuing with defaults');
        } else {
          console.error('Error fetching main screen data:', error);
        }
        // Set defaults even if fetch fails
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchMainScreenData();
    } else {
      setLoading(false);
    }
  }, [email]);

  const handlePetClick = () => {
    setPetClicked(true);
    setShowHearts(true);
    setTimeout(() => setPetClicked(false), 600);
    setTimeout(() => setShowHearts(false), 1200);
  };

  const getPetMood = () => {
    const streak = userData?.streak?.currentStreak || 0;
    if (streak >= 7) return 'happy';
    if (streak >= 3) return 'content';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="main-screen">
        <div className="main-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
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

        <div className="pet-container" onClick={handlePetClick}>
          <img 
            src={userData?.pet?.petImage || "/dog.png"} 
            alt="Pet"
            className={`pet-image ${petClicked ? 'pet-clicked' : ''} pet-mood-${getPetMood()}`}
          />
          {showHearts && (
            <div className="pet-hearts">
              <span className="heart heart-1">❤️</span>
              <span className="heart heart-2">❤️</span>
              <span className="heart heart-3">❤️</span>
            </div>
          )}
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