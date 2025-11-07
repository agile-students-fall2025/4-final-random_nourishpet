import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './Activities.css';

function Activities() {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
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
    navigate('/connect-socials');
  };

  return (
    <div className="activities-container">
      <div className="activities-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} style={{ marginRight: '6px' }} />
          </button>
          <h1 className="page-title">Activity</h1>
          <HamburgerMenu />
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
