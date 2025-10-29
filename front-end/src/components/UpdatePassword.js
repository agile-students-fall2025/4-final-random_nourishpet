import React from 'react';
import { useNavigate } from 'react-router-dom';
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
          <h1 className="update-password-title">Forgot Password</h1>
          <div className="spacer"></div>
        </div>

        <div className="update-password-form">
          <input 
            type="email" 
            placeholder="Email" 
            className="update-password-input"
          />
          
          <button className="send-button">Send Email Link</button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;