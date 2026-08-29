import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController, CategoryScale, LinearScale } from 'chart.js';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Clock, Trophy, Target, Zap, ChevronRight, Activity } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, PieController, CategoryScale, LinearScale);

const SummaryItem = ({ icon: Icon, label, value, sub, color }) => (
 <div className="glass-card glass-card-hover p-8 relative group overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
  <div className="label-text mb-4 opacity-30">{sub}</div>
  <div className="flex items-center gap-4 mb-2">
    <div className={`p-2 rounded-lg bg-surface ${color}`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className={`text-3xl font-bold tracking-tight ${color} leading-none`}>
     {value}
    </div>
  </div>
  <div className="label-text mb-0 opacity-40 text-[9px]">{label}</div>
 </div>
);

const ResultPage = () => {
 const location = useLocation();
 const navigate = useNavigate();
 const { theme } = useTheme();
 const { result, questions, answers, confirmed, user: locationUser } = location.state || {};
 const [user, setUser] = useState(locationUser || { name: 'User' });
 const { refreshUser } = useAuth(); // Destructured refreshUser from useAuth
 const [rank, setRank] = useState('-');
 const [filter, setFilter] = useState('all');

 useEffect(() => {
  if (!result) return;
  
  const syncUser = async () => { // Renamed fetchUser to syncUser
   try {
    const updatedUser = await refreshUser(); // Called refreshUser
    if (updatedUser) setUser(updatedUser);
   } catch (e) {
    console.error("Profile sync failure", e);
   }
  };
  syncUser(); // Called syncUser unconditionally

  const fetchRank = async () => {
   try {
    const leaderboardRes = await api.get(`/results/leaderboard/${result.sectionName}`);
    if (leaderboardRes.data) {
     const myRank = leaderboardRes.data.findIndex(r => r.scorePercentage === result.scorePercentage && r.timeTaken === result.timeTaken) + 1;
     setRank(myRank > 0 ? `#${myRank}` : '-');
    }
   } catch (err) {
    console.error("Leaderboard retrieval failed", err);
   }
  };
  fetchRank();
 }, [result, refreshUser]); // Added refreshUser to dependency array

 if (!result || !result.sectionName) {
  return (
   <div className="premium-bg min-h-screen flex items-center justify-center p-6 text-text-main font-sans">
    <div className="glass-card w-full max-w-[500px] text-center p-12 animate-slide-up bg-bg-card">
     <div className="text-6xl mb-8 opacity-20 filter grayscale saturate-0">🔍</div>
     <h1 className="text-3xl font-bold mb-4">Telemetry Lost</h1>
     <p className="text-text-sub text-sm font-medium mb-10">Historical assessment data could not be retrieved from the neural link.</p>
     <button className="btn btn-primary w-full" onClick={() => navigate('/dashboard')}>Return to Command</button>
    </div>
   </div>
  );
 }

 const chartData = {
  labels: ['SECURED', 'REJECTED', 'BYPASSED'],
  datasets: [{
   data: [result.correct, result.wrong, result.skipped],
   backgroundColor: ['#10b981', '#ef4444', theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'],
   borderColor: 'transparent',
   borderWidth: 0,
   hoverOffset: 12
  }],
 };

 const getStatus = (idx) => {
  if (!questions || !questions[idx]) return 'skipped';
  const userAns = (answers || result?.userAnswers || {})[idx];
  if (!userAns) return 'skipped';
  return userAns === questions[idx].correctAnswer ? 'correct' : 'wrong';
 };

 const filteredQuestions = questions ? questions.map((q, i) => ({ ...q, index: i, status: getStatus(i) })).filter(q => filter === 'all' || q.status === filter) : [];
 const accuracy = ((result?.correct / (result?.correct + result?.wrong || 1)) * 100 || 0).toFixed(0);

 return (
  <div className="w-full animate-fade-in pb-32">
   {/* Header Section */}
   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
     <div className="space-y-3">
      <div className="flex items-center gap-3">
       <div className="w-1 h-5 bg-primary rounded-full" />
       <span className="label-text text-primary mb-0 font-semibold tracking-wider uppercase">Assessment Finalized</span>
      </div>
      <h1 className="m-0 text-2xl md:text-3xl lg:text-3xl font-bold text-text-main tracking-tight">Performance <span className="text-gradient">Report</span></h1>
     </div>
    <button className="btn btn-primary min-w-[160px]" onClick={() => navigate('/dashboard')}>Dashboard</button>
   </div>

   {/* Global Analysis */}
   <div className="glass-card p-8 md:p-10 mb-12 relative overflow-hidden bg-bg-card border-none">
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
      <SummaryItem icon={Target} label="Accuracy" value={`${accuracy}%`} sub="Performance Index" color="text-primary" />
      <SummaryItem icon={Trophy} label="Global Rank" value={rank} sub="Position" color="text-secondary" />
      <SummaryItem icon={Clock} label="Time Vector" value={`${result.timeTaken}s`} sub="Duration" color="text-accent" />
      <SummaryItem icon={Zap} label="XP Earned" value={`+${result.correct * 10}`} sub="Reward" color="text-success" />
     </div>

     <div className="flex flex-col items-center gap-8 relative z-10">
      <div className="w-full max-w-[260px] aspect-square relative group">
       <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
       <Pie data={chartData} options={{ cutout: '80%', plugins: { legend: { display: false } }, maintainAspectRatio: true }} />
       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="label-text opacity-20 mb-1 text-[9px]">SCORE</span>
        <span className="text-5xl font-bold text-text-main leading-none">{result.correct}</span>
        <span className="label-text opacity-10 mt-2 text-[9px]">VERIFIED</span>
       </div>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
       <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        <span className="label-text mb-0 opacity-40 text-[9px]">Secured</span>
       </div>
       <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
        <span className="label-text mb-0 opacity-40 text-[9px]">Denied</span>
       </div>
       <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-surface border border-border-subtle" />
        <span className="label-text mb-0 opacity-40 text-[9px]">Bypassed</span>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Breakdown Section */}
   <div className="space-y-8">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
     <div className="space-y-2">
      <h2 className="text-text-main mb-0 font-semibold">Vector Breakdown</h2>
      <p className="text-text-sub font-normal">Granular decomposition of neural sequence</p>
     </div>
     <div className="flex items-center gap-1 bg-surface border border-border-subtle p-1 rounded-lg">
      {['all', 'correct', 'wrong', 'skipped'].map(f => (
       <button
        key={f}
        onClick={() => setFilter(f)}
        className={`
         px-5 py-2 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-all duration-300
         ${filter === f ? 'bg-primary text-white shadow-main' : 'text-text-sub hover:text-text-main'}
        `}
       >
        {f}
       </button>
      ))}
     </div>
    </div>

    <div className="grid grid-cols-1 gap-6">
     {filteredQuestions.map((q, idx) => {
      const statusTheme = {
       correct: { label: 'VECTOR SECURED', color: 'text-success', bg: 'bg-success/5', border: 'border-success/20' },
       wrong: { label: 'ACCESS DENIED', color: 'text-error', bg: 'bg-error/5', border: 'border-error/20' },
       skipped: { label: 'NODE BYPASSED', color: 'text-text-muted', bg: 'bg-surface/50', border: 'border-border-subtle' }
      }[q.status];

      const userAns = (answers || result.userAnswers || {})[q.index];

      return (
       <div key={idx} className={`glass-card p-8 border-none relative group overflow-hidden bg-bg-card transition-all duration-500`} style={{ animationDelay: `${idx * 0.05}s` }}>
        <div className={`absolute top-0 right-0 w-1.5 h-full opacity-30 ${statusTheme.bg.replace('/5', '/20')}`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
         <div className="flex items-center gap-5">
          <div className="flex flex-col">
           <span className="label-text mb-1 opacity-20 font-semibold uppercase tracking-wider text-[9px]">Sequence</span>
           <span className="text-xl font-bold text-primary leading-none transition-all">{q.index + 1}</span>
          </div>
          <div className="h-6 w-px bg-border-subtle" />
          <div className="badge badge-secondary text-[9px]">{(q.difficulty || 'Standard')} Complexity</div>
         </div>
         <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${statusTheme.border} ${statusTheme.bg} transition-all duration-300`}>
          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${statusTheme.color.replace('text-', 'bg-')}`} />
          <span className={`label-text mb-0 font-semibold ${statusTheme.color} text-[9px]`}>{statusTheme.label}</span>
         </div>
        </div>

        <p className="text-xl font-semibold leading-tight mb-8 text-text-main">{q.question}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
         <div className={`p-6 rounded-xl border ${statusTheme.border} ${statusTheme.bg} space-y-2.5 relative group/resp transition-all duration-300 hover:scale-[1.01]`}>
          <span className="label-text opacity-40 text-[9px]">User Response</span>
          <div className="font-semibold text-base text-text-main">{userAns || 'UNRESOLVED'}</div>
         </div>
         
         <div className="p-6 rounded-xl border border-success/20 bg-success/5 space-y-2.5 relative group/key transition-all duration-300 hover:scale-[1.01]">
          <span className="label-text opacity-40 text-[9px]">Standard Baseline</span>
          <div className="font-semibold text-base text-success">{q.correctAnswer}</div>
         </div>
        </div>
       </div>
      );
      })}
    </div>
   </div>
  </div>
 );
};

export default ResultPage;
