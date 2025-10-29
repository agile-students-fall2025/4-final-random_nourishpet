import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; 
import './LogCalories.css';

function LogCalories() {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState('');
  const [meals, setMeals] = useState([]); 
  const [date, setDate] = useState('10/13/2025');

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!meal || !calories) {
      alert('Please fill in both fields.');
      return;
    }
    const newMeal = {
      id: Date.now(),
      name: meal,
      calories: parseInt(calories, 10),
    };
    setMeals((prev) => [...prev, newMeal]);
    setMeal('');
    setCalories('');
  };

  const handleDelete = (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEdit = (id) => {
    const item = meals.find((m) => m.id === id);
    if (item) {
      setMeal(item.name);
      setCalories(item.calories);
      handleDelete(id);
    }
  };

  return (
    <div className="logcal-container">
      <header className="logcal-header">
        <button className="icon-button">←</button>
        <h2 className="logcal-title">Log Calories</h2>
        <button className="icon-button">☰</button>
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
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.calories}</td>
                  <td className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(m.id)}
                      aria-label="Edit meal"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(m.id)}
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
