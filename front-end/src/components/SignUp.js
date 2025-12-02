import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Sign up successful:', data);
        // Store user data in localStorage and auto-login
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('email', formData.email);
        localStorage.setItem('username', data.user.username);
        localStorage.removeItem('biometricData');
        window.dispatchEvent(new Event('biometricDataUpdated'));
        alert('Account created successfully!');
        navigate('/update-biometrics');
      } else {
        alert(data.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-logo">NutriPal</h1>
          <p className="signup-subtitle">Create your account to start your nutrition journey</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="terms-and-conditions">
              <input type="checkbox" required />
              <span>I agree to the <button 
                type="button"
                onClick={() => {/* Terms page - placeholder */}}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}
              >
                Terms and Conditions
              </button> and <button 
                type="button"
                onClick={() => {/* Privacy page - placeholder */}}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}
              >
                Privacy Policy
              </button></span>
            </label>
          </div>

          <button type="submit" className="signup-button">
            Create Account
          </button>

          <div className="signin-link">
            Already have an account? <button 
              type="button"
              onClick={() => navigate('/signin')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', textDecoration: 'underline' }}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;