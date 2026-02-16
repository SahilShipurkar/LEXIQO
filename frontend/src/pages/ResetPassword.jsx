import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useAuth();

    // Get state from previous page
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
            alert('Password reset successfully! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="premium-bg flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Secure Account</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Set a strong new password</p>

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

                <form onSubmit={handleReset}>
                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <span onClick={() => navigate('/login')} style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</span>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default ResetPassword;
