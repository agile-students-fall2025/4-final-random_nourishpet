import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateProfile.css';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleBack = () => {
    navigate('/profile'); // Navigate back to profile page
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData);
    // Add your save logic here
    // navigate('/profile'); // Optionally navigate back after saving
  };

  const handleUpdateUsername = () => {
    navigate('/update-username');
  };

  const handleUpdatePassword = () => {
    navigate('/update-password');
  };

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
            onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
          
          <button className="save-changes-button" onClick={handleSaveChanges}>
            Save Changes
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