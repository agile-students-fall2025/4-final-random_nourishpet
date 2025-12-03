import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // While we are checking /auth/me, don't render anything yet
  if (loading) return null;

  // If user is NOT authenticated, redirect to signin
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Otherwise, render the protected content
  return children;
}

export default ProtectedRoute;
