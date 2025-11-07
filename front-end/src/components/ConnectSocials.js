import React from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import './ConnectSocials.css';

function ConnectSocials() {
  const navigate = useNavigate();

  return (
    <div className="connect-socials-container">
      <div className="connect-socials-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Connect Socials</h1>
          <HamburgerMenu />
        </div>
        {/* default list of social icons will be updated for actual connections and popular apps */}
        <div className="social-icons-grid">
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">Instagram</span>
          </div>
          
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">Facebook</span>
          </div>
          
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">Twitter</span>
          </div>
          
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">LinkedIn</span>
          </div>
          
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">TikTok</span>
          </div>
          
          <div className="social-icon-box">
            <div className="icon-placeholder"></div>
            <span className="icon-label">Snapchat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectSocials;

