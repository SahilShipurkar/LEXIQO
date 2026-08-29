import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, BarChart3, Puzzle, Trophy, Mail, MapPin } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import BackgroundVideo from '../components/BackgroundVideo';

const About = () => {
  const navigate = useNavigate();
  const { setAppLoading } = useAuth(); // Keep for potential future actions

  return (
    <div className="relative min-h-screen text-slate-200 overflow-y-auto font-sans selection:bg-indigo-500/30">
      <BackgroundVideo />
      <LandingNavbar />

      <div className="max-w-[800px] mx-auto px-6 pt-32 pb-12 animate-slide-up">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-3">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400 leading-none">Established 2026</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-tight m-0">
            The Vision of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">LEXIQO</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Your intelligence companion for mastering aptitude, placement terminals, and high-stakes competitive assessments.
          </p>
        </div>

        <div className="relative glass-card border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-16 overflow-hidden group shadow-2xl shadow-black/50">
          {/* Subtle Inner Highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors duration-1000" />
          <h2 className="text-xl md:text-3xl font-bold uppercase tracking-tight text-white mb-8 leading-none">The LEXIQO Objective</h2>
          <div className="space-y-6 text-base md:text-lg text-slate-300 leading-relaxed font-light ">
            <p>
              LEXIQO is a specialized intelligence matrix designed to empower scholars and professionals in their pursuit of excellence. 
              Whether you're navigating corporate recruitment sectors, government exam grids, or entrance test protocols, LEXIQO optimizes your preparation vector.
            </p>
            <p>
              We prioritize high-fidelity assessment simulations, multi-dimensional performance tracking, and an immersive interface that prepares you for real-world pressure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24 lg:mb-32">
          <FeatureCard icon={Rocket} title="Temporal Speed" text="Simulate high-pressure exam environments with our precision-timed practice sessions." />
          <FeatureCard icon={BarChart3} title="Data Intelligence" text="Unlock granular analytics of your performance to pinpoint your strategic growth nodes." />
          <FeatureCard icon={Puzzle} title="Multi-Tier Logic" text="A vast database of challenges across Quantitative, Logical, and Verbal sectors." />
          <FeatureCard icon={Trophy} title="Global Standings" text="Measure your proficiency against the global network on our synchronized leaderboards." />
        </div>

        <section className="text-center py-12 relative border-t border-white/5">
          <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white mb-10 leading-none">Initialize Your Journey</h2>
          <button 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-indigo-600/20 active:scale-95 border-none cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Start Practicing Now
          </button>
        </section>

        <footer className="mt-16 py-16 text-center bg-white/5 backdrop-blur-md rounded-t-[3rem] border-t border-white/10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 leading-none text-slate-500">Access Information</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
            <div className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all duration-300">
                <Mail size={16} className="text-slate-400 group-hover:text-indigo-400" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">sahilshipurkar88@gmail.com</span>
            </div>
            <div className="flex flex-col items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all duration-300">
                <MapPin size={16} className="text-slate-400 group-hover:text-indigo-400" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">BVCOE Kolhapur, India</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, text }) => (
  <div className="relative glass-card p-10 group hover:translate-y-[-8px] transition-all duration-500 border-white/5 hover:border-white/20 bg-white/[0.03] backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
    {/* Inner Highlight */}
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-500 border border-white/5">
      <Icon size={24} className="text-slate-400 group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-lg font-bold uppercase tracking-wider mb-4 leading-none text-white">{title}</h3>
    <p className="text-slate-400 text-sm font-light leading-relaxed tracking-wide ">{text}</p>
  </div>
);

export default About;
