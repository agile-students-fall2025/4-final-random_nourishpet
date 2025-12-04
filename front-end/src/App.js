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
import UpdateProfile from './components/UpdateProfile';
import UpdateUsername from './components/UpdateUsername';
import UpdatePassword from './components/UpdatePassword';
import ForgotPassword from './components/ForgotPassword';
import Meal from './components/Meal';
import LogCalories from './components/LogCalories';
import FocusMode from './components/FocusMode';
import MyMealPlan from './components/MyMealPlan';
import ManagePlan from './components/ManagePlan';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* Public */}
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route 
            path="/activities" 
            element={
              <ProtectedRoute>
                <Activities />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/connect-socials" 
            element={
              <ProtectedRoute>
                <ConnectSocials />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/biometrics" 
            element={
              <ProtectedRoute>
                <Biometrics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/update-biometrics" 
            element={
              <ProtectedRoute>
                <UpdateBiometrics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/main-screen" 
            element={
              <ProtectedRoute>
                <MainScreen />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfileScreen />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/update-profile" 
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/update-username" 
            element={
              <ProtectedRoute>
                <UpdateUsername />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/update-password" 
            element={
              <ProtectedRoute>
                <UpdatePassword />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/generate-meal-plan" 
            element={
              <ProtectedRoute>
                <Meal />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/log-calories" 
            element={
              <ProtectedRoute>
                <LogCalories />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/focus-mode" 
            element={
              <ProtectedRoute>
                <FocusMode />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-meal-plan" 
            element={
              <ProtectedRoute>
                <MyMealPlan />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/manage-plan" 
            element={
              <ProtectedRoute>
                <ManagePlan />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
