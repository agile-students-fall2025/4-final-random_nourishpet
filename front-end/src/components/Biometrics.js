import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './Biometrics.css';

function Biometrics() {
  const navigate = useNavigate();
  const [biometricData, setBiometricData] = useState({
    height: 'Set data for meal plan',
    weight: 'Set data for meal plan',
    bmi: 'Set data for meal plan',
    ethnicity: 'Set data for meal plan',
    gender: 'Set data for meal plan',
    age: 'Set data for meal plan'
  });

  useEffect(() => {
    const savedData = localStorage.getItem('biometricData');
    if (savedData) {
      setBiometricData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem('biometricData');
      if (savedData) {
        setBiometricData(JSON.parse(savedData));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('biometricDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('biometricDataUpdated', handleStorageChange);
    };
  }, []);

  const handleUpdate = () => {
    navigate('/update-biometrics');
  };

  return (
    <div className="biometrics-container">
      <div className="biometrics-card">
        <header className="biometrics-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} style={{ marginRight: '6px' }} />
          </button>
          <h2 className="biometrics-title">Biometric Data</h2>
          <HamburgerMenu />
        </header>

        <div className="biometrics-content">
          <div className="biometric-box">
            <div className="box-label">Height</div>
            <div className="box-value">{biometricData.height}</div>
          </div>

          <div className="biometric-box">
            <div className="box-label">Weight</div>
            <div className="box-value">{biometricData.weight}</div>
          </div>

          <div className="biometric-box">
            <div className="box-label">BMI</div>
            <div className="box-value">{biometricData.bmi}</div>
          </div>

          <div className="biometric-box">
            <div className="box-label">Ethnicity</div>
            <div className="box-value">{biometricData.ethnicity}</div>
          </div>

          <div className="biometric-box">
            <div className="box-label">Gender</div>
            <div className="box-value">{biometricData.gender}</div>
          </div>

          <div className="biometric-box">
            <div className="box-label">Age</div>
            <div className="box-value">{biometricData.age}</div>
          </div>

          <button className="update-button" onClick={handleUpdate}>
            Update Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Biometrics;
