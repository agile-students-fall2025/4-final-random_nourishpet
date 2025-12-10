import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './UpdateBiometrics.css';
import { API_BASE_URL } from '../utils/api';

const defaultFormState = {
  heightCm: '',
  weightLbs: '',
  ethnicity: '',
  ethnicityOther: '',
  sex: '',
  age: '',
};

function UpdateBiometrics() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);
  const [unitSystem, setUnitSystem] = useState(localStorage.getItem('unitSystem') || 'metric');
  const [calculatedBmi, setCalculatedBmi] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('email');

    if (!email) {
      navigate('/signin');
      return;
    }

    setEmail(email);
    const loadBiometrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/biometrics/${encodeURIComponent(email)}`, {
          method: 'GET',
          credentials: 'include' 
        });
        if (!response.ok) {
          if (response.status === 404) {
            setFormData(defaultFormState);
            setCalculatedBmi(null);
            localStorage.removeItem('biometricData');
          } else {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || 'Unable to load biometrics');
          }
          return;
        }

        const data = await response.json();
        setFormData({
          heightCm: data.biometrics.heightCm?.toString() || '',
          weightLbs: data.biometrics.weightLbs?.toString() || '',
          ethnicity: data.biometrics.ethnicity || '',
          ethnicityOther: data.biometrics.ethnicityOther || '',
          sex: data.biometrics.sex || '',
          age: data.biometrics.age?.toString() || '',
        });
        setCalculatedBmi(data.biometrics.bmi ?? null);
        localStorage.setItem('biometricData', JSON.stringify(data.biometrics));
      } catch (err) {
        console.error('Failed to load biometrics', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBiometrics();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For direct form fields (we keep underlying storage in cm/lbs)
    setFormData(prev => {
      if (name === 'ethnicity' && value !== 'Other') {
        return { ...prev, [name]: value, ethnicityOther: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Unit conversion helpers
  const kgToLbs = (kg) => Number((kg * 2.2046226218).toFixed(2));
  const lbsToKg = (lbs) => Number((lbs / 2.2046226218).toFixed(2));
  const cmToIn = (cm) => Number((cm / 2.54).toFixed(2));
  const inToCm = (inch) => Number((inch * 2.54).toFixed(2));

  const handleUnitToggle = (newUnit) => {
    setUnitSystem(newUnit);
    localStorage.setItem('unitSystem', newUnit);
  };

  // Field-specific handlers to convert visible units into stored cm/lbs
  const handleHeightMetricChange = (e) => {
    const v = e.target.value;
    setFormData(prev => ({ ...prev, heightCm: v }));
  };

  const handleHeightImperialChange = (e) => {
    const v = e.target.value;
    const inches = parseFloat(v);
    if (Number.isNaN(inches)) {
      setFormData(prev => ({ ...prev, heightCm: '' }));
      return;
    }
    const cm = inToCm(inches);
    setFormData(prev => ({ ...prev, heightCm: String(cm) }));
  };

  const handleWeightMetricChange = (e) => {
    const v = e.target.value;
    const kg = parseFloat(v);
    if (Number.isNaN(kg)) {
      setFormData(prev => ({ ...prev, weightLbs: '' }));
      return;
    }
    const lbs = kgToLbs(kg);
    setFormData(prev => ({ ...prev, weightLbs: String(lbs) }));
  };

  const handleWeightImperialChange = (e) => {
    const v = e.target.value;
    setFormData(prev => ({ ...prev, weightLbs: v }));
  };

  const parseNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSave = async () => {
    if (isSaving || !email) {
      return;
    }

    setStatusMessage('');
    setError(null);

    const heightCm = parseNumber(formData.heightCm);
    const weightLbs = parseNumber(formData.weightLbs);
    const ageValue = parseNumber(formData.age);

    if (heightCm === null || weightLbs === null) {
      alert('Height (cm) and weight (lbs) are required.');
      return;
    }

    if (heightCm <= 0 || weightLbs <= 0) {
      alert('Height and weight must be positive numbers.');
      return;
    }

    setIsSaving(true);

    const payload = {
      email: email,
      height: heightCm,
      weight: weightLbs,
      ethnicity: formData.ethnicity,
      ethnicityOther: formData.ethnicity === 'Other' ? formData.ethnicityOther : '',
      sex: formData.sex,
      age: ageValue ?? undefined,
      unitSystem,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/biometrics/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include' 
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Failed to update biometrics');
      }

      const data = await response.json();
      setFormData({
        heightCm: data.biometrics.heightCm?.toString() || '',
        weightLbs: data.biometrics.weightLbs?.toString() || '',
        ethnicity: data.biometrics.ethnicity || '',
        ethnicityOther: data.biometrics.ethnicityOther || '',
        sex: data.biometrics.sex || '',
        age: data.biometrics.age?.toString() || '',
      });
      setCalculatedBmi(data.biometrics.bmi ?? null);

      localStorage.setItem('biometricData', JSON.stringify(data.biometrics));
      window.dispatchEvent(new Event('biometricDataUpdated'));
      setStatusMessage('Biometrics updated successfully.');
      navigate('/biometrics');
    } catch (err) {
      console.error('Error updating biometrics', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const bmiPlaceholder = calculatedBmi
    ? `${calculatedBmi}`
    : 'Input information to get your BMI score';

  return (
    <div className="update-biometrics-container">
      <div className="update-biometrics-card">
        <header className="update-biometrics-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={18} style={{ marginRight: '6px' }} />
          </button>
          <h2 className="update-biometrics-title">Update Biometric Data</h2>
          <HamburgerMenu />
        </header>

        <div className="update-biometrics-content">
          {isLoading ? (
            <p className="status-text">Loading your latest biometrics...</p>
          ) : (
            <>
              {error && <p className="error-text">{error}</p>}
              {statusMessage && <p className="status-text">{statusMessage}</p>}

              <div className="unit-toggle" style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  className={`unit-btn ${unitSystem === 'metric' ? 'active' : ''}`}
                  onClick={() => handleUnitToggle('metric')}
                >
                  Metric
                </button>
                <button
                  type="button"
                  className={`unit-btn ${unitSystem === 'imperial' ? 'active' : ''}`}
                  onClick={() => handleUnitToggle('imperial')}
                >
                  Imperial
                </button>
              </div>

              {unitSystem === 'metric' ? (
                <>
                  <div className="form-box">
                    <label htmlFor="heightCm">Height (cm)</label>
                    <input
                      type="number"
                      id="heightCm"
                      name="heightCm"
                      value={formData.heightCm}
                      onChange={handleHeightMetricChange}
                      className="input-field"
                      placeholder="Enter your height in centimeters"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-box">
                    <label htmlFor="weightKg">Weight (kg)</label>
                    <input
                      type="number"
                      id="weightKg"
                      name="weightKg"
                      value={formData.weightLbs ? lbsToKg(Number(formData.weightLbs)) : ''}
                      onChange={handleWeightMetricChange}
                      className="input-field"
                      placeholder="Enter your weight in kilograms"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-box">
                    <label htmlFor="heightIn">Height (in)</label>
                    <input
                      type="number"
                      id="heightIn"
                      name="heightIn"
                      value={formData.heightCm ? cmToIn(Number(formData.heightCm)) : ''}
                      onChange={handleHeightImperialChange}
                      className="input-field"
                      placeholder="Enter your height in inches"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-box">
                    <label htmlFor="weightLbs">Weight (lbs)</label>
                    <input
                      type="number"
                      id="weightLbs"
                      name="weightLbs"
                      value={formData.weightLbs}
                      onChange={handleWeightImperialChange}
                      className="input-field"
                      placeholder="Enter your weight in pounds"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </>
              )}

              <div className="form-box">
                <label htmlFor="ethnicity">Ethnicity</label>
                <select
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select ethnicity</option>
                  <option value="Asian">Asian</option>
                  <option value="Black">Black or African American</option>
                  <option value="Hispanic">Hispanic or Latino</option>
                  <option value="White">White</option>
                  <option value="Native American">Native American</option>
                  <option value="Pacific Islander">Pacific Islander</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.ethnicity === 'Other' && (
                <div className="form-box">
                  <label htmlFor="ethnicityOther">Describe your ethnicity</label>
                  <input
                    type="text"
                    id="ethnicityOther"
                    name="ethnicityOther"
                    value={formData.ethnicityOther}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your ethnicity"
                  />
                </div>
              )}

              <div className="form-box">
                <label htmlFor="sex">Sex (Biological)</label>
                <select
                  id="sex"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select biological sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Intersex">Intersex</option>
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
                  className="input-field"
                  placeholder="Enter your age"
                  min="0"
                />
              </div>

              <button className="save-button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>

              <div className="form-box">
                <label htmlFor="bmiDisplay">BMI (auto-calculated)</label>
                <input
                  type="text"
                  id="bmiDisplay"
                  name="bmiDisplay"
                  value={bmiPlaceholder}
                  readOnly
                  className="input-field disabled-input"
                />
                <p className="helper-text">Input your height and weight to automatically generate your BMI.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateBiometrics;
