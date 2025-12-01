import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './UpdatePassword.css';

function UpdatePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Get email from localStorage
  const userEmail = localStorage.getItem('userEmail');

  const handleSaveChanges = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/profile/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Password updated successfully!');
        navigate('/profile');
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Error updating password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="New Password" 
            className="update-password-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="Confirm Password" 
            className="update-password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          {error && <p className="error-message">{error}</p>}
          
          <button 
            className="save-button"
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;