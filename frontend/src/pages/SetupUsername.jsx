import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const SetupUsername = () => {
    const [username, setUsernameInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUsername } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await setUsername(username);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set username');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-bg flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-card slide-up" style={{ maxWidth: '400px', width: '90%', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Choose Username</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Set a unique username to continue.</p>
                </div>

                {error && (
                    <div className="glass-card" style={{
                        background: 'rgba(239, 64, 64, 0.1)',
                        border: '1px solid var(--error)',
                        color: 'var(--error)',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Username</label>
                        <input
                            type="text"
                            placeholder="e.g. janesmith"
                            value={username}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            required
                            minLength="3"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Saving Profile...' : 'Save & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupUsername;
