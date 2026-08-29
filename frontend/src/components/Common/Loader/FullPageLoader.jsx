import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../../assets/dragon-icon.png';
import './FullPageLoader.css';

const FullPageLoader = ({ isVisible, message = "Preparing your workspace..." }) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center loader-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Background Gradient & Glows */}
          <div className="loader-bg-glow-1" />
          <div className="loader-bg-glow-2" />
          
          <div className="relative flex flex-col items-center gap-12">
            {/* Animated Ring / Pulse */}
            <div className="relative">
              <motion.div
                className="absolute inset-[-20px] rounded-full border border-primary/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-[-40px] rounded-full border border-secondary/10"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.05, 0.2, 0.05],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Central Logo with Glow */}
              <motion.div
                className="w-24 h-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              >
                <img
                  src={logo}
                  alt="Lexiqo Logo"
                  className="w-14 h-14 object-contain"
                />
                
                {/* Rotating accent border */}
                <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] rotate-[-90deg]">
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="54"
                    fill="none"
                    stroke="url(#loaderGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="340"
                    initial={{ strokeDashoffset: 340 }}
                    animate={{ strokeDashoffset: [340, 0, -340] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <defs>
                    <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--clr-primary)" />
                      <stop offset="100%" stopColor="var(--clr-secondary)" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>

            {/* Brand & Loading Info */}
            <div className="flex flex-col items-center gap-3">
              <motion.span 
                className="text-3xl font-bold tracking-tighter uppercase text-white tracking-[0.2em]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                LEXIQO
              </motion.span>
              
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullPageLoader;
