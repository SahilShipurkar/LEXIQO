import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import '../index.css';

const Contact = () => {
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
                    <span className="nav-link" onClick={() => navigate('/about')}>About</span>
                    <span className="nav-link active">Contact</span>
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
                        <span className="nav-link active" onClick={() => setIsMenuOpen(false)} style={{ fontSize: '1.5rem' }}>Contact</span>
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

            <div className="container slide-up" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Get in Touch</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>
                        Questions? Feedback? Just want to say hi? We'd love to verify your doubts.
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '3rem' }}>
                    <form onSubmit={(e) => { e.preventDefault(); alert('We have received your message!'); navigate('/'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Name</label>
                            <input type="text" placeholder="Your Name" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} required />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                            <input type="email" placeholder="you@example.com" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} required />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Message</label>
                            <textarea placeholder="How can we help?" rows="5" style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '1rem', width: '100%', fontSize: '1.1rem' }}>Send Message</button>
                    </form>
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

export default Contact;
