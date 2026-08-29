import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, logoutLoading } = useAuth();
  
  // Handled by GlobalLoader at App level
  if (loading || logoutLoading) return null;
  
  if (!user) return <Navigate to="/login" replace />;
  if (user.isNewUser) return <Navigate to="/setup-username" replace />;
  
  return children;
};

export default ProtectedRoute;
