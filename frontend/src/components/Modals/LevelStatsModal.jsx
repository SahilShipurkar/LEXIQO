import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trophy, 
  Zap, 
  ChevronRight, 
  ArrowUpRight, 
  History,
  Star
} from 'lucide-react';
import api from '../../api/axios';

const LevelStatsModal = ({ isOpen, onClose, user }) => {
  const [xpHistory, setXpHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchXpHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/xp-history');
      setXpHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch XP history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchXpHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLevel = user?.level || 1;
  const currentXP = user?.totalXP || 0;
  const xpInCurrentLevel = currentXP % 500;
  const xpNeededForNext = 500 - xpInCurrentLevel;
  const progressPercent = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] bg-bg-card border border-border-subtle rounded-3xl shadow-elevated flex flex-col overflow-hidden m-4"
      >
        {/* Header Section - Sticky at top */}
        <div className="p-6 md:p-8 pb-4 flex justify-between items-start shrink-0 z-10 bg-bg-card/80 backdrop-blur-md border-b border-white/5">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-text-main uppercase">Cognitive Grade</h3>
            <p className="text-[10px] md:text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">Rank & Progression Status</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-surface border border-border-subtle text-text-sub hover:text-text-main transition-all shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 pt-6 space-y-8">
          {/* Main Level Display */}
          <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex flex-col items-center text-center overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy size={100} />
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center text-white mb-6 animate-pulse-slow">
              <span className="text-2xl md:text-3xl font-black">L{currentLevel}</span>
            </div>
            
            <div className="space-y-2 relative z-10">
              <h4 className="text-lg md:text-xl font-bold text-text-main">Global Grade Level {currentLevel}</h4>
              <p className="text-xs md:text-sm text-text-sub max-w-[300px]">Next milestone is within reach. Keep training to unlock higher cognitive tiers.</p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <div className="space-y-1">
                <span className="text-[9px] md:text-[10px] font-black text-text-sub uppercase tracking-widest">Experience Points</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black text-text-main">{xpInCurrentLevel}</span>
                  <span className="text-xs md:text-sm font-bold text-text-dim">/ 500 XP</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest">Distance to Target</span>
                <span className="text-xs md:text-sm font-bold text-text-main">{xpNeededForNext} XP Left</span>
              </div>
            </div>

            <div className="h-2.5 md:h-3 w-full bg-surface-hover rounded-full overflow-hidden border border-border-subtle p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <History size={14} className="text-primary" />
              <span className="text-[9px] md:text-[10px] font-black text-text-main uppercase tracking-widest">Recent Activity Rewards</span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4 text-sm text-text-dim">Synchronizing state...</div>
              ) : xpHistory.length === 0 ? (
                <div className="text-center py-4 text-sm text-text-dim border border-dashed border-border-subtle rounded-xl">No recent telemetry found.</div>
              ) : (
                xpHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 md:p-4 rounded-xl bg-surface/50 border border-border-subtle hover:bg-surface transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Zap size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-main">{item.session?.testTitle || 'Diagnostic Test'}</span>
                        <span className="text-[9px] font-medium text-text-sub mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm font-black text-success">+{item.amount} XP</span>
                      <ArrowUpRight size={10} className="text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Motivational Area - Now inside scroll for mobile safety */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
                <Star size={18} />
              </div>
              <p className="text-[10px] md:text-[11px] font-medium text-success/80 leading-relaxed">
                Consistency is the primary fuel for cognitive dominance. Keep calibrating your neural pathways.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LevelStatsModal;
