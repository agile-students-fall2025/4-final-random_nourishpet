import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './UpdatePassword.css';

function UpdatePassword() {
  const navigate = useNavigate();

  return (
    <div className="update-password-screen">
      <div className="update-password-container">
        <div className="update-password-header">
          <div className="back-arrow" onClick={() => navigate('/profile')}>
            ←
          </div>
          <h1 className="update-password-title">Update Password</h1>
          <HamburgerMenu />
        </div>

        <div className="update-password-form">
          <input 
            type="password" 
            placeholder="Old Password" 
            className="update-password-input"
          />
          
          <input 
            type="password" 
            placeholder="New Password" 
            className="update-password-input"
          />
          
          <input 
            type="password" 
            placeholder="Confirm Password" 
            className="update-password-input"
          />
          
          <button className="save-button">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;