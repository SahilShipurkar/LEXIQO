import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { sendEmailOtp, verifyOtpCheck } = useAuth(); // Assume verifyOtpCheck in context

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await sendEmailOtp(email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
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
                setError('Invalid OTP code');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-bg flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Recovery</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Reset your password via email OTP</p>

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

                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>Back to Sign In</span>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input-group">
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center' }}>
                                A code has been sent to <br /><span style={{ color: 'white' }}>{email}</span>
                            </p>
                            <label>Enter 6-digit Code</label>
                            <input
                                type="text"
                                placeholder="••••••"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <span onClick={() => setStep(1)} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Change Email</span>
                        </div>
                    </form>
                )}
            </div>
        </div>

    );
};
export default ForgotPassword;

