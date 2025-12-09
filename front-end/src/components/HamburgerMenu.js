import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './HamburgerMenu.css';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

function HamburgerMenu({ disabled = false }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { setUser } = useContext(AuthContext);

  const menuItems = [
    { label: 'Log Calories', path: '/log-calories' },
    { label: 'My Meal Plan', path: '/my-meal-plan' },
    { label: 'Generate Meal Plan', path: '/generate-meal-plan' },
    { label: 'Manage Plan', path: '/manage-plan' },
    { label: 'Log Activity', path: '/activities' },
    { label: 'Focus Mode', path: '/focus-mode' },
    { label: 'Biometric Data', path: '/biometrics' },
    { label: 'Connect Socials', path: '/connect-socials' },
    { label: 'Profile', path: '/profile' },
    { label: 'Logout', path: 'LOGOUT' }   // sentinel
  ];

  const handleMenuClick = async (path) => {
    setShowMenu(false);

    if (path === 'LOGOUT') {
      try {
        // Backend logout
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });

        // Clear user from context
        setUser(null);

        // Redirect
        navigate('/signin');
      } catch (err) {
        console.error('Logout failed:', err);
      }

      return;
    }

    navigate(path);
  };

  return (
    <div className="hamburger-menu-container">
      <button 
        className="hamburger-menu-button" 
        onClick={() => !disabled && setShowMenu(!showMenu)}
        disabled={disabled}
        aria-label="Menu"
      >
        <FaBars size={22} />
      </button>

      {showMenu && !disabled && (
        <div className="hamburger-dropdown-menu">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleMenuClick(item.path)}
              className="dropdown-menu-item"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HamburgerMenu;
