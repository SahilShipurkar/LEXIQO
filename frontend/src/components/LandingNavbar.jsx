import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/dragon-icon.png';

const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-10 ${
        scrolled 
          ? 'bg-white/[0.03] backdrop-blur-xl border-b border-white/10 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/20 transition-all duration-500 shadow-lg">
              <img
                src={logo}
                alt="Logo"
                className="w-7 h-7 object-contain transition-transform group-hover:rotate-12"
              />
            </div>
            <span className="text-2xl font-bold tracking-tighter uppercase text-white">LEXIQO</span>
          </div>


          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
            <span 
              className={`hover:text-white transition-colors cursor-pointer ${isActive('/') ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`} 
              onClick={() => navigate('/')}
            >
              Home
            </span>
            <span 
              className={`hover:text-white transition-colors cursor-pointer ${isActive('/about') ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`} 
              onClick={() => navigate('/about')}
            >
              About
            </span>
            <span 
              className={`hover:text-white transition-colors cursor-pointer ${isActive('/contact') ? 'text-white border-b-2 border-indigo-500 pb-1' : ''}`} 
              onClick={() => navigate('/contact')}
            >
              Contact
            </span>
          </div>

          {/* Call to Action Button */}
          <div className="hidden md:block">
            <button
              className="bg-gradient-to-r from-indigo-600 to-pink-500 hover:scale-105 text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95 border-none cursor-pointer"
              onClick={() => navigate('/register')}
            >
              Register Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay with Framer Motion */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#030712]/95 backdrop-blur-3xl z-[101] flex flex-col justify-center items-center gap-10 p-10 md:hidden text-white"
          >
            <span className={`text-2xl font-bold uppercase ${isActive('/') ? 'text-white' : 'text-white/40'}`} onClick={() => { setIsMenuOpen(false); navigate('/'); }}>Home</span>
            <span className={`text-2xl font-bold uppercase ${isActive('/about') ? 'text-white' : 'text-white/40'}`} onClick={() => { setIsMenuOpen(false); navigate('/about'); }}>About</span>
            <span className={`text-2xl font-bold uppercase ${isActive('/contact') ? 'text-white' : 'text-white/40'}`} onClick={() => { setIsMenuOpen(false); navigate('/contact'); }}>Contact</span>
            <button
              className="bg-gradient-to-r from-indigo-600 to-pink-500 w-full py-5 text-lg font-bold uppercase mt-4 rounded-xl shadow-xl shadow-indigo-500/20"
              onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
            >
              Register Now
            </button>
            <button 
              className="absolute top-8 right-8 text-white/60 hover:text-white" 
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
