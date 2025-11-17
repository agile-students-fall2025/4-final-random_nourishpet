import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './UpdateUsername.css';

function UpdateUsername() {
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Get email from localStorage
  const userEmail = localStorage.getItem('userEmail');

  // Fetch current username on component load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/profile/${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          setCurrentUsername(data.profile.username);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (userEmail) {
      fetchProfile();
    }
  }, [userEmail]);

  const handleSaveChanges = async () => {
    // Validate new username
    if (!newUsername.trim()) {
      setError('Please enter a new username');
      return;
    }

    if (newUsername === currentUsername) {
      setError('New username is the same as current username');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/profile/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          newUsername: newUsername.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Username updated successfully!');
        navigate('/profile');
      } else {
        setError(data.message || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Error updating username. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
          {currentUsername && (
            <p className="current-username">Current Username: <strong>{currentUsername}</strong></p>
          )}
          
          <input 
            type="text" 
            placeholder="New Username" 
            className="update-username-input"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
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

export default UpdateUsername;