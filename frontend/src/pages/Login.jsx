import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
 const [step, setStep] = useState('login'); // 'login' or 'otp'
 const [identifier, setIdentifier] = useState('');
 const [password, setPassword] = useState('');
 const [otp, setOtp] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
  const { loginWithGoogle, loginWithPassword, loginAsGuest, setAppLoading } = useAuth();
  const navigate = useNavigate();

 const handleGuestLogin = async () => {
  try {
   setLoading(true);
   await loginAsGuest();
   navigate('/dashboard');
  } catch (err) {
   setError(err.message || 'Guest Login Failed');
  } finally {
   setLoading(false);
  }
 };

 const handleGoogleSuccess = async (credentialResponse) => {
  try {
   await loginWithGoogle(credentialResponse.credential);
   navigate('/dashboard');
  } catch (err) {
   setError('Google Authentication Failed');
  }
 };

 const handleEmailContinue = async (e) => {
  e.preventDefault();
  setError('');
  if (!identifier) return setError('Email/Username is required');

  if (password) {
   try {
    setLoading(true);
    await loginWithPassword(identifier.trim(), password);
    navigate('/dashboard');
   } catch (err) {
    setError(err.message || 'Login failed');
   } finally {
    setLoading(false);
   }
  } else {
   setError('Please enter password or use Google.');
  }
 };

 if (step === 'otp') {
  return (
   <div className="premium-bg min-h-screen flex items-center justify-center p-6 text-text-main font-sans transition-colors duration-500">
    <div className="glass-card w-full max-w-[420px] animate-slide-up p-8">
     <h2 className="text-3xl font-semibold text-center mb-2">Verify Identity</h2>
     <p className="text-center text-text-sub text-sm mb-6">
      Enter the code sent to <br />
      <span className="text-primary font-semibold">{identifier}</span>
     </p>
     
     <form onSubmit={() => {}} className="space-y-4">
      <div className="space-y-2">
       <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="000000"
        required
        className="form-input text-3xl font-semibold tracking-[0.5em] text-center"
       />
      </div>
      
      {error && <div className="badge badge-error w-full text-center py-3">{error}</div>}
      
      <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
       {loading ? 'Verifying...' : 'Verify & Continue'}
      </button>
     </form>
     
     <button
      className="btn btn-ghost w-full mt-4 font-medium"
      onClick={() => setStep('login')}
     >
      Go Back
     </button>
    </div>
   </div>
  );
 }

 return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-4 md:p-6 text-text-main font-sans relative transition-colors duration-500">
    {/* Decorative Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

  <div className="glass-card w-full max-w-[400px] animate-slide-up relative z-10 p-6 md:p-8">
   <div className="text-center mb-6">
    <h1 className="text-2xl font-bold mb-2">Sign In</h1>
    <p className="text-text-sub text-xs font-normal">Welcome back to the Lexiqo community</p>
   </div>

   <div className="flex justify-center mb-6">
    <GoogleLogin
     onSuccess={handleGoogleSuccess}
     onError={() => setError('Google Authentication Failed')}
     theme="outline"
     shape="pill"
     size="large"
     width="300px"
    />
   </div>

   <div className="flex items-center gap-4 mb-6">
    <div className="flex-1 h-px bg-border-subtle" />
    <span className="label-text mb-0 opacity-40 font-semibold">Or log in with your email</span>
    <div className="flex-1 h-px bg-border-subtle" />
   </div>

   <form onSubmit={handleEmailContinue} className="space-y-4">
    <div className="space-y-2">
     <label className="label-text">Email or Username</label>
     <input
      type="text"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      placeholder="e.g. alex_smith"
      required
      className="form-input"
     />
    </div>
    
    <div className="space-y-2">
     <div className="flex justify-between items-center">
      <label className="label-text">Password</label>
      <Link to="/forgot-password" size="sm" className="label-text text-primary hover:text-secondary transition-colors lowercase font-semibold">Forgot Password?</Link>
     </div>
     <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="form-input"
     />
    </div>

    <div className="flex items-center gap-3">
     <input 
      type="checkbox" 
      id="remember"
      className="w-4 h-4 rounded border-border-main bg-surface text-primary focus:ring-primary cursor-pointer transition-all" 
     />
     <label htmlFor="remember" className="label-text mb-0 cursor-pointer select-none normal-case font-normal text-text-sub">Remember Me</label>
    </div>

    {error && (
     <div className="badge badge-error w-full text-center py-3">
      {error}
     </div>
    )}

    <div className="space-y-4 pt-2">
     <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
      {loading ? 'Authenticating...' : 'Sign In'}
     </button>

     <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border-subtle" />
      <span className="label-text mb-0 opacity-20 font-semibold">or</span>
      <div className="flex-1 h-px bg-border-subtle" />
     </div>

     <button
      type="button"
      className="btn btn-secondary w-full font-medium"
      onClick={handleGuestLogin}
     >
      Continue as Guest
     </button>
    </div>
   </form>

   <div className="mt-8 text-center border-t border-border-subtle pt-6">
    <p className="label-text normal-case tracking-normal font-normal">
     Don't have an account? <Link to="/register" className="text-primary hover:text-secondary transition-colors font-semibold underline underline-offset-4">Sign Up</Link>
    </p>
   </div>
  </div>
  </div>
 );
};

export default Login;
