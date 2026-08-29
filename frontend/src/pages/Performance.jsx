import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Code2,
  BrainCircuit
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatDuration } from '../utils/timeFormatter';

const Performance = () => {
  const { theme } = useTheme();
  const { setAppLoading, accessToken } = useAuth();
  const isDark = theme === 'dark';
  const [timeFilter, setTimeFilter] = useState(() => localStorage.getItem('performanceTimeFilter') || 'Weekly');
  const [activeSegment, setActiveSegment] = useState('Aptitude');
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const initFetchedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('performanceTimeFilter', timeFilter);
  }, [timeFilter]);

  useEffect(() => {
    if (accessToken) {
      fetchPerformance();
      initFetchedRef.current = true;
    }
  }, [timeFilter, activeSegment, accessToken]);

  const fetchPerformance = async () => {
    setLoading(true);
    setAppLoading(true);
    try {
      const res = await api.get(`/performance?filter=${timeFilter}&type=${activeSegment}`);
      if (res.data) {
        setPerformanceData(res.data);
      }
    } catch (err) {
      console.error("Performance data fetch failed", err);
    } finally {
      setLoading(false);
      setAppLoading(false);
    }
  };

  const { stats, chartData, categoryData, heatmapData, totalFocusVectors, recentActivity } = useMemo(() => {
    if (!performanceData || !performanceData.stats) return {
      stats: [],
      chartData: [],
      categoryData: [],
      heatmapData: [],
      totalFocusVectors: 0,
      recentActivity: []
    };

    return {
      stats: (performanceData.stats || []).map(s => ({
        ...s,
        icon: s.icon === 'Activity' ? Activity : (s.icon === 'Target' ? Target : (s.icon === 'Clock' ? Clock : Flame))
      })),
      chartData: performanceData.chartData || [],
      categoryData: performanceData.focusVectors || [],
      heatmapData: performanceData.heatmap || [],
      totalFocusVectors: (performanceData.focusVectors || []).reduce((sum, cat) => sum + cat.value, 0),
      recentActivity: performanceData.recentActivity || []
    };
  }, [performanceData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 shadow-elevated border-border-subtle bg-bg-card/90 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-bold text-text-main">
                {entry.name === 'accuracy' ? `${entry.value.toFixed(1)}%` :
                  (entry.name === 'time' ? formatDuration(entry.value * 60) : `${entry.value} units`)}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in outline-none">
      {/* Segment & Time Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex p-1 bg-surface border border-border-subtle rounded-2xl w-fit shrink-0">
          {[
            { id: 'Aptitude', icon: BrainCircuit, label: 'Aptitude Phase' },
            { id: 'Coding', icon: Code2, label: 'Coding Arsenal' }
          ].map((seg) => (
            <button
              key={seg.id}
              onClick={() => setActiveSegment(seg.id)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                ${activeSegment === seg.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-sub hover:text-text-main hover:bg-white/5'}
              `}
            >
              <seg.icon size={16} />
              {seg.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-xl w-fit shrink-0">
          {['Weekly', 'Monthly', 'Yearly'].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`
                px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300
                ${timeFilter === f
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                  : 'text-text-sub hover:text-text-main hover:bg-white/5'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted animate-pulse">Syncing Metrics...</p>
        </div>
      ) : performanceData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 group hover:translate-y-[-4px] transition-all duration-300 border border-white/5 hover:border-primary/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: `${stat.color}15`, color: stat.color }}
                  >
                    <stat.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.tendency === 'up' ? 'text-success' : 'text-error'}`}>
                    {stat.tendency === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.tendency === 'up' ? 'Gain' : 'Loss'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="label-text mb-0 opacity-40 uppercase tracking-widest text-[9px] font-bold">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-text-main leading-none">
                    {stat.value}
                  </h3>
                  <p className="text-[10px] font-medium text-text-muted pt-1">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 md:p-8 border border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Activity Progression</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold uppercase text-text-muted">{activeSegment === 'Coding' ? 'Submissions' : 'Completed'}</span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                        <Bar dataKey="tests" fill="#6366F1" radius={[6, 6, 0, 0]} animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 gap-3 border-2 border-dashed border-white/5 rounded-2xl">
                      <Activity size={32} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Insufficient Activity Vectors</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 md:p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-accent rounded-full" />
                      <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Accuracy Trend</h3>
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="accuracy" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4', strokeWidth: 2, stroke: isDark ? '#050810' : '#FFFFFF' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-20"><Activity size={24} /></div>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6 md:p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-warning rounded-full" />
                      <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Focus Intensity</h3>
                    </div>
                  </div>
                  <div className="h-[200px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" hide />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="time" stroke="#F59E0B" fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-20"><Activity size={24} /></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Vectors */}
            <div className="glass-card p-6 md:p-8 flex flex-col border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-secondary rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Concentration</h3>
              </div>
              <div className="flex-1">
                <div className="h-[240px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                        {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-text-main">{totalFocusVectors}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Metrics</span>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  {categoryData.length > 0 ? categoryData.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[11px] font-bold text-text-muted group-hover:text-text-main transition-colors uppercase tracking-tight">{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-text-main">{cat.percentage}%</span>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">No Sector Data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-card p-6 md:p-8 border border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Neural Consistency</h3>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar pb-2">
                  <div className="flex gap-1.5 min-w-max">
                    {heatmapData.length > 0 ? heatmapData.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1.5">
                        {week.map((day, dIdx) => (
                          <div
                            key={`${wIdx}-${dIdx}`}
                            className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-300 hover:scale-125 cursor-pointer ${day === 0 ? 'bg-surface border border-border-subtle' : 'bg-primary'}`}
                            style={{ opacity: day === 0 ? 1 : (day === 1 ? 0.3 : (day === 2 ? 0.6 : 1)) }}
                          />
                        ))}
                      </div>
                    )) : (
                      <div className="w-full flex items-center justify-center p-8 opacity-20">
                        <Calendar size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="glass-card p-6 md:p-8 border border-white/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-accent rounded-full" />
                  <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Recent {activeSegment} Activity</h3>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-border-subtle hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeSegment === 'Coding' ? 'text-primary bg-primary/10' : 'text-secondary bg-secondary/10'}`}>
                            {activeSegment === 'Coding' ? <Code2 size={18} /> : <BrainCircuit size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors truncate">{act.title}</h4>
                            <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mt-1">
                              {activeSegment === 'Coding' ? act.verdict : act.category} • {act.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {activeSegment === 'Aptitude' && (
                            <div className="text-right">
                              <span className={`text-sm font-black ${act.accuracy >= 70 ? 'text-success' : (act.accuracy >= 40 ? 'text-warning' : 'text-error')}`}>{act.accuracy}%</span>
                              <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Accuracy</p>
                            </div>
                          )}
                          <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4 opacity-40">
                    <Activity size={40} className="mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Recent Engagements</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-6 md:p-8 border border-white/5 bg-gradient-to-br from-primary/5 to-transparent h-fit">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Performance Insight</h4>
                <p className="text-sm text-text-sub leading-relaxed">
                  {activeSegment === 'Aptitude'
                    ? "Your cognitive throughput is stabilizing. Focus on Quantitative logic to bridge total mastery gaps."
                    : "Problem-solving velocity is increasing. Targeting 'Medium' complexity problems will yield maximum XP gains."}
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between font-bold">
                  <span className="text-[10px] uppercase tracking-tighter text-text-muted">Domain Standing</span>
                  <span className="text-xs text-text-main">Top 12%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] opacity-40 gap-4">
          <Activity size={48} />
          <p className="text-xs font-bold uppercase tracking-widest">No Performance Context Available</p>
        </div>
      )}
    </div>
  );
};

export default Performance;
