import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, ArrowRight, ShieldCheck, Zap,
  BarChart3, Target, CheckCircle2, Star, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingNavbar from '../components/LandingNavbar';
import BackgroundVideo from '../components/BackgroundVideo';
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, setAppLoading } = useAuth();

  useEffect(() => {
    if (user && !user.isNewUser) {
      let lastRoute = localStorage.getItem('lastVisitedRoute');
      const landingPaths = ['/', '/about', '/contact', '/login', '/register'];
      
      if (!lastRoute || landingPaths.includes(lastRoute)) {
        lastRoute = '/dashboard';
      }
      
      navigate(lastRoute, { replace: true });
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="relative min-h-screen text-slate-200 overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">

      <BackgroundVideo />

      <LandingNavbar />

      <main className="relative z-10 flex flex-col items-center w-full">

        {/* HERO SECTION - Tighter & Fuller */}
        <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center px-6 pt-24 pb-20 lg:pt-32">
          <motion.div
            className="max-w-3xl text-center relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-lg shadow-indigo-500/5 ring-1 ring-white/5"
            >
              <ShieldCheck size={14} className="text-indigo-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">Verified Progressive Reasoning Framework</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-white mb-3 leading-[1.1] px-2"
            >
              Structured Cognitive Training <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                for Real-World Decisions
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed font-light"
            >
              Trusted practice for sharper thinking and measurable progress. Build reasoning accuracy through realistic challenges designed for high-performers.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
            >
              <button
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 border-none"
                onClick={() => navigate('/login')}
              >
                Start Practicing
                <ArrowRight size={14} />
              </button>
              <button
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-all"
                onClick={() => navigate('/about')}
              >
                The Approach
              </button>
            </motion.div>

            {/* Micro Trust Row Integrated into Hero */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-8 py-5 opacity-60 border-t border-white/5 mt-4"
            >
              <div className="flex items-center gap-2 group cursor-default">
                <Users size={14} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">5k+ Learners</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <Target size={14} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">Adaptive Mastery</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <ShieldCheck size={14} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">Verified Growth</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION TRANSITION FADE */}
        <div className="w-full h-32 bg-gradient-to-b from-transparent to-[#030712] -mt-32 pointer-events-none relative z-20" />

        {/* TRUST STRIP - Refined Glass Experience */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: true }}
          className="w-full mb-20 relative z-10 px-6"
        >
          <div className="max-w-6xl mx-auto glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl py-10 px-8 flex flex-wrap justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-all duration-700 hover:border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 group cursor-default">
              <BarChart3 size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase group-hover:text-white transition-colors">Structured Analysis</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Zap size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase group-hover:text-white transition-colors">Dynamic Progression</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Target size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase group-hover:text-white transition-colors">Objective Driven</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <CheckCircle2 size={18} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-xs font-bold tracking-[0.1em] uppercase group-hover:text-white transition-colors">Measurable Results</span>
            </div>
          </div>
        </motion.div>

        {/* FEATURES GRID */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-14"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-500 mb-2">The Standard</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Designed for Clarity and Focus</h3>
            <p className="text-slate-400 max-w-lg mx-auto font-light text-sm">Improve decision-making speed and reasoning accuracy through a platform built for consistent progress.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="text-blue-400" size={20} />,
                title: "Adaptive Flow",
                desc: "Challenges that evolve based on your individual performance benchmarks."
              },
              {
                icon: <BarChart3 className="text-indigo-400" size={20} />,
                title: "Core Analytics",
                desc: "Granular feedback on logic patterns and cognitive reasoning speed."
              },
              {
                icon: <Target className="text-purple-400" size={20} />,
                title: "Real Scenarios",
                desc: "Practical assessments modeled after actual reasoning frameworks."
              },
              {
                icon: <ShieldCheck className="text-cyan-400" size={20} />,
                title: "Expert Design",
                desc: "Built on established psychological principles for cognitive development."
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-500/30 rounded-3xl transition-all text-left"
              >
                <div className="mb-6 w-10 h-10 bg-[#030712] rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                  {f.icon}
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SUBTLE MOCKUP SECTION */}
        <section className="w-full max-w-6xl mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-indigo-500/10 to-transparent border border-white/10 rounded-3xl overflow-hidden p-6 lg:p-10 text-center"
          >
            <div className="max-w-2xl mx-auto mb-10">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">Focus on Consistent Improvement</h3>
              <p className="text-slate-400 font-light text-xs md:text-sm">A distraction-free environment optimized for complex problem-solving and cognitive endurance.</p>
            </div>

            <div className="relative mx-auto max-w-4xl rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black bg-[#03060E]">
              {/* Mockup UI Component */}
              <div className="w-full h-8 bg-[#0A0D17] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
              </div>
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-3 space-y-3">
                  <div className="h-16 bg-white/[0.02] border border-white/5 rounded-lg" />
                  <div className="h-4 w-2/3 bg-white/5 rounded ml-2" />
                  <div className="h-4 w-1/2 bg-white/5 rounded ml-2" />
                </div>
                <div className="col-span-9 space-y-4">
                  <div className="h-40 bg-white/[0.03] border border-white/10 rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/[0.02] border border-white/5 rounded-lg" />
                    <div className="h-20 bg-white/[0.02] border border-white/5 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#03060E] via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA */}
        <section className="w-full max-w-4xl px-6 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-block p-3 bg-indigo-500/10 rounded-xl mb-2">
              <Star size={20} className="text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight px-4">
              Sharpen your reasoning habits today
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-light max-w-md mx-auto mb-8">
              Join a dedicated community of high-performers using LEXIQO to track and improve cognitive accuracy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="bg-white hover:bg-slate-200 text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-white/5 active:scale-95 border-none cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Register Now
              </button>
              <button
                className="bg-transparent hover:bg-white/5 text-slate-300 border border-white/10 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full bg-[#030712] border-t border-white/5 py-12 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center md:flex-row md:justify-between gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex flex-col items-center md:items-start gap-3">
            <span className="text-lg font-bold text-white italic">LEXIQO</span>
            <p className="text-[10px] tracking-widest uppercase text-slate-500">Intelligent Assessment Systems • v.4.0.2</p>
          </div>
          <div className="flex gap-10 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/about')}>The Approach</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/contact')}>Company</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
          </div>
          <div className="text-[9px] uppercase tracking-widest font-medium text-slate-500">
            © 2026 LEXIQO TECHNOLOGY SYSTEMS
          </div>
        </div>

        {/* Subtle decorative bottom glow */}
        <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[200px] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none" />
      </footer>
    </div>
  );
};

export default LandingPage;
