import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, MapPin, Send } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import BackgroundVideo from '../components/BackgroundVideo';

const Contact = () => {
  const navigate = useNavigate();
  const { setAppLoading } = useAuth(); // Keep for potential future actions

  return (
    <div className="relative min-h-screen text-slate-200 overflow-y-auto font-sans selection:bg-indigo-500/30">
      <BackgroundVideo />
      <LandingNavbar />

      <div className="max-w-[700px] mx-auto px-6 pt-32 pb-12 animate-slide-up">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold uppercase tracking-tight leading-tight text-white m-0">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Touch</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-light max-w-xl mx-auto leading-relaxed ">
            Questions? Feedback? Need assistance? Our intelligence support team is on standby.
          </p>
        </div>

        <div className="relative group max-w-2xl mx-auto">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          
          <div className="relative glass-card border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Briefing transmitted successfully.'); navigate('/'); }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Operative Identity</label>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20 shadow-inner" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Communication Vector</label>
                  <input 
                    type="email" 
                    placeholder="uplink@network.com" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20 shadow-inner" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Mission Briefing</label>
                <textarea 
                  placeholder="Outline your inquiry or feedback..." 
                  rows="4" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all placeholder:text-white/20 shadow-inner resize-none" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white py-4 text-[11px] font-bold uppercase tracking-[0.3em] rounded-xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none cursor-pointer"
              >
                Transmit Briefing
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="relative glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[3rem] py-16 px-8 text-center overflow-hidden shadow-2xl">
            {/* Subtle Highlight */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <h3 className="text-[9px] font-bold uppercase tracking-[0.5em] mb-12 leading-none text-slate-500 relative z-10">Station Access Coordinates</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative z-10">
              <div className="flex flex-col items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-500/50 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  <Mail size={20} className="text-slate-400 group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600 block leading-none">Secure Mail</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 group-hover:text-white transition-colors duration-500 ">sahilshipurkar88@gmail.com</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:border-indigo-500/50 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  <MapPin size={20} className="text-slate-400 group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-600 block leading-none">Base Station</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 group-hover:text-white transition-colors duration-500 ">BVCOE Kolhapur, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
