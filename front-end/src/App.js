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
import ForgotPassword from './components/ForgotPassword';
import Meal from './components/Meal';
import LogCalories from './components/LogCalories';
import FocusMode from './components/FocusMode';
import MyMealPlan from './components/MyMealPlan';
import ManagePlan from './components/ManagePlan';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/generate-meal-plan" element={<Meal />} />
        <Route path="/log-calories" element={<LogCalories />} />
        <Route path="/focus-mode" element={<FocusMode />} />
        <Route path="/my-meal-plan" element={<MyMealPlan />} />
        <Route path="/manage-plan" element={<ManagePlan />} />
      </Routes>
    </Router>
  );
}

export default App;

