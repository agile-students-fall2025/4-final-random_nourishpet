import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './ConnectSocials.css';

function ConnectSocials() {
  const navigate = useNavigate();
  const socials = [
    {
      name: 'Instagram',
      icon: '/instagram.png',
      url: 'https://www.instagram.com'
    },
    {
      name: 'Facebook',
      icon: '/facebook.png',
      url: 'https://www.facebook.com'
    },
    {
      name: 'Twitter',
      icon: '/twitter.png',
      url: 'https://www.twitter.com'
    },
    {
      name: 'LinkedIn',
      icon: '/linkedin.png',
      url: 'https://www.linkedin.com'
    },
    {
      name: 'WhatsApp',
      icon: '/social.png',
      url: 'https://www.whatsapp.com'
    },
    {
      name: 'Snapchat',
      icon: '/snapchat.png',
      url: 'https://www.snapchat.com'
    }
  ];

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
          {socials.map(({ name, icon, url }) => (
            <a
              key={name}
              className="social-icon-box"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={icon} alt={name} className="social-icon-image" />
              <span className="icon-label">{name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConnectSocials;

