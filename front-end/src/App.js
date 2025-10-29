import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Activities from './components/Activities';
import ConnectSocials from './components/ConnectSocials';
import Biometrics from './components/Biometrics';
import UpdateBiometrics from './components/UpdateBiometrics';
import MainScreen from './components/MainScreen';
import ProfileScreen from './components/ProfileScreen';
import UpdateUsername from './components/UpdateUsername';
import UpdatePassword from './components/UpdatePassword';
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
        <Route path="/activities" element={<Activities />} />
        <Route path="/connect-socials" element={<ConnectSocials />} />
        <Route path="/biometrics" element={<Biometrics />} />
        <Route path="/update-biometrics" element={<UpdateBiometrics />} />
        <Route path="/main" element={<MainScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/update-username" element={<UpdateUsername />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/generatemealplan" element={<Meal />} />
      </Routes>
    </Router>
  );
}

export default App;

