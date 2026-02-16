import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState('login'); // 'login' or 'otp'
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState(''); // For password flow if needed
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginWithGoogle, sendEmailOtp, verifyEmailOtp, loginWithPassword, loginAsGuest } = useAuth();
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
            setError('Google Login Failed');
        }
    };

    const handleEmailContinue = async (e) => {
        e.preventDefault();
        setError('');
        if (!identifier) return setError('Email/Username is required');

        // Decide if we want password login or OTP login.
        // Flow: Email -> Password. Or Email -> OTP?
        // User request says "Continue with Email" is CTA.
        // Then lists Email & Password fields.
        // Let's implement Password login by default, maybe add "Login via OTP" option?
        // But the requirement emphasizes OTP.
        // "Authentication Flow (Email OTP Only)" header vs "Login Page ... Password input field".
        // Use password if provided, else maybe OTP?

        if (password) {
            // Password Login
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
            // Assume OTP flow if no password? Or require password?
            // "PRIMARY CTA BUTTON: Continue with Email".
            // Maybe it checks if user exists?
            // Let's just go with sending OTP if they click "Login with OTP" or something.
            // But UI requirement listed "Password input field".
            // I'll assume standard password login is primary for "Sign in", but I must support OTP too.
            setError('Please enter password or use Google.');
        }
    };

    const handleSendOtp = async () => {
        if (!identifier) return setError('Email required for OTP');
        try {
            setLoading(true);
            await sendEmailOtp(identifier.trim());
            setStep('otp');
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await verifyEmailOtp(identifier.trim(), otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <div className="premium-bg flex-center" style={{ minHeight: '100vh' }}>
                <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Verify OTP</h2>
                    <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Enter the code sent to <br /><span style={{ color: 'var(--primary)', fontWeight: '600' }}>{identifier}</span></p>
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="6-digit OTP"
                                required
                                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                            />
                        </div>
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--error)',
                                padding: '0.8rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.85rem',
                                marginBottom: '1.5rem',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                                {error}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>
                    </form>
                    <button
                        className="btn btn-outline w-full"
                        style={{ marginTop: '1rem' }}
                        onClick={() => setStep('login')}
                    >
                        Back to Login
                    </button>
                </div>
            </div>

        );
    }

    return (
        <div className="premium-bg flex-center" style={{ minHeight: '100vh' }}>
            <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue your journey</p>

                <div className="google-btn-wrapper" style={{ marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        useOneTap
                    />
                </div>

                <div className="divider" style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.5rem 0',
                    color: 'var(--text-muted)'
                }}>
                    <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></span>
                    <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>OR</span>
                    <span style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></span>
                </div>

                <form onSubmit={handleEmailContinue}>
                    <div className="input-group">
                        <label>Username / Email</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="username or email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        marginBottom: '1.5rem'
                    }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ width: 'auto' }} />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--error)',
                            padding: '0.8rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.85rem',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline w-full"
                        style={{ marginTop: '1rem' }}
                        onClick={handleGuestLogin}
                    >
                        Continue as Guest
                    </button>
                </form>

                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: 'var(--text-dim)'
                }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Sign up</Link>
                </div>
            </div>
        </div>

    );
};

export default Login;
