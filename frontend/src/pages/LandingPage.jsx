import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';
import videoBg from '../assets/video_rs.webm';
import logo from '../assets/dragon-icon.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !user.isNewUser) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="premium-landing">
            {/* Background Video */}
            <div className="video-bg-wrapper">
                <video autoPlay loop muted playsInline>
                    <source src={videoBg} type="video/webm" />
                    Your browser does not support the video tag.
                </video>
                <div className="video-overlay"></div>
            </div>

            {/* Navbar */}
            <nav className="premium-nav">
                <div
                    className="nav-logo"
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 102 }}
                >
                    <img
                        src={logo}
                        alt="LEXIQO Logo"
                        style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                    />
                    <span>LEXIQO</span>
                </div>

                {/* Desktop Nav Links */}
                <div className="nav-links desktop-only">
                    <span className="nav-link active">Home</span>
                    <span className="nav-link" onClick={() => navigate('/about')}>About</span>
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
                        <span className="nav-link" onClick={() => { setIsMenuOpen(false); navigate('/about'); }} style={{ fontSize: '1.5rem' }}>About</span>
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

            {/* Hero Section */}
            <main className="hero-wrapper">
                <div className="badge-wrapper">
                    <span className="badge"> Your Partner in Aptitude Learning Platform</span>
                </div>

                <h1 className="hero-heading">
                    LEXIQO
                </h1>

                <p className="hero-subheading">
                    Practice <span className="emphasize">Real Interview </span> Questions <br />
                    <span className="emphasize"> Learn Faster - </span> <span className="emphasize"> Solve Smarter - </span> <span className="emphasize">Succeed Sooner.</span>
                </p>

                <button
                    className="hero-cta-btn"
                    onClick={() => navigate('/login')}
                >
                    Get Started
                </button>
            </main>
        </div>
    );
};

export default LandingPage;
