import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ProfileScreen.css';

function ProfileScreen() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    username: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);

  // Get email from localStorage (set during login)
  const email = localStorage.getItem('email');

  useEffect(() => {
    // Fetch profile data from backend
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/profile/${email}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setProfileData(data.profile);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-screen">
      <div className="profile-container">
        <div className="profile-header">
          <div className="back-arrow" onClick={() => navigate('/main-screen')}>
            ←
          </div>
          <h1 className="profile-title">Profile</h1>
          <HamburgerMenu />
        </div>

        <div className="profile-form">
          <input 
            type="text" 
            placeholder="First Name" 
            className="profile-input"
            value={profileData.firstName}
            readOnly
          />
          
          <input 
            type="text" 
            placeholder="Last Name" 
            className="profile-input"
            value={profileData.lastName}
            readOnly
          />
          
          <input 
            type="email" 
            placeholder="Email" 
            className="profile-input"
            value={profileData.email}
            readOnly
          />
          
          <input 
            type="date" 
            placeholder="Date Of Birth" 
            className="profile-input"
            value={profileData.dateOfBirth}
            readOnly
          />
          
          <input 
            type="text" 
            placeholder="Username" 
            className="profile-input"
            value={profileData.username}
            readOnly
          />
          <p className="update-link">
            Click <span className="link-text" onClick={() => navigate('/update-username')}>here</span> to update username
          </p>
          
          <input 
            type="password" 
            placeholder="Password" 
            className="profile-input"
            value="••••••••"
            readOnly
          />
          <p className="update-link">
            Click <span className="link-text" onClick={() => navigate('/update-password')}>here</span> to update password
          </p>
          
          <textarea 
            placeholder="Bio ...." 
            className="profile-textarea"
            rows="3"
            value={profileData.bio}
            readOnly
          />
          
         <button className="update-button" 
          onClick={() => navigate('/update-profile')}>
          Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;