import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Plus, 
  Minus, 
  Save, 
  Trophy,
  ArrowUpRight,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Goals = () => {
  const { setAppLoading } = useAuth();
  const [dailyGoal, setDailyGoal] = useState(5);
  const [weeklyGoal, setWeeklyGoal] = useState(21);
  const [monthlyGoal, setMonthlyGoal] = useState(100);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbGoals, setDbGoals] = useState([]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setAppLoading(true);
      const res = await api.get('/goals');
      setDbGoals(res.data);
      
      const daily = res.data.find(g => g.type === 'DAILY');
      const weekly = res.data.find(g => g.type === 'WEEKLY');
      const monthly = res.data.find(g => g.type === 'MONTHLY');
      
      if (daily) setDailyGoal(daily.targetValue);
      if (weekly) setWeeklyGoal(weekly.targetValue);
      if (monthly) setMonthlyGoal(monthly.targetValue);
    } catch (err) {
      console.error("Failed to fetch goals", err);
    } finally {
      setLoading(false);
      setAppLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleUpdateGoals = async () => {
    try {
      setSaving(true);
      setAppLoading(true);
      await Promise.all([
        api.post('/goals/update', { type: 'DAILY', targetValue: dailyGoal }),
        api.post('/goals/update', { type: 'WEEKLY', targetValue: weeklyGoal }),
        api.post('/goals/update', { type: 'MONTHLY', targetValue: monthlyGoal })
      ]);
      await fetchGoals();
      alert('Goals updated successfully!');
    } catch (err) {
      console.error("Failed to update goals", err);
      alert('Failed to update goals.');
    } finally {
      setSaving(false);
      setAppLoading(false);
    }
  };

  const getProgress = (type) => {
    const goal = dbGoals.find(g => g.type === type);
    return goal ? goal.currentValue : 0;
  };

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const goalConfigs = [
    { id: 'DAILY', title: 'Daily Protocol', sub: 'Target sessions per 24h cycle', value: dailyGoal, current: getProgress('DAILY'), icon: Zap, color: '#F59E0B' },
    { id: 'WEEKLY', title: 'Weekly Sprint', sub: 'Target sessions per 7-day window', value: weeklyGoal, current: getProgress('WEEKLY'), icon: Target, color: '#6366F1' },
    { id: 'MONTHLY', title: 'Monthly Mastery', sub: 'Long-term cognitive exposure target', value: monthlyGoal, current: getProgress('MONTHLY'), icon: Calendar, color: '#EC4899' }
  ];

  const insights = [
    { text: `Consistency: You've completed ${getProgress('DAILY')} sessions today.`, icon: CheckCircle2, color: '#10B981' },
    { text: `Efficiency: You are ${calculateProgress(getProgress('MONTHLY'), monthlyGoal)}% on track for your monthly target.`, icon: TrendingUp, color: '#6366F1' },
    { text: `Projection: You need ${Math.max(0, weeklyGoal - getProgress('WEEKLY'))} more tests this week to stay on target.`, icon: Lightbulb, color: '#F59E0B' }
  ];

  const Stepper = ({ val, setVal, min = 1, max = 200 }) => (
    <div className="flex items-center gap-3">
      <button 
        onClick={() => setVal(Math.max(min, val - 1))}
        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-sub hover:text-primary hover:border-primary/30 transition-all"
      >
        <Minus size={16} />
      </button>
      <span className="text-xl font-bold text-text-main w-12 text-center">{val}</span>
      <button 
        onClick={() => setVal(Math.min(max, val + 1))}
        className="w-10 h-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-text-sub hover:text-primary hover:border-primary/30 transition-all"
      >
        <Plus size={16} />
      </button>
    </div>
  );

  if (loading && dbGoals.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-fade-in outline-none">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-text-main mb-0 leading-tight">Optimization Goals</h1>
        <p className="text-text-sub font-normal max-w-lg">Configuring your cognitive training vectors for maximum systemic growth.</p>
      </div>

      {/* Hero Summary Card */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
              <Trophy size={32} />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-text-main mb-0">Daily Ritual Priority</h3>
              <p className="text-sm text-text-sub">Executing {getProgress('DAILY')} of {dailyGoal} sessions. You're almost at the checkpoint! 🚀</p>
            </div>
          </div>
          <div className="w-full md:w-[300px] space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">Daily Progress</span>
              <span className="text-sm font-bold text-text-main">{calculateProgress(getProgress('DAILY'), dailyGoal)}%</span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress(getProgress('DAILY'), dailyGoal)}%` }}
                className="h-full bg-primary shadow-main"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Strategy Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {goalConfigs.map((goal, i) => {
          const progress = calculateProgress(goal.current, goal.value);
          const status = progress === 100 ? 'Completed' : progress >= 75 ? 'On Track' : 'Behind';
          const statusColors = {
            'Completed': 'bg-success/10 text-success border-success/20',
            'On Track': 'bg-primary/10 text-primary border-primary/20',
            'Behind': 'bg-warning/10 text-warning border-warning/20'
          };

          return (
            <motion.div
              layout
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-border-subtle text-white shadow-sm"
                  style={{ backgroundColor: goal.color }}
                >
                  <goal.icon size={22} strokeWidth={2.5} />
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusColors[status]}`}>
                  {status}
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h4 className="text-lg font-bold text-text-main leading-tight mb-0">{goal.title}</h4>
                <p className="text-[11px] text-text-muted font-normal tracking-tight">{goal.sub}</p>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest mb-1">Status</span>
                    <span className="text-base font-bold text-text-main leading-none">{goal.current} / {goal.value}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-widest mb-1">Yield</span>
                    <span className="text-base font-bold text-text-main leading-none">{progress}%</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full shadow-sm"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Goal Setting HUD */}
        <div className="lg:col-span-2 glass-card p-8 md:p-10 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-main mb-0 leading-none">Parameters Calibration</h3>
              <p className="text-[11px] text-text-muted font-normal">Fine-tune your performance thresholds for optimal cognitive development.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1 flex items-center justify-between">
                  Daily Cycle Thresholds
                  <span className="text-primary opacity-60">Adaptive Scaling</span>
                </span>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border-subtle group focus-within:border-primary/30 transition-all">
                  <Stepper val={dailyGoal} setVal={setDailyGoal} max={10} />
                  <div className="flex flex-col items-end opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-tighter">Current Target</span>
                    <span className="text-sm font-bold text-text-main">{dailyGoal} Sessions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Weekly Commitment Pulse</span>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border-subtle focus-within:border-primary/30 transition-all">
                  <Stepper val={weeklyGoal} setVal={setWeeklyGoal} max={50} />
                  <div className="flex flex-col items-end opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-tighter">Current Target</span>
                    <span className="text-sm font-bold text-text-main">{weeklyGoal} Sessions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 flex flex-col">
              <div className="space-y-3 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Monthly Exposure Vector</span>
                <div className="p-6 rounded-2xl bg-surface border border-border-subtle h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <span className="text-2xl font-black text-text-main">{monthlyGoal}</span>
                      <span className="text-[10px] block font-bold text-text-muted uppercase">Monthly Sessions</span>
                    </div>
                    <div className="flex gap-2">
                        {[40, 60, 80, 100].map(p => (
                            <button 
                                key={p} 
                                onClick={() => setMonthlyGoal(p)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${monthlyGoal === p ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border-subtle text-text-sub hover:border-primary/30'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    value={monthlyGoal} 
                    onChange={(e) => setMonthlyGoal(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>
              </div>
              <button 
                onClick={handleUpdateGoals}
                disabled={saving}
                className="btn btn-primary w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-main disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Updating...' : 'Update Deployment Goals'}
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence HUD */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-8 space-y-8 h-full">
            <h4 className="text-lg font-bold text-text-main mb-0 flex items-center gap-3">
              <TrendingUp size={20} className="text-primary" />
              Intelligence Insights
            </h4>
            <div className="space-y-8">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-9 h-9 rounded-xl bg-surface border border-border-subtle flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                    <insight.icon size={18} style={{ color: insight.color }} />
                  </div>
                  <div className="space-y-1 pt-1">
                    <p className="text-[13px] font-medium text-text-sub leading-snug">{insight.text}</p>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-success uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Positive Delta <ArrowUpRight size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
