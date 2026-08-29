import React, { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Search, 
  Filter, 
  Flame, 
  Target, 
  CheckCircle2, 
  TrendingUp,
  ChevronUp,
  ChevronDown,
  User,
  Star,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Leaderboard = () => {
  const { user, setAppLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [timeFilter, setTimeFilter] = useState('Weekly');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [globalStats, setGlobalStats] = useState({ avgXp: 0, activeUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setAppLoading(true);
      setLoading(true);
      try {
        const response = await api.get('/leaderboard', {
          params: { timeFilter, categoryFilter }
        });
        
        const data = (response.data.users || response.data).map(u => ({
          ...u,
          isUser: u.id === user?.id
        }));
        setLeaderboardData(data);
        setGlobalStats({
          avgXp: response.data.globalAvgXP || 0,
          activeUsers: response.data.activeUsersCount || 0
        });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
        setAppLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter, categoryFilter, user?.id, setAppLoading]);

  const topThree = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);
  const remainingUsers = useMemo(() => leaderboardData.slice(3), [leaderboardData]);

  const filters = ['Weekly', 'Monthly', 'All Time'];
  const categories = ['All', 'Math', 'Logic', 'Coding', 'English'];

  const PodiumUser = ({ user, rank, size, delay }) => {
    const isFirst = rank === 1;
    const Icon = isFirst ? Crown : Medal;
    const medalColor = rank === 1 ? 'text-warning' : rank === 2 ? 'text-slate-400' : 'text-amber-700';
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: "easeOut" }}
        className={`flex flex-col items-center relative ${isFirst ? 'z-20' : 'z-10'}`}
      >
        <div className="relative mb-4">
          <div className={`
            rounded-full flex items-center justify-center border-4 shadow-elevated transition-transform hover:scale-105 cursor-pointer overflow-hidden
            ${isFirst ? 'w-24 h-24 md:w-32 md:h-32 border-warning/30 ring-4 ring-warning/10' : 'w-20 h-20 md:w-24 md:h-24 border-white/10'}
          `} style={{ background: user.picture ? 'none' : `linear-gradient(135deg, ${user.avatarColor}20, ${user.avatarColor}40)` }}>
            {user.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover" />
            ) : (
              isFirst ? <Star className="text-warning animate-pulse" size={size / 2.5} /> : <User className="text-text-sub" size={size / 2.5} />
            )}
          </div>
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-bg-card border border-border-main shadow-main flex items-center gap-1.5`}>
            <Icon size={14} className={medalColor} />
            <span className="text-[11px] font-bold text-text-main">#{rank}</span>
          </div>
        </div>
        <div className="text-center">
          <h3 className={`font-bold text-text-main leading-tight mb-1 ${isFirst ? 'text-lg md:text-xl' : 'text-base'}`}>{user.name}</h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary font-bold text-sm">{user.score}</span>
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest px-2 py-0.5 rounded bg-surface border border-border-subtle">LVL {user.level}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-10 pb-16 animate-fade-in outline-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-text-main mb-0 leading-tight">Leaderboard</h1>
          <p className="text-text-sub font-normal max-w-lg">Compare your cognitive trajectory against the highest global performers.</p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl w-fit">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`
                px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300
                ${timeFilter === f 
                  ? 'bg-primary text-white shadow-main' 
                  : 'text-text-sub hover:text-text-main hover:bg-white/5'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Section */}
      <div className="relative pt-10 pb-6 flex items-end justify-center gap-6 md:gap-16 min-h-[300px]">
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full max-w-4xl bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest px-4 py-2 bg-surface/50 border border-border-subtle rounded-xl backdrop-blur-sm shadow-sm">
                Recalibrating Global Hierarchy...
              </span>
            </div>
          </div>
        ) : leaderboardData.length > 0 ? (
          <>
            {topThree[1] && <PodiumUser user={topThree[1]} rank={2} size={96} delay={0.2} />}
            {topThree[0] && <PodiumUser user={topThree[0]} rank={1} size={128} delay={0} />}
            {topThree[2] && <PodiumUser user={topThree[2]} rank={3} size={80} delay={0.4} />}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50 py-10">
            <Trophy size={48} className="text-text-muted mb-2" />
            <span className="text-sm font-bold text-text-muted">No systemic activity detected for this cycle.</span>
          </div>
        )}
      </div>

      {/* Category & Advanced Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border-y border-border-subtle py-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`
                px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all
                ${categoryFilter === c 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-text-muted hover:text-text-main border border-transparent'}
              `}
            >
              {c}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-text-muted">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest">
            <Zap size={14} className="text-warning" /> 
            Global Avg: {globalStats.avgXp.toLocaleString()} XP
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest">
            <Activity size={14} className="text-primary" /> 
            Active Users: {globalStats.activeUsers.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="grid grid-cols-[60px_1fr_100px_100px_100px_100px] gap-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <span>Rank</span>
          <span>Initiator / Learner</span>
          <span className="text-center">Protocol Score</span>
          <span className="text-center">Tests</span>
          <span className="text-center">Accuracy</span>
          <span className="text-center">Streak</span>
        </div>

        <div className="space-y-2">
          {!loading && leaderboardData.length > 0 && (
            <AnimatePresence mode='popLayout'>
              {leaderboardData.map((u, idx) => (
                <motion.div
                  layout
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`
                    grid grid-cols-[60px_1fr_100px_100px_100px_100px] gap-4 items-center px-6 py-4 rounded-xl transition-all duration-300 group
                    ${u.isUser 
                      ? 'bg-primary/5 ring-1 ring-primary/30 shadow-elevated py-5' 
                      : 'bg-surface border border-border-subtle hover:border-border-main hover:translate-y-[-1px]'}
                  `}
                >
                  {/* Rank */}
                  <span className={`text-sm font-bold ${u.rank <= 3 ? 'text-primary' : 'text-text-muted'}`}>
                    #{u.rank}
                  </span>

                  {/* User Info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-border-subtle text-white font-bold text-xs shadow-sm overflow-hidden`} style={{ background: u.picture ? 'none' : u.avatarColor }}>
                      {u.picture ? (
                        <img src={u.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.name[0]
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-text-main truncate flex items-center gap-2">
                        {u.name}
                        {u.isUser && <span className="bg-primary text-[8px] px-1.5 py-0.5 rounded text-white font-black uppercase tracking-tighter">YOU</span>}
                      </span>
                      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest leading-none">Level {u.level}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-text-main">{u.score.toLocaleString()}</span>
                    <div className="flex items-center gap-1 text-[8px] text-success font-bold uppercase">
                      <ChevronUp size={8} /> {u.id === user?.id ? 'UP' : '--'}
                    </div>
                  </div>
                  
                  <span className="text-sm font-semibold text-text-main text-center">{u.tests}</span>
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-1 bg-border-subtle rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-primary" style={{ width: `${u.accuracy}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-text-main whitespace-nowrap">{u.accuracy}%</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-warning">
                    <Flame size={14} fill={u.streak > 0 ? "currentColor" : "none"} />
                    <span className="text-sm font-bold">{u.streak}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Legend / Footer */}
      <div className="flex items-center justify-between pt-4 opacity-40">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-warning" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Excellence Tier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Growth Vector</span>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Protocol Data Refreshed: T-Minus 2m</span>
      </div>
    </div>
  );
};

const Activity = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default Leaderboard;
