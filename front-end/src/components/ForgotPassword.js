import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ForgotPassword.css';
import { API_BASE_URL } from '../utils/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('If an account exists with this email, a password reset link has been sent.');
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            className="forgot-password-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
          {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
          
          <button 
            type="submit" 
            className="send-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Email Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;