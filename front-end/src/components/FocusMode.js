import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaLockOpen, FaBars, FaArrowLeft } from 'react-icons/fa';
import './FocusMode.css';

function FocusMode() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [focusLock, setFocusLock] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Stopwatch logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const handlePetClick = () => {
    if (!focusLock) {
      navigate('/main');
    }
  };

  return (
    // focus mode overlay 
    <div className="focus-container">
      {focusLock && <div className="focus-overlay"></div>}

      <header className={`focus-header ${focusLock ? 'disabled' : ''}`}>
        <button
          className="icon-button"
          onClick={() => navigate(-1)}
          disabled={focusLock}
        >
          <FaArrowLeft />
        </button>
        <h2 className="focus-title">
          {focusLock ? 'Focus Lock Enabled' : 'Focus Mode'}
        </h2>
        <button className="icon-button" disabled={focusLock}>
          <FaBars />
        </button>
      </header>

      <div className={`focus-content ${focusLock ? 'disabled' : ''}`}>
        <div className="timer-box">
          <span className="timer-display">{formatTime(time)}</span>
          {!focusLock && (
            <div className="timer-controls">
              <button className="timer-btn" onClick={() => setIsRunning(true)}>Start</button>
              <button className="timer-btn" onClick={() => setIsRunning(false)}>Pause</button>
              <button className="timer-btn" onClick={handleReset}>Reset</button>
            </div>
          )}
        </div>

        <div
          className={`pet-section ${focusLock ? 'enabled' : ''}`}
          onClick={handlePetClick}
        >
          <img src="/dog.png" alt="Pet" className="pet-image" />
        </div>

        {!focusLock && (
          <p className="focus-quote">
            Small steps every day lead to big changes! <br />
            You’ve got this!
          </p>
        )}
      </div>

      <div className="focus-footer">
        {!focusLock ? (
          <button
            className="focus-lock-btn"
            onClick={() => setFocusLock(true)}
          >
            <FaLock className="lock-icon" />
            Enable Focus Lock
          </button>
        ) : (
          <button
            className="focus-lock-btn"
            onClick={() => setFocusLock(false)}
          >
            <FaLockOpen className="lock-icon" />
            Disable Focus Lock
          </button>
        )}
      </div>
    </div>
  );
}

export default FocusMode;
