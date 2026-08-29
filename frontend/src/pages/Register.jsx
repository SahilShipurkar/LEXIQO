import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';

const Register = () => {
 const navigate = useNavigate();
 const { register, checkUsername, checkEmail, sendEmailOtp, checkOtp, setAppLoading } = useAuth();

 const [formData, setFormData] = useState({
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  otp: ''
 });

 const [errors, setErrors] = useState({});
 const [loading, setLoading] = useState(false);
 const [otpLoading, setOtpLoading] = useState(false);
 const [otpSent, setOtpSent] = useState(false);
 const [otpVerified, setOtpVerified] = useState(false);
 const [usernameStatus, setUsernameStatus] = useState(null);
 const [emailStatus, setEmailStatus] = useState(null);

 useEffect(() => {
  const check = async () => {
   if (!formData.username || formData.username.length < 3) {
    setUsernameStatus(null);
    return;
   }
   setUsernameStatus('checking');
   const isAvailable = await checkUsername(formData.username);
   if (isAvailable) {
    setUsernameStatus('available');
    setErrors(prev => ({ ...prev, username: null }));
   } else {
    setUsernameStatus('taken');
    setErrors(prev => ({ ...prev, username: 'Username taken' }));
   }
  };
  const timeout = setTimeout(check, 500);
  return () => clearTimeout(timeout);
 }, [formData.username, checkUsername]);

 useEffect(() => {
  const check = async () => {
   if (!formData.email || !formData.email.includes('@')) {
    setEmailStatus(null);
    return;
   }
   setEmailStatus('checking');
   const isAvailable = await checkEmail(formData.email);
   if (isAvailable) {
    setEmailStatus('available');
    setErrors(prev => ({ ...prev, email: null }));
   } else {
    setEmailStatus('taken');
    setErrors(prev => ({ ...prev, email: 'Email already registered' }));
   }
  };
  const timeout = setTimeout(check, 500);
  return () => clearTimeout(timeout);
 }, [formData.email, checkEmail]);

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSendOtp = async () => {
  if (!formData.email) {
   setErrors(prev => ({ ...prev, email: 'Email required' }));
   return;
  }
  if (emailStatus === 'taken') return;
  setOtpLoading(true);
  try {
   await sendEmailOtp(formData.email);
   setOtpSent(true);
   setErrors(prev => ({ ...prev, email: null }));
  } catch (err) {
   setErrors(prev => ({ ...prev, email: err.response?.data?.message || 'Failed to send code' }));
  } finally {
   setOtpLoading(false);
  }
 };

 const verifyOtp = async () => {
  if (!formData.otp || formData.otp.length < 6) return;
  setOtpLoading(true);
  try {
   const { valid } = await checkOtp(formData.email, formData.otp);
   if (valid) {
    setOtpVerified(true);
    setErrors(prev => ({ ...prev, otp: null }));
   } else {
    setErrors(prev => ({ ...prev, otp: 'Invalid code' }));
   }
  } catch (error) {
   setErrors(prev => ({ ...prev, otp: 'Verification failed' }));
  } finally {
   setOtpLoading(false);
  }
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  if (formData.password !== formData.confirmPassword) {
   setErrors({ confirmPassword: "Passwords do not match" });
   return;
  }
  setLoading(true);
  try {
   await register({
    username: formData.username.trim(),
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password,
    otp: formData.otp.trim()
   });
   navigate('/login');
  } catch (err) {
   setErrors({ form: err.response?.data?.message || 'Registration failed' });
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-6 text-text-main font-sans relative overflow-hidden transition-colors duration-500">
    {/* Decorative Blobs */}
    <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
    <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] bg-secondary/10 rounded-full blur-[140px] animate-pulse [animation-delay:3s]" />

    <div className="glass-card w-full max-w-[480px] animate-slide-up relative z-10 p-8 md:p-10">
     <div className="text-center mb-8">
      <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
      <p className="text-text-sub text-xs font-normal">Join the Lexiqo community</p>
     </div>

     <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       <div className="space-y-2">
        <label className="label-text">Full Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name" className="form-input" />
       </div>

       <div className="space-y-2">
        <label className="label-text">
         Username {usernameStatus === 'available' && <span className="text-success lowercase font-semibold ml-1">✓ available</span>}
        </label>
        <input
         name="username"
         value={formData.username}
         onChange={handleChange}
         required
         placeholder="Username"
         className={`form-input ${usernameStatus === 'taken' ? 'border-error/50' : (usernameStatus === 'available' ? 'border-success/50' : '')}`}
        />
        {errors.username && <span className="badge badge-error py-1 text-[10px] w-full text-center font-semibold">{errors.username}</span>}
       </div>
      </div>

      <div className="space-y-2">
       <label className="label-text">
        Email Address {emailStatus === 'available' && <span className="text-success lowercase font-semibold ml-1">✓ unique</span>}
       </label>
       <div className="flex gap-3">
        <input
         name="email"
         type="email"
         value={formData.email}
         onChange={handleChange}
         required
         placeholder="email@example.com"
         disabled={otpSent}
         className={`form-input flex-1 ${emailStatus === 'taken' ? 'border-error/50' : (emailStatus === 'available' ? 'border-success/50' : '')} ${otpSent ? 'opacity-50' : ''}`}
        />
        {!otpSent && (
         <button
          type="button"
          onClick={handleSendOtp}
          className="btn btn-secondary py-3 px-6 h-fit whitespace-nowrap font-medium"
          disabled={otpLoading || emailStatus === 'taken' || !formData.email}
         >
          {otpLoading ? '...' : 'Send Code'}
         </button>
        )}
       </div>
       {errors.email && <span className="badge badge-error py-1 text-[10px] w-full text-center font-semibold">{errors.email}</span>}
      </div>

      {otpSent && (
       <div className="space-y-4 p-6 bg-surface border border-border-subtle rounded-2xl animate-fade-in transition-all duration-500">
        <div className="flex justify-between items-center">
         <label className="label-text text-primary mb-0">Verify Identity</label>
         <button type="button" onClick={() => {setOtpSent(false); setOtpVerified(false);}} className="label-text hover:text-text-main transition-colors mb-0 lowercase font-semibold">Change Email</button>
        </div>
        <div className="flex gap-3">
         <input
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          required
          placeholder="000 000"
          className="form-input text-xl tracking-[0.4em] font-semibold text-center"
         />
         {!otpVerified && (
          <button
           type="button"
           onClick={verifyOtp}
           className="btn btn-primary py-3 px-6 h-fit border-none"
           disabled={otpLoading || !formData.otp || formData.otp.length < 6}
          >
           {otpLoading ? '...' : 'Verify'}
          </button>
         )}
        </div>
        {otpVerified && <div className="badge badge-success w-full py-2 font-semibold">Account Verified</div>}
       </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       <div className="space-y-2">
        <label className="label-text">Create Password</label>
        <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="form-input" />
       </div>

       <div className="space-y-2">
        <label className="label-text">Confirm Password</label>
        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" className="form-input" />
       </div>
      </div>

      {errors.confirmPassword && <div className="badge badge-error w-full py-2 font-semibold">{errors.confirmPassword}</div>}
      {errors.form && <div className="badge badge-error w-full py-2 font-semibold">{errors.form}</div>}

      <div className="pt-6">
       {otpVerified ? (
        <button type="submit" className="btn btn-primary w-full border-none" disabled={loading}>
         {loading ? 'Creating Account...' : 'Create Account'}
        </button>
       ) : (
        <div className="btn bg-surface border-border-subtle text-text-muted cursor-not-allowed w-full opacity-50 font-medium">
         Verify Email to Proceed
        </div>
       )}
      </div>
     </form>

     <div className="mt-12 text-center border-t border-border-subtle pt-8">
      <p className="label-text normal-case tracking-normal font-normal">
       Already have an account? <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold underline underline-offset-4">Log in</Link>
      </p>
     </div>
    </div>
  </div>
 );
};

export default Register;
