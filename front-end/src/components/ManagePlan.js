import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ManagePlan.css';

function ManagePlan() {
  const navigate = useNavigate();

  return (
    <div className="manage-plan-container">
      <div className="manage-plan-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Manage Plan</h1>
          <HamburgerMenu />
        </div>

        <div className="manage-plan-content">
          <p>Manage Plan page - Coming soon</p>
          <button className="generate-button" onClick={() => navigate('/generate-meal-plan')}>
            Generate New Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagePlan;

