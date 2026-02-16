// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import LandingPage from './pages/LandingPage';
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import SetupUsername from './pages/SetupUsername';
// import TestPage from './pages/TestPage';
// import ResultPage from './pages/ResultPage';
// import './App.css';

// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="loading-spinner">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   if (user.isNewUser) return <Navigate to="/setup-username" />;
//   return children;
// };

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="loading-spinner">Loading...</div>;
//   if (user && !user.isNewUser) return <Navigate to="/dashboard" />;
//   return children;
// };

// const SetupRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="loading-spinner">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   if (!user.isNewUser) return <Navigate to="/dashboard" />; // Already setup
//   return children;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="app-container">
//           <Routes>
//             <Route path="/" element={<LandingPage />} />
//             <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
//             <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
//             <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
//             <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

//             <Route path="/setup-username" element={<SetupRoute><SetupUsername /></SetupRoute>} />

//             <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//             <Route path="/test/:testId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
//             <Route path="/result/:testId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
//           </Routes>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.isNewUser) return <Navigate to="/setup-username" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user && !user.isNewUser) return <Navigate to="/dashboard" replace />;
  return children;
};

const SetupRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!user.isNewUser) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/setup-username" element={<SetupRoute><SetupUsername /></SetupRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/test/:testId" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />
          <Route path="/result/:testId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
