import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './Biometrics.css';

const defaultBiometricData = {
  heightCm: null,
  weightLbs: null,
  bmi: null,
  ethnicity: '',
  ethnicityOther: '',
  sex: '',
  age: null,
};

function Biometrics() {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  const [biometricData, setBiometricData] = useState(defaultBiometricData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    const savedData = localStorage.getItem('biometricData');
    if (savedData) {
      setBiometricData(JSON.parse(savedData));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem('biometricData');
    if (savedData) {
      setBiometricData(JSON.parse(savedData));
      } else {
        setBiometricData(defaultBiometricData);
    }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('biometricDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('biometricDataUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchBiometrics = async () => {
      if (!email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/biometrics/${encodeURIComponent(email)}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          if (response.status !== 404) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || 'Unable to load biometrics');
          }
          setBiometricData(defaultBiometricData);
          localStorage.removeItem('biometricData');
          return;
        }

        const data = await response.json();
        setBiometricData(data.biometrics);
        localStorage.setItem('biometricData', JSON.stringify(data.biometrics));
      } catch (err) {
        console.error('Failed to load biometrics', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBiometrics();
  }, [API_BASE_URL, email]);

  const handleUpdate = () => {
    navigate('/update-biometrics');
  };

  const formatMeasurement = (value, unit) => {
    if (value === null || value === undefined) {
      return 'Not set';
    }
    return `${value} ${unit}`;
  };

  const formatEthnicity = () => {
    if (!biometricData.ethnicity) {
      return 'Not set';
    }
    if (biometricData.ethnicity === 'Other') {
      return biometricData.ethnicityOther || 'Other';
    }
    return biometricData.ethnicity;
  };

  const bmiDisplay = biometricData.bmi === null || biometricData.bmi === undefined
    ? 'Enter height and weight to unlock your BMI'
    : biometricData.bmi;

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

        {isLoading ? (
          <p className="status-text">Loading your biometrics...</p>
        ) : !email ? (
          <p className="status-text">Sign in to view and update your biometrics.</p>
        ) : (
          <div className="biometrics-content">
            {error && <p className="error-text">{error}</p>}

            <div className="biometric-box">
              <div className="box-label">Height (cm)</div>
              <div className="box-value">{formatMeasurement(biometricData.heightCm, 'cm')}</div>
            </div>

            <div className="biometric-box">
              <div className="box-label">Weight (lbs)</div>
              <div className="box-value">{formatMeasurement(biometricData.weightLbs, 'lbs')}</div>
            </div>

            <div className="biometric-box">
              <div className="box-label">Ethnicity</div>
              <div className="box-value">{formatEthnicity()}</div>
            </div>

            <div className="biometric-box">
              <div className="box-label">Sex (Biological)</div>
              <div className="box-value">{biometricData.sex || 'Not set'}</div>
            </div>

            <div className="biometric-box">
              <div className="box-label">Age</div>
              <div className="box-value">
                {biometricData.age === null || biometricData.age === undefined ? 'Not set' : biometricData.age}
              </div>
            </div>
            
            <div className="biometric-box">
              <div className="box-label">BMI</div>
              <div className="box-value">{bmiDisplay}</div>
            </div>

            <button className="update-button" onClick={handleUpdate}>
              Update Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Biometrics;