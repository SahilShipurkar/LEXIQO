import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Calendar, 
  Target, 
  ChevronRight, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  BarChart3,
  Brain,
  Trophy,
  History as HistoryIcon,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CustomDropdown = ({ options, value, onChange, icon: Icon, isDark }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-bg-card/50 border border-border-subtle hover:border-primary/50 rounded-xl px-4 py-2 transition-all group min-w-[140px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-text-muted group-hover:text-primary transition-colors" />
          <span className="text-xs font-bold text-text-main truncate">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`
              absolute top-full left-0 right-0 z-[100] mt-2 border border-border-subtle rounded-xl overflow-hidden min-w-[200px]
              ${isDark 
                ? 'bg-[#0B0E14] shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
                : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]'}
            `}
          >
            <div className="py-1.5 px-1.5 flex flex-col gap-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2.5 text-xs font-bold transition-all relative flex items-center justify-between rounded-lg
                    ${value === option.value 
                      ? 'bg-primary/10 text-primary' 
                      : isDark 
                        ? 'text-text-sub hover:bg-surface hover:text-text-main' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  {option.label}
                  {value === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const History = () => {
  const { theme } = useTheme();
  const { setAppLoading } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  const [historyData, setHistoryData] = useState([]);
  const [summaryStats, setSummaryStats] = useState([
    { label: 'Total Attempted', value: '-', icon: HistoryIcon, color: '#6366F1' },
    { label: 'Completed Tests', value: '-', icon: CheckCircle2, color: '#10B981' },
    { label: 'Avg. Accuracy', value: '-', icon: Target, color: '#EC4899' },
    { label: 'Best Category', value: '-', icon: Brain, color: '#06B6D4' }
  ]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setAppLoading(true);
      try {
        const res = await api.get('/results/history');
        if (isMounted) {
          const stats = [
            { label: 'Total Attempted', value: String(res.data.summaryStats.totalAttempted), icon: HistoryIcon, color: '#6366F1' },
            { label: 'Completed Tests', value: String(res.data.summaryStats.completedTests), icon: CheckCircle2, color: '#10B981' },
            { label: 'Avg. Accuracy', value: `${res.data.summaryStats.avgAccuracy}%`, icon: Target, color: '#EC4899' },
            { label: 'Best Category', value: res.data.summaryStats.bestCategory, icon: Brain, color: '#06B6D4' }
          ];
          setSummaryStats(stats);
          
          const colorMap = {
            'Quantitative': '#EC4899',
            'Logical Reasoning': '#6366F1',
            'Verbal Ability': '#F59E0B',
            'Data Interpretation': '#10B981',
            'Data Structures & Algorithms': '#06B6D4',
            'Logic': '#6366F1',
            'Math': '#EC4899',
            'Code': '#06B6D4',
            'English': '#F59E0B'
          };
          
          const mappedHistory = res.data.historyData.map(h => ({
              ...h,
              color: colorMap[h.category] || '#6366F1'
          }));
          
          setHistoryData(mappedHistory);
          setLoading(false);
        }
      } catch(err) {
        console.error("History fetch failed:", err);
      } finally {
        setAppLoading(false);
        if (isMounted) {
            setLoading(false);
        }
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, []);

  const statusColors = {
    'Completed': 'bg-success/10 text-success border-success/20',
    'In Progress': 'bg-warning/10 text-warning border-warning/20',
    'Aborted': 'bg-error/10 text-error border-error/20',
    'Review Pending': 'bg-primary/10 text-primary border-primary/20'
  };

  const statusIcons = {
    'Completed': CheckCircle2,
    'In Progress': Clock3,
    'Aborted': XCircle,
    'Review Pending': AlertTriangle
  };

  const filteredData = useMemo(() => {
    return historyData
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'Newest') return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
        if (sortBy === 'Highest Score') return b.accuracy - a.accuracy;
        if (sortBy === 'Lowest Score') return a.accuracy - b.accuracy;
        if (sortBy === 'Longest Duration') return b.duration.localeCompare(a.duration);
        return 0;
      });
  }, [historyData, searchQuery, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-text-muted font-bold uppercase tracking-widest text-[10px]">Retrieving Assessment Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in outline-none">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-text-main mb-0 leading-tight">Assessment History</h1>
        <p className="text-text-sub font-normal max-w-lg">Audit your performance vectors and previous systemic interactions.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 group hover:translate-y-[-4px] transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-bold text-text-main leading-none mb-1">{stat.value}</span>
                <span className="label-text mb-0 opacity-40 whitespace-nowrap">{stat.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls Area */}
      <div className="relative z-[60] flex flex-col lg:flex-row gap-4 items-center justify-between bg-surface/30 p-2 rounded-2xl border border-border-subtle backdrop-blur-sm">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search terminal logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card/50 border border-border-subtle focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl pl-12 pr-4 py-2.5 text-xs transition-all outline-none text-text-main placeholder:text-text-muted font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <CustomDropdown 
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Completed', label: 'Completed' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Aborted', label: 'Aborted' },
              { value: 'Review Pending', label: 'Pending' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            icon={Filter}
            isDark={isDark}
          />

          <CustomDropdown 
            options={[
              { value: 'Newest', label: 'Newest First' },
              { value: 'Highest Score', label: 'Highest Score' },
              { value: 'Lowest Score', label: 'Lowest Score' },
              { value: 'Longest Duration', label: 'Duration' }
            ]}
            value={sortBy}
            onChange={setSortBy}
            icon={ArrowUpDown}
            isDark={isDark}
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {filteredData.map((item, idx) => {
            const StatusIcon = statusIcons[item.status];
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-4 md:px-6 md:py-5 flex flex-col md:flex-row items-center gap-5 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: item.color }} />
                
                {/* Info Cluster */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-[15px] font-bold text-text-main group-hover:text-primary transition-colors leading-tight mb-0 truncate">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-text-sub bg-surface border border-border-subtle whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Calendar size={12} strokeWidth={2.5} />
                      <span className="text-[11px] font-semibold">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <Clock size={12} strokeWidth={2.5} />
                      <span className="text-[11px] font-semibold">{item.time}</span>
                    </div>
                  </div>
                </div>

                {/* Score & Duration */}
                <div className="flex items-center gap-10 md:gap-14 px-8 border-l border-border-subtle hidden sm:flex">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-dim mb-1">Precision</span>
                    <span className={`text-base font-bold ${item.accuracy >= 80 ? 'text-success' : item.accuracy >= 50 ? 'text-text-main' : 'text-text-sub'}`}>
                      {item.accuracy}%
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-dim mb-1">Duration</span>
                    <span className="text-base font-bold text-text-main">{item.duration}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-5 w-full md:w-auto border-t md:border-t-0 md:border-l border-border-subtle pt-4 md:pt-0 md:pl-8">
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 min-w-[120px] justify-center ${statusColors[item.status]}`}>
                    <StatusIcon size={12} strokeWidth={3} />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">{item.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'Completed' && (
                    <button 
                      onClick={() => navigate(`/test/${item.testId}`, { state: { source: 'history' } })}
                      className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-main hover:shadow-elevated transition-all border-none"
                      title="Retry Terminal"
                    >
                      <RotateCcw size={16} />
                    </button>
                    )}
                  </div>
                </div>

                <div className="absolute right-2 text-text-dim opacity-0 group-hover:opacity-10 transition-opacity hidden md:block">
                  <ChevronRight size={40} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 glass-card border-dashed">
            <div className="w-20 h-20 rounded-full bg-surface border-2 border-dashed border-border-subtle flex items-center justify-center text-text-dim mb-2">
              <HistoryIcon size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-main">No history logs detected</h3>
              <p className="text-text-sub font-normal max-w-xs">Your interaction history is currently void. Execute a test terminal to begin data logging.</p>
            </div>
            <button 
              onClick={() => {setSearchQuery(''); setStatusFilter('All');}}
              className="btn btn-secondary px-8"
            >
              Clear Navigation Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
