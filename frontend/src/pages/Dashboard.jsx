import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/dragon-icon.png';
import '../index.css';
import './TestPage.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth(); // specific user from context
    const [user, setUser] = useState(authUser || { name: 'Guest' });
    const [history, setHistory] = useState([]);
    const [bestScores, setBestScores] = useState({});
    const [activeTab, setActiveTab] = useState('tests'); // tests, history, leaderboard
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardTestId, setLeaderboardTestId] = useState('quant-easy');

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 🔒 HARD GUARD: redirect immediately after logout
    useEffect(() => {
        if (!authUser) {
            navigate('/', { replace: true });
        }
    }, [authUser, navigate]);

    useEffect(() => {
        if (authUser) {
            setUser(authUser);
        }
    }, [authUser]);

    const tests = [
        { id: 'quant-easy', title: 'Quantitative Aptitude', questions: 15, time: '20 mins', category: 'Math', icon: '🔢', color: '#8b5cf6' },
        { id: 'logic-med', title: 'Logical Reasoning', questions: 15, time: '20 mins', category: 'Logic', icon: '🧠', color: '#ec4899' },
        { id: 'verbal-hard', title: 'Verbal Ability', questions: 15, time: '20 mins', category: 'English', icon: '📚', color: '#06b6d4' },
        { id: 'data-hard', title: 'Data Interpretation', questions: 15, time: '20 mins', category: 'Data', icon: '📊', color: '#10b981' },
        { id: 'dsa-all', title: 'Data Structures & Algo', questions: 15, time: '20 mins', category: 'Code', icon: '💻', color: '#f59e0b' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || (authUser && authUser.role === 'guest')) return;

        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/results`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data) {
                    const normalizedHistory = res.data.map(r => ({
                        ...r,
                        scorePercentage: Number(r.scorePercentage),
                        timeTaken: Number(r.timeTaken)
                    }));
                    const sorted = [...normalizedHistory].sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
                    setHistory(sorted);

                    const best = {};
                    normalizedHistory.forEach(r => {
                        if (best[r.sectionName] === undefined || r.scorePercentage > best[r.sectionName]) {
                            best[r.sectionName] = r.scorePercentage;
                        }
                    });
                    setBestScores(best);
                }
            })
            .catch(err => console.error("Failed to fetch history", err));
    }, [authUser]);

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            const token = localStorage.getItem('token');
            if (!token) return;

            axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/results/leaderboard/${leaderboardTestId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setLeaderboardData(res.data))
                .catch(err => console.error("Failed to fetch leaderboard", err));
        }
    }, [activeTab, leaderboardTestId]);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            navigate('/');
        }
    };

    const TabButton = ({ id, icon, label, onClick }) => (
        <button
            onClick={onClick || (() => setActiveTab(id))}
            className={`btn ${activeTab === id ? 'btn-primary' : 'btn-outline'}`}
            style={{
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                border: activeTab === id ? 'none' : '1px solid var(--glass-border)',
                background: activeTab === id ? '' : 'transparent',
                width: isMenuOpen ? '100%' : 'auto',
                marginBottom: isMenuOpen ? '10px' : '0'
            }}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="premium-bg" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Navbar */}
            <nav style={{
                padding: '1rem 5%',
                background: 'rgba(3, 0, 20, 0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', zIndex: 102 }}>
                    <div
                        onClick={() => navigate('/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                        <img src={logo} alt="LEXIQO" style={{ width: '32px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-1px' }}>LEXIQO</span>
                    </div>

                    <div className="desktop-only" style={{ display: 'flex', gap: '0.75rem' }}>
                        <TabButton id="tests" icon="📝" label="Tests" />
                        <TabButton id="history" icon="📜" label="History" />
                        <TabButton id="leaderboard" icon="🏆" label="Leaders" />
                    </div>
                </div>

                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{user.name || 'Student'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role === 'guest' ? 'Guest Access' : 'Verified Learner'}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        Logout
                    </button>
                </div>

                {/* Mobile Hamburger */}
                <div
                    className="mobile-only"
                    style={{ zIndex: 102, cursor: 'pointer', padding: '0.5rem' }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                        {isMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="mobile-menu-overlay mobile-only" style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100vh',
                        background: 'rgba(3, 0, 20, 0.98)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 101,
                        padding: '6rem 2rem 2rem 2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{ marginBottom: '1rem', width: '100%' }}>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>{user.name || 'Student'}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.role === 'guest' ? 'Guest Access' : 'Verified Learner'}</div>
                        </div>

                        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)', marginBottom: '1rem' }}></div>

                        <TabButton id="tests" icon="📝" label="Tests" onClick={() => { setActiveTab('tests'); setIsMenuOpen(false); }} />
                        <TabButton id="history" icon="📜" label="History" onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} />
                        <TabButton id="leaderboard" icon="🏆" label="Leaders" onClick={() => { setActiveTab('leaderboard'); setIsMenuOpen(false); }} />

                        <div style={{ flex: 1 }}></div>

                        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', justifyContent: 'center' }}>
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            <div className="container">
                {activeTab === 'tests' && (
                    <div className="fade-in">
                        <header style={{ marginBottom: '3rem' }}>
                            <h1 style={{ marginBottom: '0.5rem' }}>
                                Master Your <span style={{ color: 'var(--primary)' }}>Aptitude</span>
                            </h1>
                            <p>Choose a category to start your assessment</p>
                        </header>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '2rem',
                        }}>
                            {tests.map((test, index) => (
                                <div
                                    key={test.id}
                                    className="glass-card slide-up"
                                    style={{
                                        padding: '2rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '240px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                    onClick={() => navigate(`/test/${test.id}`)}
                                >
                                    {/* Decorative glow */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-20px',
                                        right: '-20px',
                                        width: '100px',
                                        height: '100px',
                                        background: test.color,
                                        filter: 'blur(60px)',
                                        opacity: 0.2,
                                        zIndex: 0
                                    }}></div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                background: `${test.color}20`,
                                                color: test.color,
                                                border: `1px solid ${test.color}40`
                                            }}>
                                                {test.category}
                                            </span>
                                            <span style={{ fontSize: '1.5rem' }}>{test.icon}</span>
                                        </div>
                                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{test.title}</h3>
                                        <p style={{ fontSize: '0.9rem' }}>
                                            {bestScores[test.id] !== undefined
                                                ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>Best: {bestScores[test.id].toFixed(0)}%</span>
                                                : "Not started"}
                                        </p>
                                    </div>

                                    <div style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        borderTop: '1px solid var(--glass-border)',
                                        paddingTop: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-dim)'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ opacity: 0.6 }}>Questions:</span> {test.questions}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ opacity: 0.6 }}>Time:</span> {test.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="slide-up">
                        <h2 style={{ marginBottom: '2rem' }}>Learning Timeline</h2>
                        {history.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
                                <h3>No attempts yet</h3>
                                <p style={{ marginTop: '0.5rem' }}>Complete a test to see your progress here.</p>
                                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setActiveTab('tests')}>Browse Tests</button>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                                <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                                                <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Category</th>
                                                <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Performance</th>
                                                <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Duration</th>
                                                <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((record, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td style={{ padding: '1.25rem 2.5rem' }}>
                                                        <div style={{ fontWeight: 500 }}>{new Date(record.attemptDate).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(record.attemptDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2rem', textTransform: 'capitalize', fontWeight: 600 }}>
                                                        {record.sectionName.replace('-', ' ')}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                                <div style={{
                                                                    width: `${record.scorePercentage}%`,
                                                                    height: '100%',
                                                                    background: record.scorePercentage >= 70 ? 'var(--success)' : record.scorePercentage >= 40 ? 'var(--warning)' : 'var(--error)'
                                                                }}></div>
                                                            </div>
                                                            <span style={{ fontWeight: 700, color: record.scorePercentage >= 70 ? 'var(--success)' : record.scorePercentage >= 40 ? 'var(--warning)' : 'var(--error)' }}>
                                                                {record.scorePercentage.toFixed(0)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2.5rem', color: 'var(--text-dim)' }}>
                                                        {(record.timeTaken / 60).toFixed(1)}m
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2.5rem', textAlign: 'right' }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                                                            onClick={() => navigate(`/result/${record.sectionName}`, {
                                                                state: { result: record, questions: null, answers: null }
                                                            })}
                                                        >
                                                            Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="slide-up">
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ marginBottom: '0.5rem' }}>Global Standings 🏆</h2>
                                    <p>See how you compare with others</p>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0, width: '240px', maxWidth: '100%' }}>
                                    <select
                                        value={leaderboardTestId}
                                        onChange={(e) => setLeaderboardTestId(e.target.value)}
                                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                                    >
                                        {tests.map(t => <option key={t.id} value={t.id} style={{ background: '#030014' }}>{t.title}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rank</th>
                                            <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Learner</th>
                                            <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Score</th>
                                            <th style={{ padding: '1.5rem 2rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboardData.length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Be the first one to lead this category!</td></tr>
                                        ) : (
                                            leaderboardData.map((entry, idx) => (
                                                <tr key={entry.id} style={{
                                                    borderBottom: '1px solid var(--glass-border)',
                                                    background: idx === 0 ? 'rgba(255, 215, 0, 0.05)' : idx === 1 ? 'rgba(192, 192, 192, 0.05)' : idx === 2 ? 'rgba(205, 127, 50, 0.05)' : 'transparent'
                                                }}>
                                                    <td style={{ padding: '1.25rem 2rem' }}>
                                                        <span style={{
                                                            fontSize: idx < 3 ? '1.5rem' : '1rem',
                                                            fontWeight: 700,
                                                            color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-muted)'
                                                        }}>
                                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                                                {(entry.user?.name || 'U')[0]}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{entry.user?.name || 'Unknown User'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2rem' }}>
                                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>{Number(entry.scorePercentage).toFixed(0)}%</span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-dim)' }}>
                                                        {(entry.timeTaken / 60).toFixed(1)}m
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
