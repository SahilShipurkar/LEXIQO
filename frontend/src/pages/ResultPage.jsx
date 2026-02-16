import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController, CategoryScale, LinearScale } from 'chart.js';
import axios from 'axios';
import '../index.css';
import './TestPage.css';

ChartJS.register(ArcElement, Tooltip, Legend, PieController, CategoryScale, LinearScale);

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, questions, answers, confirmed, user: locationUser } = location.state || {};
    const [user, setUser] = useState(locationUser || { name: 'User' });
    const [rank, setRank] = useState('-');
    const [filter, setFilter] = useState('all'); // all, correct, wrong, skipped
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!result) return;
        const token = localStorage.getItem('token');

        const fetchUser = async () => {
            if (token) {
                try {
                    const userRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
                    if (userRes.data) setUser({ name: userRes.data.name || userRes.data.username || 'User' });
                } catch (e) { console.error("Profile fetch error", e); }
            }
        };

        if (!locationUser && token) fetchUser();

        const fetchRank = async () => {
            try {
                if (!token) return;
                const leaderboardRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/results/leaderboard/${result.sectionName}`, { headers: { Authorization: `Bearer ${token}` } });
                if (leaderboardRes.data) {
                    const myRank = leaderboardRes.data.findIndex(r => r.scorePercentage === result.scorePercentage && r.timeTaken === result.timeTaken) + 1;
                    setRank(myRank > 0 ? `#${myRank}` : '-');
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            }
        };
        fetchRank();
    }, [result]);

    if (!result || !result.sectionName) {
        return (
            <div className="premium-bg flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="glass-card slide-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px var(--primary-glow))' }}>🔍</div>
                    <h2 style={{ marginBottom: '1rem' }}>No Result Found</h2>
                    <p style={{ marginBottom: '2.5rem', color: 'var(--text-dim)' }}>We couldn't find any session data for this attempt. This typically happens if you refresh the page or navigate away.</p>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const data = {
        labels: ['Correct', 'Wrong', 'Skipped'],
        datasets: [
            {
                data: [result?.correct || 0, result?.wrong || 0, result?.skipped || 0],
                backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
                borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'],
                borderWidth: 2,
            },
        ],
    };

    const getStatus = (idx) => {
        if (!questions || !questions[idx]) return 'skipped';
        const userAns = (answers || result?.userAnswers || {})[idx];
        const isSkipped = !userAns;
        if (isSkipped) return 'skipped';
        if (userAns === questions[idx].correctAnswer) return 'correct';
        return 'wrong';
    };

    const filteredQuestions = questions ? questions.map((q, i) => ({ ...q, index: i, status: getStatus(i) })).filter(q => {
        if (filter === 'all') return true;
        return q.status === filter;
    }) : [];

    const accuracy = ((result?.correct / (result?.correct + result?.wrong || 1)) * 100 || 0).toFixed(0);

    return (
        <div className="premium-bg" style={{ minHeight: '100vh', padding: '4rem 5%' }}>
            <div className="container slide-up" style={{ maxWidth: '1100px' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Assessment Complete</span>
                        <h1 style={{ marginTop: '0.5rem' }}>Performance Review</h1>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
                </div>

                {/* Summary Card */}
                <div className="glass-card" style={{ padding: isMobile ? '1.5rem' : '3rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '4rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: 'var(--primary-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    fontWeight: 800,
                                    border: '1px solid var(--primary)'
                                }}>
                                    {accuracy > 70 ? '📈' : '🎯'}
                                </div>
                                <div>
                                    <h3 style={{ textTransform: 'uppercase', fontSize: '1rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>{(result?.sectionName || 'TEST').replace('-', ' ')}</h3>
                                    <h2 style={{ fontSize: '1.8rem' }}>Hey, {(user?.name || 'Explorer').split(' ')[0]}!</h2>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Points Scored</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{result?.correct || 0}<span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/{result?.totalQuestions || 0}</span></div>
                                </div>
                                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Accuracy Rate</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: accuracy > 70 ? 'var(--success)' : accuracy > 40 ? 'var(--warning)' : 'var(--error)' }}>{accuracy}%</div>
                                </div>
                                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Completion Time</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{(result?.timeTaken / 60 || 0).toFixed(1)}<span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>m</span></div>
                                </div>
                                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Global Rank</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>{rank}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-center" style={{ flexDirection: 'column' }}>
                            <div style={{ width: '100%', maxWidth: '280px', position: 'relative' }}>
                                <Pie data={data} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 800 }}>{(result?.scorePercentage || 0).toFixed(0)}%</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall</div>
                                </div>
                            </div>
                            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></div> Correct</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }}></div> Wrong</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#94a3b8' }}></div> Skipped</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Header Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Review Session</h2>
                    <div className="glass-card" style={{ padding: '0.4rem', borderRadius: 'var(--radius-full)', display: 'flex', gap: '0.25rem' }}>
                        {['all', 'correct', 'wrong', 'skipped'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`btn ${filter === f ? 'btn-primary' : ''}`}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.8rem',
                                    background: filter === f ? '' : 'transparent',
                                    border: 'none',
                                    color: filter === f ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredQuestions.map((q, idx) => {
                        const statusColors = {
                            correct: { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--success)', border: 'var(--success)', icon: '✔' },
                            wrong: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--error)', border: 'var(--error)', icon: '✖' },
                            skipped: { bg: 'rgba(255, 255, 255, 0.05)', text: 'var(--text-muted)', border: 'var(--glass-border)', icon: '⚪' }
                        };
                        const s = statusColors[q.status];

                        return (
                            <div key={q.index} className="glass-card slide-up" style={{ padding: '2rem', animationDelay: `${idx * 0.05}s` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Q{q.index + 1}</span>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            padding: '0.25rem 0.6rem',
                                            background: 'var(--surface)',
                                            borderRadius: '4px',
                                            border: '1px solid var(--glass-border)'
                                        }}>{q.difficulty || 'MEDIUM'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: s.text, fontWeight: 700, fontSize: '0.9rem' }}>
                                        <span>{s.icon} {q.status.toUpperCase()}</span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '1.2rem', lineHeight: 1.5, marginBottom: '2rem' }}>{q.question}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ padding: '1rem 1.5rem', background: s.bg, borderRadius: 'var(--radius-md)', border: `1px solid ${s.border}40` }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Response</div>
                                        <div style={{ fontWeight: 600 }}>{(answers || result.userAnswers || {})[q.index] || 'Skipped'}</div>
                                    </div>
                                    <div style={{ padding: '1rem 1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Official Key</div>
                                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>{q.correctAnswer}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
