import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import './Streak.css';

function Streak({ onClose }) {
  const navigate = useNavigate();

  const handleCancel = () => {
    onClose();
  };

  const handlePost = () => {
    navigate('/connect-socials');
  };

  return (
    <>
      <div className="streak-overlay" onClick={handleCancel}></div>
      <div className="streak-modal" onClick={(e) => e.stopPropagation()}>
        <div className="streak-header">
          <div className="app-icon-square">
            <span className="app-name">Nutripal</span>
          </div>
          <div className="streak-text-bar">
            <p>I'm on a #-day streak with NourishPet! Take care of your pet, take care of yourself.</p>
          </div>
        </div>

        <div className="streak-pet-container">
          <img 
            src="/dog.png" 
            alt="Pet"
            className="streak-pet-image"
          />
        </div>

        <div className="streak-footer">
          <button className="streak-cancel-btn" onClick={handleCancel}>
            <FaTimes className="btn-icon" />
            Cancel
          </button>
          <button className="streak-post-btn" onClick={handlePost}>
            <FaPaperPlane className="btn-icon" />
            Post
          </button>
        </div>
      </div>
    </>
  );
}

export default Streak;

