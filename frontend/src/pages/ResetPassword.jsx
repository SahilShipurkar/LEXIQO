import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
 const navigate = useNavigate();
 const location = useLocation();
  const { resetPassword, setAppLoading } = useAuth();
 const { email, resetToken } = location.state || {};

 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 useEffect(() => {
  if (!email || !resetToken) {
   navigate('/forgot-password');
  }
 }, [email, resetToken, navigate]);

 const handleReset = async (e) => {
  e.preventDefault();
  setError('');
  if (newPassword !== confirmPassword) {
   setError('Passwords do not match');
   return;
  }
  setLoading(true);
  try {
   await resetPassword(email, newPassword, resetToken);
   navigate('/login');
  } catch (err) {
   setError(err.response?.data?.message || 'Failed to reset password');
  } finally {
   setLoading(false);
  }
 };

 if (!email) return null;

 return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-4 md:p-6 text-text-main font-sans relative transition-colors duration-500">
    {/* Decorative Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

  <div className="glass-card w-full max-w-[400px] animate-slide-up relative z-10 p-6 md:p-8">
   <div className="text-center mb-8">
    <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
    <p className="text-text-sub text-xs font-normal">Enter your new password</p>
   </div>

   {error && (
     <div className="badge badge-error w-full text-center py-3 mb-6 font-semibold">
      {error}
     </div>
   )}

   <form onSubmit={handleReset} className="space-y-6">
    <div className="space-y-4">
     <div className="space-y-2">
      <label className="label-text">New Password</label>
      <input
       type="password"
       placeholder="Minimum 6 characters"
       value={newPassword}
       onChange={(e) => setNewPassword(e.target.value)}
       required
       minLength="6"
       className="form-input"
      />
     </div>
     
     <div className="space-y-2">
      <label className="label-text">Confirm Password</label>
      <input
       type="password"
       placeholder="Re-enter to verify"
       value={confirmPassword}
       onChange={(e) => setConfirmPassword(e.target.value)}
       required
       className="form-input"
      />
     </div>
    </div>

    <div className="space-y-4 pt-2">
     <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
      {loading ? 'Resetting...' : 'Reset Password'}
     </button>

     <div className="text-center border-t border-border-subtle pt-6 mt-4">
       <Link to="/login" className="label-text hover:text-primary transition-colors cursor-pointer normal-case font-semibold">
        Back to Login
       </Link>
     </div>
    </div>
   </form>
  </div>
  </div>
 );
};

export default ResetPassword;
