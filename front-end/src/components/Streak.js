import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import './Streak.css';
import { API_BASE_URL } from '../utils/api';

function Streak({ onClose }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const streakMessage = "I'm on a #-day streak with NutriPal! Take care of your pet, take care of yourself.";

  const handleCancel = () => {
    onClose();
  };

  const handlePost = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: streakMessage }),
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Failed to share streak');
      }

      console.log('Streak message submitted:', streakMessage);

      if (typeof onClose === 'function') {
        onClose();
      }

      navigate('/connect-socials');
    } catch (error) {
      console.error('Error submitting streak message:', error);
      alert('We could not share your streak right now. Please try again.');
      setIsSubmitting(false);
    }
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
            <p>{streakMessage}</p>
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
          <button className="streak-post-btn" onClick={handlePost} disabled={isSubmitting}>
            <FaPaperPlane className="btn-icon" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </>
  );
}

export default Streak;

