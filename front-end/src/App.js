import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Meal from './components/Meal';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>NourishPet</h1>
        <p>Transform nutrition tracking into an engaging, game-like experience</p>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/generatemealplan" element={<Meal />} />
      </Routes>
    </Router>
  );
}

export default App;

