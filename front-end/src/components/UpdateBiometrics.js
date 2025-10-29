import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UpdateBiometrics.css';

function UpdateBiometrics() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bmi: '',
    ethnicity: '',
    gender: '',
    age: ''
  });

  const [originalData, setOriginalData] = useState({
    height: 'Set data for meal plan',
    weight: 'Not set',
    bmi: 'Set data for meal plan',
    ethnicity: 'Set data for meal plan',
    gender: 'Set data for meal plan',
    age: 'Set data for meal plan'
  });

  useEffect(() => {
    const savedData = localStorage.getItem('biometricData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setOriginalData(parsed);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    const updatedData = { ...originalData };
    
    Object.keys(formData).forEach(key => {
      if (formData[key].trim() !== '') {
        updatedData[key] = formData[key].trim();
      }
    });

    // Save to local storage
    localStorage.setItem('biometricData', JSON.stringify(updatedData));
    window.dispatchEvent(new Event('biometricDataUpdated'));
    
    // go back to biometrics page
    navigate('/biometrics');
  };

  return (
    <div className="update-biometrics-container">
      <div className="update-biometrics-card">
        <div className="top-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="page-title">Update Biometric Data</h1>
          <div className="menu-container">
            <button className="hamburger-menu" onClick={() => setShowMenu(!showMenu)}>
              ☰
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/biometrics')}>Biometric Data</button>
                <button onClick={() => navigate('/activities')}>Activities</button>
                <button onClick={() => navigate('/signin')}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
        {/* default form fields will be updated to take in inches/cm, and kg/lbs */}
        <div className="update-biometrics-content">
          <div className="form-box">
            <label htmlFor="height">Height (e.g., 5'10", 180cm)</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder={`Current: ${originalData.height}`}
              className="input-field"
            />
          </div>

          <div className="form-box">
            <label htmlFor="weight">Weight (e.g., 70kg, 154lbs)</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder={`Current: ${originalData.weight}`}
              className="input-field"
            />
          </div>

          <div className="form-box">
            <label htmlFor="bmi">BMI</label>
            <input
              type="text"
              id="bmi"
              name="bmi"
              value={formData.bmi}
              onChange={handleChange}
              placeholder={`Current: ${originalData.bmi}`}
              className="input-field"
            />
          </div>

          <div className="form-box">
            <label htmlFor="ethnicity">Ethnicity</label>
            <select
              id="ethnicity"
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
              className="input-field"
            >
              {/* default list of ethnicities will be updated in the future */}
              <option value="">Select ethnicity</option>
              <option value="Asian">Asian</option>
              <option value="Black">Black</option>
              <option value="Hispanic">Hispanic</option>
              <option value="White">White</option>
              <option value="Native American">Native American</option>
              <option value="Pacific Islander">Pacific Islander</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-box">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input-field"
            >
              {/* default list of genders will be updated in the future */}
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="form-box">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder={`Current: ${originalData.age}`}
              className="input-field"
            />
          </div>

          <button className="save-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateBiometrics;

