import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './ConnectSocials.css';

function ConnectSocials() {
  const navigate = useNavigate();

  return (
    <div className="connect-socials-container">
      <div className="connect-socials-card">
        <header className="connect-socials-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} style={{ marginRight: '6px' }} />
          </button>
          <h2 className="connect-socials-title">Connect Socials</h2>
          <HamburgerMenu />
        </header>
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

