import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SetupUsername = () => {
 const [username, setUsernameInput] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
  const { setUsername, setAppLoading } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setAppLoading(true);
  setError('');
  try {
   await setUsername(username);
   navigate('/dashboard');
  } catch (err) {
   setError(err.response?.data?.message || 'Failed to set username');
  } finally {
   setLoading(false);
   setAppLoading(false);
  }
 };

 return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-4 md:p-6 text-text-main font-sans relative transition-colors duration-500">
    {/* Decorative Blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />

  <div className="glass-card w-full max-w-[400px] animate-slide-up relative z-10 p-6 md:p-8">
   <div className="text-center mb-8">
    <h1 className="text-2xl font-bold mb-2">Set Your Username</h1>
    <p className="text-text-sub text-xs font-normal">Choose a unique username for your account</p>
   </div>

   {error && (
     <div className="badge badge-error w-full text-center py-3 mb-6 font-semibold">
      {error}
     </div>
   )}

   <form onSubmit={handleSubmit} className="space-y-6">
    <div className="space-y-2 text-center">
     <label className="label-text">Username</label>
     <input
      type="text"
      placeholder="e.g. alex_smith"
      value={username}
      onChange={(e) => setUsernameInput(e.target.value)}
      required
      minLength="3"
      className="form-input text-center"
     />
     <p className="text-[10px] text-text-muted mt-2 lowercase">Minimum 3 characters required</p>
    </div>

    <div className="pt-2">
     <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
      {loading ? 'Setting Username...' : 'Continue to Dashboard'}
     </button>
    </div>
   </form>
  </div>
  </div>
 );
};

export default SetupUsername;
