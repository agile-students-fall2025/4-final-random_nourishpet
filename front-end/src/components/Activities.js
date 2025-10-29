import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Activities.css';

function Activities() {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    console.log('Posting activity:', { activityType, timeSpent, selectedImage });
    navigate('/connect-socials'); //take them to add socials page
  };

  return (
    <div className="activities-container">
      <div className="activities-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Activity</h1>
          <div className="menu-container">
            <button className="hamburger-menu" onClick={() => setShowMenu(!showMenu)}>
              ☰
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/biometrics')}>Biometric Data</button>
                <button onClick={() => navigate('/activities')}>Activities</button>
                <button onClick={() => navigate('/signin')}>Sign Out</button>
              </div>
            )}
          </div>
        </div>

        <div className="activities-content">
          <div className="image-upload-section">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload" className="image-upload-box">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              ) : (
                <span className="upload-icon">📷 Click to add image</span>
              )}
            </label>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="activity-type">Activity Type</label>
              <select
                id="activity-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="dropdown-select"
              >
                {/* default list of activity types will be updated in the future */}
                <option value="">Select activity type</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="yoga">Yoga</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time-spent">Time Spent</label>
              <select
                id="time-spent"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                className="dropdown-select"
              >
                {/* default list of times will be updated */}
                <option value="">Select time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2+ hours</option>
              </select>
            </div>
          </div>

          <button
            className="post-button"
            onClick={handlePost}
            disabled={!activityType || !timeSpent}
          >
            POST
          </button>
        </div>
      </div>
    </div>
  );
}

export default Activities;

