import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import HamburgerMenu from './HamburgerMenu';
import './LogCalories.css';

function LogCalories() {
  const navigate = useNavigate();
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');
  const [meals, setMeals] = useState([]); 
  const [date] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  });

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (!email) return;

    fetch(`http://localhost:3001/api/meals/${email}`, {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMeals(data.meals);
      })
      .catch(err => console.error('Fetch meals error:', err));
  }, [email]);   // only re-run when email changes


  // Adding meals to backend
  const handleAddMeal = async (e) => {
    e.preventDefault();

    if (!meal || !calories) {
      alert('Please fill in both fields.');
      return;
    }

    const newMeal = {
      email,
      name: meal,
      calories,
      date
    };

    try {
      const res = await fetch('http://localhost:3001/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        // Update UI with saved meal from DB
        setMeals(prev => [data.meal, ...prev]);
        setMeal('');
        setCalories('');
      } else {
        alert(data.message || 'Error saving meal');
      }
    } catch (err) {
      console.error('Add meal error:', err);
      alert('Server error');
    }
  };

  const handleDelete = (id) => {
    setMeals((prev) => prev.filter((m) => m._id !== id));
  };

  const handleEdit = (id) => {
    const item = meals.find((m) => m._id === id);
    if (item) {
      setMeal(item.name);
      setCalories(item.calories);
      handleDelete(id);
    }
  };

  return (
    <div className="logcal-container">
      <header className="logcal-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft style={{ marginRight: '6px' }} />
        </button>
        <h2 className="logcal-title">Log Calories</h2>

        <HamburgerMenu />
      </header>

      <form className="logcal-form" onSubmit={handleAddMeal}>
        <div className="form-group">
          <label htmlFor="meal">Add Meal</label>
          <input
            id="meal"
            type="text"
            placeholder="e.g. Chicken Wrap"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calories">Number of Calories</label>
          <input
            id="calories"
            type="number"
            placeholder="e.g. 450"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>

        <button type="submit" className="add-button">Add</button>
      </form>

      <div className="logcal-table-section">
        <div className="table-header">
          <h3>Previous Meals</h3>
          <div className="date-nav">
            <button className="date-arrow">{'<'}</button>
            <span>{date}</span>
            <button className="date-arrow">{'>'}</button>
          </div>
        </div>

        <table className="meals-table">
          <thead>
            <tr>
              <th>Meal</th>
              <th>Calories</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {meals.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-message">No meals logged yet.</td>
              </tr>
            ) : (
              meals.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.calories}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(m._id)}
                      aria-label="Edit meal"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(m._id)}
                      aria-label="Delete meal"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LogCalories;
