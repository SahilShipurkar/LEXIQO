import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading, logoutLoading } = useAuth();
  
  // Handled by GlobalLoader at App level
  if (loading || logoutLoading) return null;
  
  if (user && !user.isNewUser) {
    const landingPaths = ['/', '/about', '/contact', '/login', '/register'];
    let lastRoute = localStorage.getItem('lastVisitedRoute') || '/dashboard';
    
    if (landingPaths.includes(lastRoute)) {
      lastRoute = '/dashboard';
    }
    
    return <Navigate to={lastRoute} replace />;
  }
  
  return children;
};

export default PublicRoute;
