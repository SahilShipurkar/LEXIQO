import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import SetupRoute from './components/SetupRoute';
import GlobalLoader from './components/Common/Loader/GlobalLoader';
import Layout from './components/Layout/Layout';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetupUsername from './pages/SetupUsername';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import About from './pages/About';
import Contact from './pages/Contact';
import PracticeTests from './pages/PracticeTests';
import Performance from './pages/Performance';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import ProblemList from './pages/CodingPractice/ProblemList';
import ProblemDetail from './pages/CodingPractice/ProblemDetail';
import ErrorBoundary from './components/ErrorBoundary';

// Moved ProtectedRoute, PublicRoute, SetupRoute to separate files for cleaner App.jsx

const ThemeController = () => {
  const { user } = useAuth();
  const { theme, applyTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Check if the current route is in the authenticated dashboard/app area
    const dashboardPrefixes = ['/dashboard', '/test', '/result', '/performance', '/history', '/leaderboard', '/goals', '/settings', '/practice-tests', '/coding-practice'];
    const isDashboard = dashboardPrefixes.some(path => location.pathname.startsWith(path));

    // Determine the theme: 
    // If authenticated and in the dashboard area, use the saved preference.
    // Otherwise (Public pages, Auth pages, or not logged in), force Dark theme.
    if (user && isDashboard) {
      applyTheme(theme);
    } else {
      applyTheme('dark');
    }
  }, [location.pathname, user, theme, applyTheme]);

  return null;
};

const RoutePersistence = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Save the current route to localStorage whenever it changes
  useEffect(() => {
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/about', '/contact'];
    // Avoid saving assessment tests as they might need specific state that refresh handles differently
    if (user && !publicPaths.includes(location.pathname) && !location.pathname.startsWith('/test')) {
      localStorage.setItem('lastVisitedRoute', location.pathname);
    }
  }, [location.pathname, user]);

  // Auto-restore route if landing on default dashboard
  useEffect(() => {
    if (!loading && user && location.pathname === '/dashboard') {
      const lastRoute = localStorage.getItem('lastVisitedRoute');
      const landingPaths = ['/', '/about', '/contact', '/login', '/register'];

      if (lastRoute && lastRoute !== '/dashboard' && !landingPaths.includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
      }
    }
  }, [loading, user, navigate, location.pathname]);

  return null;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{
          style: {
            background: '#1c2128',
            color: '#c9d1d9',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
          }
        }} />
        <GlobalLoader />
        <ThemeController />
        <RoutePersistence />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/setup-username" element={<SetupRoute><SetupUsername /></SetupRoute>} />

          {/* Protected Routes with Sidebar Layout */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/practice-tests" element={<ProtectedRoute><Layout><PracticeTests /></Layout></ProtectedRoute>} />
          <Route path="/coding-practice" element={<ProtectedRoute><Layout><ProblemList /></Layout></ProtectedRoute>} />
          <Route path="/coding-practice/:slug" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><Layout><Performance /></Layout></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Layout><Goals /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

          {/* Assessment Mode - No Sidebar */}
          <Route path="/test/:testId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />

          <Route path="/result/:testId" element={<ProtectedRoute><Layout><ResultPage /></Layout></ProtectedRoute>} />

          {/* Catch-all for invalid routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
