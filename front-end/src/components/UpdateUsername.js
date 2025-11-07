import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './UpdateUsername.css';

function UpdateUsername() {
  const navigate = useNavigate();

  return (
    <div className="update-username-screen">
      <div className="update-username-container">
        <div className="update-username-header">
          <div className="back-arrow" onClick={() => navigate('/profile')}>
            ←
          </div>
          <h1 className="update-username-title">Update Username</h1>
          <HamburgerMenu />
        </div>

        <div className="update-username-form">
          <input 
            type="text" 
            placeholder="New Username" 
            className="update-username-input"
          />
          
          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default UpdateUsername;