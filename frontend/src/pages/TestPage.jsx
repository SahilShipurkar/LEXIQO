import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import './TestPage.css';

const TestPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [confirmed, setConfirmed] = useState({}); // New state for locked answers
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes default
    const [loading, setLoading] = useState(true);
    const [startModalVisible, setStartModalVisible] = useState(true);
    const [submitModalVisible, setSubmitModalVisible] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Map testId to backend section keys
    const sectionMap = {
        'quant-easy': 'quant',
        'logic-med': 'logical',
        'verbal-hard': 'verbal',
        'data-hard': 'di',
        'dsa-all': 'dsa'
    };

    useEffect(() => {
        // Prevent back button
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
            window.history.go(1);
        };

        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/questions/generate`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const sectionKey = sectionMap[testId] || 'quant';
                const sectionQuestions = res.data[sectionKey];

                if (sectionQuestions && sectionQuestions.length > 0) {
                    setQuestions(sectionQuestions);
                } else {
                    alert('No questions available for this section.');
                    navigate('/dashboard');
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to load questions.');
                navigate('/dashboard');
            }
        };

        if (hasStarted) {
            fetchQuestions();
        } else {
            setLoading(false); // Stop loading if waiting for modal
        }
    }, [hasStarted, testId, navigate]);

    const submitTest = useCallback(async (isAuto = false) => {
        try {
            const token = localStorage.getItem('token');
            const resultData = calculateResult(); // Uses updated logic

            // Sending detailed answers map is crucial for backend storage/validation if implemented
            const payload = {
                sectionName: testId,
                totalQuestions: questions.length,
                correct: resultData.correct,
                wrong: resultData.wrong,
                skipped: resultData.skipped,
                scorePercentage: resultData.percentage,
                timeTaken: 1200 - timeLeft,
                userAnswers: answers // Send detailed answers
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/results`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isAuto) {
                alert('Time is up. Your test has been auto-submitted.');
            }

            // Navigate to results with state
            navigate(`/result/${testId}`, { state: { result: payload, questions, answers, confirmed } });
        } catch (err) {
            console.error(err);
            alert('Error submitting result. Check console.');

            const resultData = calculateResult();
            const fallbackPayload = {
                sectionName: testId,
                totalQuestions: questions.length,
                correct: resultData.correct,
                wrong: resultData.wrong,
                skipped: resultData.skipped,
                scorePercentage: resultData.percentage,
                timeTaken: 1200 - timeLeft,
                userAnswers: answers
            };

            // Still navigate to show local result
            navigate(`/result/${testId}`, { state: { result: fallbackPayload, questions, answers, confirmed } });
        }
    }, [answers, confirmed, questions, timeLeft, testId, navigate]);

    useEffect(() => {
        if (!hasStarted) return;
        if (timeLeft === 0) {
            submitTest(true);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, hasStarted, submitTest]);

    const handleOptionSelect = (option) => {
        if (confirmed[currentQuestion]) return; // Prevent changing if confirmed
        setAnswers({ ...answers, [currentQuestion]: option });
    };

    const handleConfirm = () => {
        setConfirmed(prev => ({ ...prev, [currentQuestion]: true }));
        // Micro confirmation due is handled via UI text "locked"

        // Auto-navigate to next if not last
        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion(curr => curr + 1), 600);
        }
    };

    const calculateResult = () => {
        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        questions.forEach((q, index) => {
            // Updated Logic:
            // 1. Confirmed (Orange) -> Count as final
            // 2. Selected (Green) -> Auto-promoted to final
            // 3. Unattempted -> Skipped
            const selected = answers[index];
            if (!selected) {
                skipped++;
            } else if (selected === q.correctAnswer) {
                correct++;
            } else {
                wrong++;
            }
        });

        return {
            correct,
            wrong,
            skipped,
            total: questions.length,
            percentage: (correct / questions.length) * 100
        };
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    if (loading) return <div className="premium-bg flex-center" style={{ minHeight: '100vh', color: 'white' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>Loading assessment...</div>
    </div>;

    if (startModalVisible) {
        return (
            <div className="premium-bg flex-center" style={{ minHeight: '100vh' }}>
                <div className="glass-card slide-up" style={{ maxWidth: '600px', width: '90%', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🚀</span>
                        <h2>Ready to Start?</h2>
                        <p style={{ color: 'var(--text-dim)' }}>Section: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{testId.toUpperCase()}</span></p>
                    </div>

                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderLeft: '4px solid var(--warning)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '2rem',
                        display: 'flex',
                        gap: '1rem'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                        <div style={{ fontSize: '0.9rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Strict Environment:</strong>
                            You cannot exit or refresh once started. The timer begins immediately.
                        </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
                            <span style={{ color: 'var(--primary)' }}>⏱</span> 20 Minutes Time Limit
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
                            <span style={{ color: 'var(--primary)' }}>🎯</span> 15 Questions to Answer
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
                            <span style={{ color: 'var(--primary)' }}>🔒</span> Answers can be locked (Confirm)
                        </li>
                    </ul>

                    <div className="flex-center" style={{ gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
                            Go Back
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                            setStartModalVisible(false);
                            setHasStarted(true);
                            setLoading(true);
                        }}>
                            Begin Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (submitModalVisible) {
        const selectedButUnconfirmed = Object.keys(answers).length - Object.keys(confirmed).length;

        return (
            <div className="premium-bg flex-center" style={{ minHeight: '100vh' }}>
                <div className="glass-card slide-up" style={{ maxWidth: '480px', width: '90%', padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏁</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Final Submission</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Review your progress before finishing.</p>

                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.5rem',
                        marginBottom: '2.5rem',
                        textAlign: 'left',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span>Locked Answers:</span>
                            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{Object.keys(confirmed).length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span>Flexible Selection:</span>
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>{selectedButUnconfirmed > 0 ? selectedButUnconfirmed : 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Unattempted:</span>
                            <span style={{ color: 'var(--error)', fontWeight: 700 }}>{questions.length - Object.keys(answers).length}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSubmitModalVisible(false)}>
                            Keep Testing
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1, background: 'var(--error)' }} onClick={() => submitTest(false)}>
                            Submit Now
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!questions.length) return null;

    const q = questions[currentQuestion];
    const opts = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
    const isLocked = confirmed[currentQuestion];

    return (
        <div className="premium-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
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
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.2rem'
                    }}>L</div>
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Assessment Mode</div>
                        <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{testId.replace('-', ' ')}</div>
                    </div>
                </div>

                <div className={`timer-badge ${timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : ''}`} style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: timeLeft < 60 ? 'var(--error)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: timeLeft < 60 ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none'
                }}>
                    <span style={{ fontSize: '1rem' }}>⏱</span> {formatTime(timeLeft)}
                </div>
            </nav>

            <div className="test-body" style={{ padding: isMobile ? '1rem' : '2rem 5%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '2rem', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                {/* Question Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="glass-card fade-in" style={{ padding: '3rem', marginBottom: '2rem', position: 'relative' }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>QUESTION {currentQuestion + 1} OF {questions.length}</span>
                            <span style={{
                                padding: '0.3rem 0.8rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.7rem',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                border: '1px solid var(--glass-border)'
                            }}>{(q.difficulty || 'MEDIUM').toUpperCase()}</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', lineHeight: 1.4, fontWeight: 500 }}>{q.question}</h2>
                    </div>

                    <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.25rem' }}>
                        {opts.map((opt, idx) => {
                            const isSelected = answers[currentQuestion] === opt;
                            return (
                                <div
                                    key={idx}
                                    className={`option-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''} slide-up`}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius-lg)',
                                        background: isSelected ? 'var(--primary-glow)' : 'var(--surface)',
                                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                        transition: 'var(--transition-base)',
                                        cursor: isLocked ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        animationDelay: `${idx * 0.1}s`
                                    }}
                                    onClick={() => handleOptionSelect(opt)}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        color: isSelected ? 'white' : 'var(--text-dim)',
                                        flexShrink: 0,
                                        border: isSelected ? 'none' : '1px solid var(--glass-border)'
                                    }}>{String.fromCharCode(65 + idx)}</div>
                                    <span style={{ fontSize: '1.1rem', color: isSelected ? 'white' : 'var(--text-dim)' }}>{opt}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            className="btn btn-outline"
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(curr => curr - 1)}
                            style={{ padding: '0.8rem 1.5rem' }}
                        >
                            ← Previous
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <button
                                className={`btn ${isLocked ? 'btn-outline' : 'btn-primary'}`}
                                disabled={isLocked || !answers[currentQuestion]}
                                onClick={handleConfirm}
                                style={{
                                    minWidth: '200px',
                                    background: isLocked ? 'rgba(16, 185, 129, 0.1)' : '',
                                    borderColor: isLocked ? 'var(--success)' : '',
                                    color: isLocked ? 'var(--success)' : ''
                                }}
                            >
                                {isLocked ? '✔ Answer Locked' : 'Confirm & Lock'}
                            </button>
                            {!isLocked && answers[currentQuestion] && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Confirm to finish this question</div>
                            )}
                        </div>

                        {currentQuestion < questions.length - 1 ? (
                            <button className="btn btn-primary" onClick={() => setCurrentQuestion(curr => curr + 1)} style={{ padding: '0.8rem 1.5rem' }}>
                                Next Question →
                            </button>
                        ) : (
                            <button className="btn btn-primary" style={{ background: 'var(--secondary)', border: 'none' }} onClick={() => setSubmitModalVisible(true)}>
                                Submit Assessment
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel/Navigator */}
                <div style={{ width: isMobile ? '100%' : '320px', display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Assessment Flow</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                            {questions.map((ques, idx) => {
                                const isConfirmed = confirmed[idx];
                                const isSelected = answers[idx];
                                const isCurrent = currentQuestion === idx;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            transition: 'var(--transition-base)',
                                            background: isCurrent ? 'var(--primary)' : isConfirmed ? 'var(--warning)' : isSelected ? 'var(--success)' : 'var(--surface)',
                                            color: isCurrent || isConfirmed || isSelected ? 'white' : 'var(--text-muted)',
                                            border: isCurrent ? 'none' : '1px solid var(--glass-border)'
                                        }}
                                    >
                                        {idx + 1}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status Legend</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }}></div> Current
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--warning)' }}></div> Locked
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)' }}></div> Selected
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--surface)', border: '1px solid var(--glass-border)' }}></div> Unvisited
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
