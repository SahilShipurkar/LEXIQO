import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { 
 Clock, 
 ArrowRight, 
 ChevronLeft, 
 ChevronRight, 
 CheckCircle2, 
 AlertTriangle,
 Flag,
 Lock,
 Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

/* 🧩 SUB-COMPONENTS */

const InfoBadge = ({ icon: Icon, text, sub }) => (
 <div className="flex flex-col items-center gap-2 p-5 bg-surface rounded-xl transition-all duration-500 hover:shadow-elevated group relative overflow-hidden text-center border border-border-subtle">
  <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-main">
   <Icon size={14} strokeWidth={2.5} />
  </div>
  <div className="flex flex-col items-center leading-none">
   <span className="text-xs font-semibold text-text-main uppercase tracking-wider mb-1">{text}</span>
   <span className="label-text mb-0">{sub}</span>
  </div>
 </div>
);

const SummaryRow = ({ label, value, color }) => (
 <div className="flex justify-between items-center group">
  <span className="text-xs font-semibold uppercase tracking-wider text-text-sub group-hover:text-text-main transition-colors">{label}</span>
  <div className="flex items-center gap-3">
   <div className="w-8 h-px bg-border-subtle group-hover:w-12 transition-all" />
   <span className={`text-base font-semibold ${color}`}>{value}</span>
  </div>
 </div>
);

const LegendRow = ({ color, label }) => (
 <div className="flex items-center gap-4 group">
  <div className={`w-3 h-3 rounded shadow-sm ${color} group-hover:rotate-12 transition-transform`} />
  <span className="label-text mb-0">{label}</span>
 </div>
);

const DetailItem = ({ icon: Icon, label, value, color, isLight }) => (
  <div className="flex items-start gap-3 flex-1 min-w-[120px]">
    <div className={`mt-1 p-2 rounded-lg ${isLight ? 'bg-surface' : 'bg-white/5'} border border-border-subtle ${color}`}>
      <Icon size={16} strokeWidth={2.5} />
    </div>
    <div className="flex flex-col">
      <span className="label-text mb-1">{label}</span>
      <span className="text-sm font-semibold text-text-main">{value}</span>
    </div>
  </div>
);

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { setAppLoading } = useAuth();

 const [questions, setQuestions] = useState([]);
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState({});
 const [confirmed, setConfirmed] = useState({});
 const [timeLeft, setTimeLeft] = useState(1200);
 const [loading, setLoading] = useState(true);
 const [startModalVisible, setStartModalVisible] = useState(true);
 const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setAppLoading(true);
      try {
        const res = await api.post(`/tests/sessions/start/${testId}`);
        const { session, questions: sessionQuestions } = res.data;

        if (sessionQuestions && sessionQuestions.length > 0) {
          const mapped = sessionQuestions.map(q => ({
            id: q.id,
            question: q.content,
            optionA: q.options[0]?.text,
            optionB: q.options[1]?.text,
            optionC: q.options[2]?.text,
            optionD: q.options[3]?.text,
            correctAnswer: q.options.find(o => o.id === q.correctAnswer)?.text
          }));
          setQuestions(mapped);
          setSessionId(session.id);
        } else {
          alert('Section content unavailable.');
          navigate('/practice-tests');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to establish terminal connection. Please ensure the test exists.');
        navigate('/practice-tests');
      } finally {
        setLoading(false);
        setAppLoading(false);
      }
    };

    if (hasStarted) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [hasStarted, testId, navigate, setAppLoading]);

  const calculateResult = useCallback(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, index) => {
      const selected = answers[index];
      if (!selected) {
        skipped++;
      } else if (selected === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    return {
      correct,
      wrong,
      skipped,
      total: questions.length,
      percentage: (correct / questions.length) * 100
    };
  }, [questions, answers]);

  const submitTest = useCallback(async (isAuto = false) => {
    setAppLoading(true);
    try {
      const resultData = calculateResult();
      
      const responsePromises = Object.entries(answers).map(([index, selected]) => {
        const qId = questions[index].id;
        return api.post(`/tests/sessions/${sessionId}/response`, {
          questionId: qId,
          selectedOption: selected,
          timeSpent: 10 // approximated value or captured real value
        });
      });
      await Promise.all(responsePromises);

      const finalRes = await api.post(`/tests/sessions/${sessionId}/complete`);
      const finalSession = finalRes.data;

      if (isAuto) {
        alert('Time expired. Synchronizing final state.');
      }

      const payload = {
        sectionName: finalSession.testTitle || testId,
        totalQuestions: finalSession.totalQuestions || questions.length,
        correct: finalSession.correctAnswers || finalSession.correctCount,
        wrong: finalSession.wrongCount,
        skipped: finalSession.skippedCount,
        scorePercentage: finalSession.accuracyPercentage || finalSession.score || 0,
        timeTaken: finalSession.durationSeconds || 1200 - timeLeft,
      };

      navigate(`/result/${testId}`, { state: { result: payload, questions, answers, confirmed } });
    } catch (err) {
      console.error("Submission failed", err);
      const resultData = calculateResult();
      navigate(`/result/${testId}`, { state: { result: { ...resultData, scorePercentage: resultData.percentage }, questions, answers, confirmed } });
    } finally {
      setAppLoading(false);
    }
  }, [answers, confirmed, questions, timeLeft, testId, sessionId, navigate, calculateResult, setAppLoading]);

 useEffect(() => {
  if (!hasStarted) return;
  if (timeLeft === 0) {
   submitTest(true);
   return;
  }
  const timer = setInterval(() => {
   setTimeLeft(prev => prev - 1);
  }, 1000);
  return () => clearInterval(timer);
 }, [timeLeft, hasStarted, submitTest]);

 const handleOptionSelect = (option) => {
  if (confirmed[currentQuestion]) return;
  setAnswers({ ...answers, [currentQuestion]: option });
 };

 const handleConfirm = () => {
  setConfirmed(prev => ({ ...prev, [currentQuestion]: true }));
  if (currentQuestion < questions.length - 1) {
   setTimeout(() => setCurrentQuestion(curr => curr + 1), 600);
  }
 };

 const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
 };

 if (loading) return (
  <div className="premium-bg min-h-screen flex items-center justify-center p-6">
   <div className="glass-card flex flex-col items-center gap-6 p-12">
    <Loader2 className="w-12 h-12 text-primary animate-spin" />
    <p className="text-base font-semibold uppercase tracking-widest text-primary animate-pulse">Initializing Neural Link...</p>
   </div>
  </div>
 );

  if (startModalVisible) {
    const isLight = theme === 'light';
    
    return (
    <div className={`premium-bg min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden transition-colors duration-500 animate-fade-in`}>
      {/* Dynamic Ambiance */}
      {!isLight && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px] animate-pulse [animation-delay:3s]" />
        </>
      )}

      <div className={`glass-card w-full max-w-[500px] p-6 md:p-10 animate-slide-up relative ${isLight ? 'bg-white shadow-elevated' : 'bg-bg-card border-border-main'} z-10 transition-all duration-500`}>
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 border border-primary/20 transition-colors">
            <Flag size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-text-main tracking-tight">
            Ready to Start Your Test
          </h1>

        </div>

        {/* Content Section */}
        <div className="space-y-8 mb-10">
          {/* Rules Section */}
          <div className={`p-5 rounded-xl border ${isLight ? 'bg-warning/10 border-warning/20' : 'bg-surface border-border-subtle shadow-inner'}`}>
            <h3 className={`label-text mb-3 flex items-center gap-2 ${isLight ? 'text-warning' : 'text-warning'}`}>
              ⚠️ Instructions
            </h3>
            <ul className="space-y-3">
             <li className="flex items-start gap-4 text-sm font-normal text-text-sub">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning/60" />
              Do not use outside help
             </li>
             <li className="flex items-start gap-4 text-sm font-normal text-text-sub">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-warning/60" />
              Timer starts when you begin
             </li>
            </ul>
          </div>

          {/* Test Details */}
          <div className="pt-6 border-t border-border-subtle font-sans">
            <h3 className="label-text mb-6">Test Details</h3>
            <div className="flex flex-wrap items-center justify-between gap-6 md:gap-4">
              <DetailItem icon={Clock} label="Time" value="20 Mins" color="text-primary" isLight={isLight} />
              <DetailItem icon={CheckCircle2} label="Questions" value="15 Qs" color="text-secondary" isLight={isLight} />

            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5">
          <button 
            className="btn btn-secondary flex-1"
            onClick={() => {
              const source = location.state?.source;
              if (source === 'dashboard') {
                navigate('/dashboard');
              } else if (source === 'history') {
                navigate('/history');
              } else {
                navigate('/practice-tests'); // Default or practice-tests
              }
            }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary flex-[1.5]"
            onClick={() => {
              setStartModalVisible(false);
              setHasStarted(true);
              setLoading(true);
            }}
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
   );
  }

 if (submitModalVisible) {
  const unconfirmed = Object.keys(answers).length - Object.keys(confirmed).length;
  return (
   <div className="premium-bg min-h-screen flex items-center justify-center p-6 animate-fade-in">
    <div className="glass-card w-full max-w-[480px] animate-slide-up p-8 md:p-10 text-center">
     <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary/20 shadow-inner">
      <CheckCircle2 size={32} className="text-secondary" />
     </div>
     <h2 className="text-xl font-bold text-text-main mb-1">Final Submission</h2>
     <p className="label-text mb-8 text-[9px]">Verification required before uplink</p>

     <div className="bg-surface rounded-2xl p-8 mb-10 space-y-4 text-left border border-border-subtle">
      <SummaryRow label="Locked States" value={Object.keys(confirmed).length} color="text-warning" />
      <SummaryRow label="Buffered Selection" value={unconfirmed} color="text-secondary" />
      <SummaryRow label="Null Pointers" value={questions.length - Object.keys(answers).length} color="text-error" />
     </div>

     <div className="flex gap-4">
      <button className="btn btn-secondary flex-1" onClick={() => setSubmitModalVisible(false)}>
       Resume
      </button>
      <button className="btn btn-primary flex-1 !bg-secondary shadow-secondary/20 border-none" onClick={() => submitTest(false)}>
       Uplink
      </button>
     </div>
    </div>
   </div>
  )
 }

 if (!questions.length) return null;

  const q = questions[currentQuestion];
  const opts = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
  const isLocked = confirmed[currentQuestion];

  return (
  <div className="premium-bg h-screen w-full flex flex-col font-sans transition-colors duration-500 overflow-hidden no-scrollbar animate-fade-in">
   {/* Assessment Header - Refined Premium Style */}
   <nav className="relative h-[60px] flex items-center justify-between px-6 md:px-10 bg-bg-card/60 backdrop-blur-2xl border-b border-border-subtle z-[100] shrink-0">
    <div className="flex items-center gap-5">
    <div className="flex items-center border-l border-border-subtle pl-5 py-2">
      <span className="text-lg font-semibold text-text-main tracking-tight">Test in Progress</span>
    </div>
    </div>

    <div className={`
     flex items-center gap-3.5 px-6 py-2 rounded-full bg-surface border border-border-subtle font-mono font-bold text-xl transition-all duration-300 shadow-main
     ${timeLeft < 60 ? 'text-error animate-pulse bg-error/5 border-error/20' : 
     timeLeft < 300 ? 'text-warning bg-warning/5 border-warning/20' : 'text-success bg-success/5 border-success/20'}
    `}>
     <Clock size={16} className="shrink-0" />
     {formatTime(timeLeft)}
    </div>

    <div className="flex items-center gap-4">
      <button 
       className="btn btn-secondary px-5 py-2.5 h-fit text-error border-error/30 hover:bg-error/10 hover:border-error/50"
       onClick={async () => {
         if (window.confirm("Cancel current session? Partial attempt will be recorded.")) {
           try {
             await api.post(`/tests/sessions/${sessionId}/abort`);
           } catch (e) { console.error(e); }
           navigate('/history');
         }
       }}
      >
       Cancel
      </button>
      <button 
       className="btn btn-primary !bg-secondary px-5 py-2.5 h-fit shadow-secondary/20 border-none"
       onClick={() => setSubmitModalVisible(true)}
      >
       Submit Test
      </button>
    </div>
   </nav>

   <main className="flex-1 max-w-[1240px] w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
    {/* Core Terminal Area */}
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar">
     <div className="glass-card glass-card-hover p-6 md:p-10 mb-6 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-center mb-6">
       <div className="flex items-center gap-4">
        <span className="label-text mb-0 opacity-40 text-[9px]">Question {currentQuestion + 1} // {questions.length}</span>
        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--clr-primary)]" />
       </div>
       <div className="badge badge-primary text-[9px]">
        {(q.difficulty || 'Standard')} Difficulty
       </div>
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-text-main leading-tight mb-0">{q.question}</h2>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {opts.map((opt, idx) => {
       const isSelected = answers[currentQuestion] === opt;
       return (
        <button
         key={idx}
         disabled={isLocked}
         className={`
          flex items-center gap-5 p-5 rounded-xl transition-all duration-300 relative overflow-hidden group text-left border
          ${isSelected 
           ? 'bg-primary/10 border-primary/40 shadow-main ring-1 ring-primary/20' 
           : 'bg-surface border-border-subtle hover:bg-surface-hover hover:border-border-main'}
          ${isLocked ? 'cursor-default opacity-60' : 'cursor-pointer'}
         `}
         onClick={() => handleOptionSelect(opt)}
        >
         <div className={`
          w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs transition-all duration-300
          ${isSelected ? 'bg-primary text-white shadow-elevated' : 'bg-surface-hover text-text-muted group-hover:text-text-main border border-border-subtle'}
         `}>
          {String.fromCharCode(65 + idx)}
         </div>
         <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-text-main' : 'text-text-sub group-hover:text-text-main'}`}>
          {opt}
         </span>
         {isSelected && <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary" strokeWidth={3} />}
        </button>
       );
      })}
     </div>

     {/* Control Dock */}
     <div className="mt-auto flex items-center justify-between py-6">
      <button 
       className="btn btn-secondary px-6 flex items-center gap-2.5 disabled:opacity-20"
       disabled={currentQuestion === 0}
       onClick={() => setCurrentQuestion(curr => curr - 1)}
      >
       <ChevronLeft size={16} /> Prev
      </button>

      <div className="flex flex-col items-center gap-3">
       <button
        className={`
         btn px-10 py-3.5 min-w-[200px] shadow-elevated transition-all
         ${isLocked 
          ? 'bg-success/5 border-success/40 text-success' 
          : 'btn-primary'}
         ${(!answers[currentQuestion] || isLocked) && 'opacity-50 pointer-events-none'}
        `}
        onClick={handleConfirm}
       >
        {isLocked ? 'Locked' : 'Save Answer'}
       </button>
       {!isLocked && answers[currentQuestion] && (
        <span className="text-[9px] font-semibold text-primary uppercase tracking-widest animate-pulse">Awaiting confirmation</span>
       )}
      </div>

      <button 
       className="btn btn-primary px-6 flex items-center gap-2.5"
       onClick={() => currentQuestion < questions.length - 1 ? setCurrentQuestion(curr => curr + 1) : setSubmitModalVisible(true)}
      >
       {currentQuestion < questions.length - 1 ? <>Next <ChevronRight size={16} /></> : 'Review'}
      </button>
     </div>
    </div>

    {/* Overview Panel */}
    <div className="w-full lg:w-[320px] flex flex-col gap-6 shrink-0 h-fit">
     <div className="glass-card p-6 shadow-main">
      <div className="flex items-center gap-3 mb-6">
       <div className="w-1 h-5 bg-primary rounded-full" />
       <h4 className="label-text mb-0">Questions</h4>
      </div>
      <div className="grid grid-cols-5 gap-2.5">
       {questions.map((_, idx) => {
        const isConfirmed = confirmed[idx];
        const isSelected = answers[idx];
        const isCurrent = currentQuestion === idx;
        return (
         <button
          key={idx}
          onClick={() => setCurrentQuestion(idx)}
          className={`
           aspect-square rounded-lg flex items-center justify-center font-bold text-[10px] transition-all duration-300 border
           ${isCurrent 
            ? 'bg-primary border-transparent text-white scale-110 shadow-elevated z-10' 
            : isConfirmed ? 'bg-warning border-transparent text-white' 
            : isSelected ? 'bg-primary/20 border-primary/40 text-primary' 
            : 'bg-surface border-border-subtle text-text-dim hover:border-border-main hover:text-text-main'}
          `}
         >
          {idx + 1}
         </button>
        );
       })}
      </div>
     </div>

     <div className="glass-card p-6 border-dashed">
      <h4 className="label-text mb-5 opacity-30">Status</h4>
      <div className="space-y-3.5">
       <LegendRow color="bg-primary shadow-sm" label="Current Question" />
       <LegendRow color="bg-warning shadow-sm" label="Locked" />
       <LegendRow color="bg-primary/20 border border-primary/40" label="Not Answered" />
       <LegendRow color="bg-surface border border-border-subtle" label="Unvisited" />
      </div>
     </div>
    </div>
   </main>
  </div>
 );
};

export default TestPage;
