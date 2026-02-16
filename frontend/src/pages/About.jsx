import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import '../index.css';

const About = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="premium-landing" style={{ overflowY: 'auto' }}>
            {/* Navbar */}
            <nav className="premium-nav" style={{ position: 'sticky', top: 0, background: 'rgba(3, 0, 20, 0.7)', backdropFilter: 'blur(20px)' }}>
                <div
                    className="nav-logo"
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 102 }}
                >
                    <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>LEXIQO</span>
                </div>

                {/* Desktop Nav Links */}
                <div className="nav-links desktop-only">
                    <span className="nav-link" onClick={() => navigate('/')}>Home</span>
                    <span className="nav-link active">About</span>
                    <span className="nav-link" onClick={() => navigate('/contact')}>Contact</span>
                </div>

                {/* Desktop Actions */}
                <div className="nav-actions desktop-only">
                    <button
                        className="nav-cta"
                        onClick={() => navigate('/register')}
                    >
                        Register Now
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
                        background: 'rgba(3, 0, 20, 0.95)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 101,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2rem',
                        padding: '2rem'
                    }}>
                        <span className="nav-link" onClick={() => { setIsMenuOpen(false); navigate('/'); }} style={{ fontSize: '1.5rem' }}>Home</span>
                        <span className="nav-link active" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.5rem' }}>About</span>
                        <span className="nav-link" onClick={() => { setIsMenuOpen(false); navigate('/contact'); }} style={{ fontSize: '1.5rem' }}>Contact</span>
                        <button
                            className="nav-cta"
                            onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
                            style={{ marginTop: '1rem', width: '200px', textAlign: 'center' }}
                        >
                            Register Now
                        </button>
                    </div>
                )}
            </nav>

            <div className="container slide-up" style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 30%, var(--primary) 70%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>About LEXIQO</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
                        Your ultimate companion for mastering aptitude, placements, and competitive exams.
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>What is LEXIQO?</h2>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                        LEXIQO is a modern, AI-powered aptitude preparation platform designed to help students and job seekers excel in their assessments.
                        Whether you are preparing for campus placements, government exams, or corporate entrance tests, LEXIQO provides a structured and efficient way to practice.
                    </p>
                    <p style={{ lineHeight: '1.8', color: 'var(--text-dim)' }}>
                        We focus on providing real-world questions, detailed performance analytics, and a seamless user experience that mimics actual exam environments.
                    </p>
                </div>

                <div className="grid-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
                        <h3 style={{ marginBottom: '1rem' }}>Timed Tests</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Simulate real exam pressure with our timed practice sessions designed to improve your speed and accuracy.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                        <h3 style={{ marginBottom: '1rem' }}>Smart Analytics</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Get detailed insights into your performance, identifying strengths and areas for improvement instantly.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧩</div>
                        <h3 style={{ marginBottom: '1rem' }}>Varied Difficulty</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Questions range from easy to hard, covering Quantitative, Logical, Verbal, and Data Interpretation sections.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏆</div>
                        <h3 style={{ marginBottom: '1rem' }}>Leaderboards</h3>
                        <p style={{ color: 'var(--text-dim)' }}>Compete with peers and see where you stand on global leaderboards to stay motivated.</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Ready to start your journey?</h2>
                    <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => navigate('/register')}>
                        Get Started for Free
                    </button>
                </div>

                <div style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'white' }}>Contact Info</h3>
                    <p style={{ marginBottom: '0.5rem' }}>📧 sahilshipurkar88@gmail.com</p>
                    <p>📍BVCOE Kolhapur, India</p>
                </div>
            </div>
        </div>
    );
};

export default About;
