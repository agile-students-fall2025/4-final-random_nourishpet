import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ProfileScreen.css';

function ProfileScreen() {
  const navigate = useNavigate();

  return (
    <div className="profile-screen">
      <div className="profile-container">
        <div className="profile-header">
          <div className="back-arrow" onClick={() => navigate('/main-screen')}>
            ←
          </div>
          <h1 className="profile-title">Profile</h1>
          <HamburgerMenu />
        </div>

        <div className="profile-form">
          <input 
            type="text" 
            placeholder="First Name" 
            className="profile-input"
          />
          
          <input 
            type="text" 
            placeholder="Last Name" 
            className="profile-input"
          />
          
          <input 
            type="email" 
            placeholder="Email" 
            className="profile-input"
          />
          
          <input 
            type="date" 
            placeholder="Date Of Birth" 
            className="profile-input"
          />
          
          <input 
            type="text" 
            placeholder="Username" 
            className="profile-input"
          />
          <p className="update-link">
            Click <span className="link-text" onClick={() => navigate('/update-username')}>here</span> to update username
          </p>
          
          <input 
            type="password" 
            placeholder="Password" 
            className="profile-input"
          />
          <p className="update-link">
            Click <span className="link-text" onClick={() => navigate('/update-password')}>here</span> to update password
          </p>
          
          <textarea 
            placeholder="Bio ...." 
            className="profile-textarea"
            rows="3"
          />
          
         <button className="update-button" 
          onClick={() => navigate('/update-profile')}>
          Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;