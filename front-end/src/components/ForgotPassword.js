import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="forgot-password-screen">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <div className="back-arrow" onClick={() => navigate('/signin')}>
            ←
          </div>
          <h1 className="forgot-password-title">Forgot Password</h1>
          <HamburgerMenu />
        </div>

        <div className="forgot-password-form">
          <input 
            type="email" 
            placeholder="Email" 
            className="forgot-password-input"
          />
          
          <button className="send-button">Send Email Link</button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;