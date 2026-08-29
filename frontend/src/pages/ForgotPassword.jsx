import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
 const [email, setEmail] = useState('');
 const [otp, setOtp] = useState('');
 const [step, setStep] = useState(1); // 1: Email, 2: OTP
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
  const navigate = useNavigate();
  const { sendEmailOtp, verifyOtpCheck, setAppLoading } = useAuth();

 const handleSendOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
   await sendEmailOtp(email.trim());
   setStep(2);
  } catch (err) {
   setError(err.response?.data?.message || 'Failed to send reset link');
  } finally {
   setLoading(false);
  }
 };

 const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
   const { valid, resetToken } = await verifyOtpCheck(email.trim(), otp.trim());
   if (valid) {
    navigate('/reset-password', { state: { email, resetToken } });
   } else {
    setError('Invalid 6-digit code');
   }
  } catch (err) {
   setError('Verification failed. Please try again.');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-4 md:p-6 text-text-main font-sans relative transition-colors duration-500">
    {/* Decorative Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

  <div className="glass-card w-full max-w-[400px] animate-slide-up relative z-10 p-6 md:p-8">
   <div className="text-center mb-8">
    <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
    <p className="text-text-sub text-xs font-normal">Enter your email to reset your password</p>
   </div>

   {error && (
     <div className="badge badge-error w-full text-center py-3 mb-6 font-semibold">
      {error}
     </div>
   )}

   {step === 1 && (
    <form onSubmit={handleSendOtp} className="space-y-6">
     <div className="space-y-2">
      <label className="label-text">Email Address</label>
      <input
       type="email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="you@example.com"
       required
       className="form-input text-center"
      />
     </div>
     
     <div className="space-y-4 pt-2">
      <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
       {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <div className="text-center border-t border-border-subtle pt-6 mt-4">
       <Link to="/login" className="label-text hover:text-primary transition-colors cursor-pointer normal-case font-semibold">
        Back to Login
       </Link>
      </div>
     </div>
    </form>
   )}

   {step === 2 && (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
     <div className="space-y-6">
      <div className="p-4 bg-surface border border-border-subtle rounded-2xl text-center">
       <span className="label-text mb-1 opacity-40 lowercase">Reset code sent to</span>
       <span className="text-sm font-semibold text-primary block">{email}</span>
      </div>
      
      <div className="space-y-2 text-center">
       <label className="label-text">Enter 6-digit code</label>
       <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="000000"
        required
        maxLength={6}
        className="form-input text-2xl font-semibold tracking-[0.4em] text-center"
       />
      </div>
     </div>
     
     <div className="space-y-3 pt-2">
      <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
       {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>
      <button 
       type="button" 
       onClick={() => setStep(1)} 
       className="btn btn-ghost w-full lowercase font-medium text-[10px] tracking-wider opacity-60 hover:opacity-100"
      >
       Change Email
      </button>
     </div>
    </form>
   )}
  </div>
  </div>
 );
};

export default ForgotPassword;
