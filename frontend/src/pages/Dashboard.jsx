import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  Calculator,
  MessageSquare,
  Code,
  History
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../utils/timeFormatter';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="glass-card glass-card-hover flex items-center gap-4 p-4.5">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
      style={{ background: `${color}10`, color: color }}
    >
      <Icon size={22} strokeWidth={2.5} />
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-semibold text-text-main leading-none mb-1">{value}</span>
      <span className="label-text mb-0">{label}</span>
      {subtext && <span className="text-[10px] text-text-muted mt-1 font-medium">{subtext}</span>}
    </div>
  </div>
);

const CategoryCard = ({ test, bestScore, onClick }) => {
  const Icon = test.icon;
  return (
    <div
      className="glass-card glass-card-hover group cursor-pointer p-5"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
          style={{ background: `${test.color}10`, color: test.color }}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="badge badge-primary" style={{ background: `${test.color}10`, color: test.color }}>
          {test.category}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-lg font-semibold text-text-main mb-3 group-hover:text-primary transition-colors line-clamp-1">{test.title}</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="label-text mb-0">Mastery Level</span>
            <span className="text-sm font-semibold text-text-main">{bestScore ? `${bestScore.toFixed(0)}%` : '0%'}</span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--clr-primary),0.3)]"
              style={{ background: test.color, width: `${bestScore || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
        <div className="flex gap-3">
          <span className="flex items-center gap-1 label-text mb-0"><Clock size={11} /> {test.time}</span>
          <span className="flex items-center gap-1 label-text mb-0"><ArrowRight size={11} /> {test.questions} Qs</span>
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-surface group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, refreshUser, setAppLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [dbTests, setDbTests] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    accuracy: 0,
    avgTime: 0
  });
  const [codingStats, setCodingStats] = useState(null);

  const iconMap = {
    'Quantitative Aptitude': Calculator,
    'Logical Reasoning': Brain,
    'Verbal Ability': MessageSquare,
    'Data Interpretation': TrendingUp,
    'Data Structures & Algorithms': Code,
    'DSA Fundamentals': Code,
    'Quant Basics': Calculator,
    'Logical Reasoning Pro': Brain,
    'Verbal Excellence': MessageSquare,
    'DI Mastery': TrendingUp
  };

  const colorMap = {
    'Quantitative Aptitude': '#8b5cf6',
    'Logical Reasoning': '#ec4899',
    'Verbal Ability': '#06b6d4',
    'Data Interpretation': '#10b981',
    'Data Structures & Algorithms': '#f59e0b',
    'DSA Fundamentals': '#f59e0b',
    'Quant Basics': '#8b5cf6',
    'Logical Reasoning Pro': '#ec4899',
    'Verbal Excellence': '#06b6d4',
    'DI Mastery': '#10b981'
  };

  const initFetchedRef = useRef(false);

  useEffect(() => {
    if (user && user.role !== 'guest' && !initFetchedRef.current) {
      const initDashboard = async () => {
        setAppLoading(true);
        initFetchedRef.current = true;
        try {
          await Promise.all([
            refreshUser(),
            fetchDashboardData(),
            fetchTests(),
            fetchCodingStats()
          ]);
        } catch (error) {
          console.error("Dashboard initialization failed", error);
        } finally {
          setAppLoading(false);
        }
      };
      initDashboard();
    }
  }, [user?.id, setAppLoading]);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests');
      // Mix backend data with icons/colors
      const merged = res.data.map(t => ({
        ...t,
        icon: iconMap[t.title] || Brain,
        color: colorMap[t.title] || '#8b5cf6',
        questions: t.totalQuestions,
        time: `${t.duration}m`,
        category: t.category?.name || 'Logic'
      }));
      setDbTests(merged);
    } catch (err) {
      console.error("Fetch tests failed", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/results');
      if (res.data && Array.isArray(res.data)) {
        const normalizedData = res.data.map(r => ({
          ...r,
          scorePercentage: Number(r.scorePercentage),
          timeTaken: Number(r.timeTaken)
        }));

        const sorted = [...normalizedData].sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate));
        setHistory(sorted);

        const best = {};
        let totalAccuracy = 0;
        let totalTime = 0;

        normalizedData.forEach(r => {
          if (best[r.sectionName] === undefined || r.scorePercentage > best[r.sectionName]) {
            best[r.sectionName] = r.scorePercentage;
          }
          totalAccuracy += r.scorePercentage;
          totalTime += r.timeTaken;
        });

        setBestScores(best);
        setStats({
          completed: normalizedData.length,
          accuracy: normalizedData.length ? (totalAccuracy / normalizedData.length).toFixed(1) : 0,
          avgTime: normalizedData.length ? (totalTime / normalizedData.length) : 0
        });
      }
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
    }
  };

  const fetchCodingStats = async () => {
    try {
      const res = await api.get('/coding/stats');
      setCodingStats(res.data);
    } catch (err) {
      console.error("Coding stats fetch failed", err);
    }
  };

  const lastTest = history[0];
  const displayName = (user?.name || 'Learner').split(' ')[0];

  return (
    <div className="flex flex-col gap-10 pb-20 w-full animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-text-main mb-4 leading-tight tracking-tighter">
            Welcome back, <br className="sm:hidden" />
            <span className="text-gradient">{displayName}</span>! 👋
          </h1>
          <p className="text-text-sub text-[14px] font-normal max-w-lg">
            You're on a <span className="text-primary font-medium">{user?.currentStreak || 0} day streak</span>. Consistency is the primary fuel for cognitive dominance.
          </p>
        </div>
        <button
          className="btn btn-primary min-w-[160px]"
          onClick={() => {
            const quickStartTest = dbTests.find(t => t.title === 'Logical Reasoning') || dbTests[0];
            if (quickStartTest) navigate(`/test/${quickStartTest.id}`, { state: { source: 'dashboard' } });
            else navigate('/practice-tests');
          }}
        >
          Quick Start
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Current Streak" value={`${user?.currentStreak || 0}`} subtext="Day streak active" color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Tests Completed" value={stats.completed} subtext="Total sessions" color="#10b981" />
        <StatCard icon={Target} label="Avg. Accuracy" value={`${stats.accuracy}%`} subtext="Precision level" color="#8b5cf6" />
        <StatCard icon={Clock} label="Avg. Time" value={formatDuration(stats.avgTime)} subtext="Pace per test" color="#ec4899" />
      </div>

      {/* Coding Summary Section */}
      {codingStats && (
        <section className="animate-fade-in">
          <div
            className="glass-card flex flex-col md:flex-row items-center gap-8 p-8 border border-primary/20 bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => navigate('/coding-practice')}
          >
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <Code size={20} />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-0 uppercase tracking-tight">Coding Arsenal</h3>
              </div>
              <p className="text-text-sub text-sm max-w-md font-normal">
                You've solved <span className="text-primary font-bold">{codingStats.totalSolved} problems</span> across {Object.values(codingStats.difficultyStats).filter(v => v > 0).length} difficulty levels. Your technical capability is expanding.
              </p>
            </div>

            <div className="flex gap-4 sm:gap-8 shrink-0">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-400">{codingStats.difficultyStats.EASY}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Easy</span>
              </div>
              <div className="w-px h-10 bg-border-subtle self-center opacity-30" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-amber-400">{codingStats.difficultyStats.MEDIUM}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Medium</span>
              </div>
              <div className="w-px h-10 bg-border-subtle self-center opacity-30" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-rose-400">{codingStats.difficultyStats.HARD}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted mt-1">Hard</span>
              </div>
            </div>

            <div className="btn btn-primary h-12 w-12 rounded-full p-0 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ArrowRight size={20} />
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Left Column: Learning Roadmap */}
        <div className="space-y-10 min-w-0">
          {lastTest && (
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-text-main mb-0 font-semibold">Previous Session</h2>
              </div>
              <div
                className="glass-card glass-card-hover group flex flex-col md:flex-row items-center justify-between gap-5 cursor-pointer overflow-hidden p-8"
                onClick={() => navigate(`/test/${lastTest.testId}`, { state: { source: 'dashboard' } })}
              >
                <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative space-y-3">
                  <span className="label-text text-primary font-semibold uppercase tracking-wider text-[9px]">Resume Last Test</span>
                  <h3 className="text-2xl font-semibold text-text-main mb-0">{lastTest.sectionName}</h3>
                  <div className="flex items-center gap-2 text-small">
                    <span>Executed on:</span>
                    <span className="text-text-sub font-medium">{new Date(lastTest.attemptDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="btn btn-primary w-12 h-12 rounded-full p-0 flex items-center justify-center shrink-0">
                  <ArrowRight size={20} />
                </div>
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-secondary rounded-full" />
                <h2 className="text-text-main mb-0 font-semibold">Skill Assessment</h2>
              </div>
              <button className="text-[10px] font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Explore All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbTests.map(test => (
                <CategoryCard
                  key={test.id}
                  test={test}
                  bestScore={bestScores[test.title]}
                  onClick={() => navigate(`/test/${test.id}`, { state: { source: 'dashboard' } })}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Intel & Goals */}
        <div className="space-y-8">
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-accent rounded-full" />
              <h2 className="text-text-main mb-0 font-semibold">Recent Activity</h2>
            </div>
            <div className="glass-card p-0 overflow-hidden">
              {history.length > 0 ? (
                <div className="flex flex-col">
                  <div className="divide-y divide-border-subtle">
                    {history.slice(0, 5).map((item, idx) => {
                      const testInfo = dbTests.find(t => t.id === item.testId || t.title === item.sectionName);
                      return (
                        <div key={idx}
                          className="flex items-center gap-4 px-6 py-5 hover:bg-surface transition-colors cursor-pointer"
                          onClick={() => navigate(`/result/${item.testId}`, { state: { result: item, source: 'dashboard' } })}>
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border-subtle"
                            style={{ background: (testInfo?.color || '#8b5cf6') + '10' }}
                          >
                            <Clock size={16} style={{ color: testInfo?.color || '#8b5cf6' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-main truncate uppercase tracking-tight mb-1">{item.sectionName}</div>
                            <div className="text-[9px] font-medium text-text-muted uppercase tracking-widest">{new Date(item.attemptDate).toLocaleDateString()}</div>
                          </div>
                          <div className={`text-sm font-semibold ${item.scorePercentage >= 70 ? 'text-success' : 'text-text-sub'}`}>
                            {item.scorePercentage.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-6 bg-surface/50">
                    <button
                      className="btn btn-secondary w-full"
                      onClick={() => navigate('/history')}
                    >
                      Full Analytics
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center space-y-6">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto text-text-dim">
                    <History size={32} />
                  </div>
                  <p className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">No activity history found.</p>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => navigate('/test/Quantitative Aptitude', { state: { source: 'dashboard' } })}
                  >
                    Start First Phase
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-warning rounded-full" />
              <h2 className="text-text-main mb-0 font-semibold">Daily Goals</h2>
            </div>
            <div className="glass-card p-6 space-y-5">
              <GoalItem checked={stats.completed > 0} text="Complete daily ritual" />
              <GoalItem checked={stats.accuracy >= 80} text="Maintain high precision" />
              <GoalItem checked={false} text="Break personal ceiling" />

              <div className="pt-5 border-t border-border-subtle">
                <div className="flex justify-between items-end mb-2.5">
                  <span className="label-text mb-0 font-semibold uppercase tracking-wider text-[9px]">Completion Status</span>
                  <span className="text-xs font-semibold text-primary">{stats.completed > 0 ? '33' : '0'}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000"
                    style={{ width: stats.completed > 0 ? '33%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const GoalItem = ({ checked, text }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300 ${checked ? 'bg-success border-success shadow-sm' : ' bg-surface border border-border-subtle group-hover:border-primary/30'}`}>
      {checked ? <CheckCircle2 size={12} className="text-white stroke-[3px]" /> : <div className="w-1 h-1 rounded-full bg-text-dim" />}
    </div>
    <span className={`text-sm font-normal tracking-wide leading-none ${checked ? 'text-text-muted line-through' : 'text-text-sub'}`}>
      {text}
    </span>
  </div>
);

export default Dashboard;
