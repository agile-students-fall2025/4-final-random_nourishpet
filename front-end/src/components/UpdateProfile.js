import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateProfile.css';
import { API_BASE_URL } from '../utils/api';

function UpdateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    username: '',
    password: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get email from localStorage
  const email = localStorage.getItem('email');

  // Fetch current profile data on component load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${email}`, {
          method: 'GET',
          credentials: 'include' 
        });
        const data = await response.json();
        
        if (data.success) {
          setFormData({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            email: data.profile.email || '',
            dateOfBirth: data.profile.dateOfBirth || '',
            username: data.profile.username || '',
            password: '', // Don't populate password
            bio: data.profile.bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchProfile();
    }
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleBack = () => {
    navigate('/profile');
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          bio: formData.bio
        }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile updated successfully!');
        navigate('/profile'); // Navigate back to profile page
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUsername = () => {
    navigate('/update-username');
  };

  const handleUpdatePassword = () => {
    navigate('/update-password');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="update-profile-screen">
      <div className="update-profile-container">
        <div className="update-profile-header">
          <div className="back-arrow" onClick={handleBack}>
            ←
          </div>
          <h1 className="update-profile-title">Update Profile</h1>
          <div className="menu-icon">
            ☰
          </div>
        </div>

        <div className="update-profile-form">
          <input 
            type="text"
            name="firstName"
            placeholder="First Name" 
            className="update-profile-input"
            value={formData.firstName}
            onChange={handleInputChange}
          />
          
          <input 
            type="text"
            name="lastName"
            placeholder="Last Name" 
            className="update-profile-input"
            value={formData.lastName}
            onChange={handleInputChange}
          />
          
          <input 
            type="email"
            name="email"
            placeholder="Email" 
            className="update-profile-input"
            value={formData.email}
            readOnly
          />
          
          <input 
            type="date"
            name="dateOfBirth"
            placeholder="Date Of Birth" 
            className="update-profile-input date-input"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
          />
          
          <div className="username-field">
            <input 
              type="text"
              name="username"
              placeholder="Username" 
              className="update-profile-input"
              value={formData.username}
              readOnly
            />
            <div className="update-link">
              Click <span onClick={handleUpdateUsername} className="here-link">here</span> to update username
            </div>
          </div>
          
          <div className="password-field">
            <input 
              type="password"
              name="password"
              placeholder="Password" 
              className="update-profile-input"
              value={formData.password}
              readOnly
            />
            <div className="update-link">
              Click <span onClick={handleUpdatePassword} className="here-link">here</span> to update password
            </div>
          </div>
          
          <textarea 
            name="bio"
            placeholder="Bio ...."
            className="update-profile-textarea"
            value={formData.bio}
            onChange={handleInputChange}
            rows="5"
          />
          
          <button 
            className="save-changes-button" 
            onClick={handleSaveChanges}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <div className="biometric-link">
            Click <span className="here-link">here</span> to update biometric data.
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;