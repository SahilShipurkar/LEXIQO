import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import {
    Play,
    Send,
    ChevronLeft,
    Clock,
    Trophy,
    Info,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    RotateCcw,
    Settings as SettingsIcon,
    ChevronDown,
    Terminal,
    FileCode2,
    Bookmark,
    BookmarkCheck,
    History,
    Lightbulb,
    FileText,
    Maximize2,
    Minimize2,
    Command,
    ExternalLink,
    Code,
    Cpu,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const LANGUAGE_MAP = {
    javascript: { id: 'JAVASCRIPT', label: 'JavaScript', ext: 'js', monaco: 'javascript', filename: 'solution.js' },
    python: { id: 'PYTHON', label: 'Python', ext: 'py', monaco: 'python', filename: 'solution.py' },
    cpp: { id: 'CPP', label: 'C++', ext: 'cpp', monaco: 'cpp', filename: 'solution.cpp' },
    java: { id: 'JAVA', label: 'Java', ext: 'java', monaco: 'java', filename: 'Main.java' },
    c: { id: 'C', label: 'C', ext: 'c', monaco: 'c', filename: 'solution.c' }
};

const ProblemDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { setAppLoading } = useAuth();

    // State
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [leftTab, setLeftTab] = useState('description');
    const [bottomTab, setBottomTab] = useState('testcases');
    const [results, setResults] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Editor Ref
    const editorRef = useRef(null);

    useEffect(() => {
        fetchProblem();
    }, [slug]);

    useEffect(() => {
        if (leftTab === 'submissions') {
            fetchSubmissions();
        }
    }, [leftTab]);

    const fetchProblem = async () => {
        setAppLoading(true);
        try {
            const res = await api.get(`/coding/problems/${slug}`);
            setProblem(res.data);
            setIsSaved(res.data.isSaved);

            // Set default starter code
            const template = res.data.starterCode?.find(s => s.language === 'JAVASCRIPT');
            if (template) setCode(template.starterCode);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load problem");
            navigate('/coding-practice');
        } finally {
            setAppLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await api.get(`/coding/problems/${slug}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLanguageChange = (langKey) => {
        setLanguage(langKey);
        setShowLangMenu(false);
        const template = problem.starterCode?.find(s => s.language === LANGUAGE_MAP[langKey].id);
        if (template) setCode(template.starterCode);
        else setCode('// No template available for this language');
    };

    const runCode = async () => {
        setIsRunning(true);
        setBottomTab('result');
        setResults(null);
        try {
            const res = await api.post('/coding/run', {
                problemId: problem.id,
                language: LANGUAGE_MAP[language].id,
                sourceCode: code,
            });
            setResults({ type: 'run', ...res.data });
            toast.success("Execution completed");
        } catch (err) {
            console.error(err);
            setResults({ type: 'run', success: false, errorMessage: 'Execution failed. Internal server error.' });
            toast.error("Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        setIsSubmitting(true);
        setBottomTab('result');
        setResults(null);
        try {
            const res = await api.post('/coding/submit', {
                problemId: problem.id,
                language: LANGUAGE_MAP[language].id,
                sourceCode: code,
            });
            setResults({ type: 'submit', ...res.data });

            if (res.data.verdict === 'ACCEPTED') {
                toast.success("Solution Accepted!");
                setProblem(prev => ({ ...prev, isSolved: true }));
                fetchSubmissions();
            } else {
                toast.error(res.data.verdict.replace(/_/g, ' '));
            }
        } catch (err) {
            console.error(err);
            setResults({ type: 'submit', verdict: 'ERROR', errorMessage: 'Internal error during submission.' });
            toast.error("Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSave = async () => {
        try {
            const res = await api.post(`/coding/save/${problem.id}`);
            setIsSaved(res.data.saved);
            toast.success(res.data.saved ? "Problem saved" : "Problem removed from saves");
        } catch (err) {
            console.error(err);
        }
    };

    if (!problem) return null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#0f1115] text-text-main font-sans selection:bg-primary/30">
            {/* --- TOP WORKSPACE HEADER --- */}
            <header className="h-14 shrink-0 bg-[#161b22] border-b border-white/5 flex items-center justify-between px-4 z-30 shadow-2xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/coding-practice')}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-colors text-text-muted hover:text-text-main group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-50">Problem</span>
                        <h2 className="text-sm font-bold text-text-main truncate max-w-[200px] md:max-w-[350px] mb-0 tracking-tight">{problem.title}</h2>
                        <div className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${problem.difficulty === 'EASY' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                            problem.difficulty === 'MEDIUM' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                                'text-rose-400 border-rose-400/20 bg-rose-400/5'
                            }`}>
                            {problem.difficulty}
                        </div>
                        {problem.isSolved && (
                            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                                <CheckCircle2 size={12} />
                                Solved
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all shadow-sm"
                        >
                            <span className="text-[11px] font-black text-text-main uppercase tracking-widest leading-none">
                                {LANGUAGE_MAP[language].label}
                            </span>
                            <ChevronDown size={14} className={`text-text-muted transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showLangMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-[#1c2128] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 border-white/5 backdrop-blur-xl"
                                >
                                    {Object.entries(LANGUAGE_MAP).map(([key, info]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleLanguageChange(key)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all mb-1 last:mb-0 ${language === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-text-muted hover:text-text-main'
                                                }`}
                                        >
                                            {info.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button
                        onClick={runCode}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d333b] hover:bg-[#373e47] text-text-main text-[11px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        {isRunning ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        <span>Run</span>
                    </button>
                    <button
                        onClick={submitCode}
                        disabled={isRunning || isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        <span>Submit</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN SPLIT WORKSPACE --- */}
            <Split
                className="flex-1 flex overflow-hidden split-workspace"
                sizes={[38, 62]}
                minSize={300}
                expandToMin={false}
                gutterSize={3}
                gutter={(index, direction) => {
                    const gutter = document.createElement('div');
                    gutter.className = `gutter gutter-${direction} bg-black/40 hover:bg-primary/40 transition-colors cursor-col-resize`;
                    return gutter;
                }}
            >
                {/* LEFT PANEL: CONTENT */}
                <div className="flex flex-col bg-[#0d1117] border-r border-white/5 overflow-hidden">
                    <div className="flex bg-[#161b22] border-b border-white/5 shrink-0 px-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'description', label: 'Description', icon: Info },
                            { id: 'submissions', label: 'Submissions', icon: History },
                            { id: 'hints', label: 'Hints', icon: Lightbulb },
                            { id: 'editorial', label: 'Editorial', icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setLeftTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${leftTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text-main'
                                    }`}
                            >
                                <tab.icon size={13} strokeWidth={2.5} />
                                {tab.label}
                                {leftTab === tab.id && (
                                    <motion.div layoutId="leftActive" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 xl:p-10">
                        <AnimatePresence mode="wait">
                            {leftTab === 'description' && (
                                <motion.div
                                    key="description"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-10 pb-10"
                                >
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h1 className="text-3xl font-black tracking-tighter mb-0 text-text-main">{problem.title}</h1>
                                            <button
                                                onClick={toggleSave}
                                                className={`flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest ${isSaved ? 'text-primary bg-primary/5' : 'text-text-muted'}`}
                                            >
                                                {isSaved ? <BookmarkCheck size={16} fill="currentColor" /> : <Bookmark size={16} />}
                                                {isSaved ? 'Saved' : 'Save'}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-[#8b949e]">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-primary" />
                                                {problem.estimatedMinutes} Mins
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Trophy size={16} className="text-warning" />
                                                50 XP
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-[16px] leading-[1.8] text-[#c9d1d9] font-normal whitespace-pre-wrap selection:bg-primary/40">
                                            {problem.description}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#8b949e] flex items-center gap-3">
                                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                                            Case Examples
                                        </h4>
                                        {problem.examples?.map((ex, i) => (
                                            <div key={i} className="space-y-3 group">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b949e] opacity-40 ml-1">Example {i + 1}</p>
                                                <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 space-y-5 font-mono text-[13px] shadow-sm group-hover:border-white/10 transition-colors">
                                                    <div className="relative">
                                                        <span className="text-primary absolute -left-3 top-0 animate-pulse">•</span>
                                                        <span className="text-[#8b949e] block text-[10px] uppercase mb-2 font-sans font-black tracking-widest opacity-60">Input</span>
                                                        <div className="text-[#f0f6fc] break-all leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{ex.input}</div>
                                                    </div>
                                                    <div className="relative">
                                                        <span className="text-emerald-400 absolute -left-3 top-0">•</span>
                                                        <span className="text-[#8b949e] block text-[10px] uppercase mb-2 font-sans font-black tracking-widest opacity-60">Output</span>
                                                        <div className="text-emerald-400 break-all leading-relaxed bg-emerald-400/5 p-3 rounded-lg border border-emerald-400/10">{ex.output}</div>
                                                    </div>
                                                    {ex.explanation && (
                                                        <div className="pt-4 border-t border-white/5">
                                                            <span className="text-[#8b949e] block text-[10px] uppercase mb-2 font-sans font-black tracking-widest opacity-60">Analysis</span>
                                                            <div className="text-text-muted italic text-[14px] font-sans leading-relaxed">{ex.explanation}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#8b949e] flex items-center gap-3">
                                            <div className="w-1.5 h-4 bg-rose-400 rounded-full" />
                                            Boundary Constraints
                                        </h4>
                                        <div className="grid gap-3">
                                            {problem.constraints?.split('\n').map((c, i) => (
                                                <div key={i} className="flex items-center gap-4 text-[13px] font-mono text-text-muted bg-[#21262d]/20 py-3.5 px-5 rounded-xl border border-white/5 hover:bg-[#21262d]/40 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400/40 shrink-0" />
                                                    {c.replace(/^- /, '')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2.5 pt-8 border-t border-white/5">
                                        {problem.tags?.map(tag => (
                                            <span key={tag.id} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#8b949e] hover:bg-primary/10 hover:text-primary transition-all cursor-default">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {leftTab === 'submissions' && (
                                <motion.div
                                    key="submissions"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-black uppercase tracking-widest text-text-main mb-0">Success Logs</h3>
                                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{submissions.length} Attempts</div>
                                    </div>

                                    {submissions.length === 0 ? (
                                        <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-30">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-muted border border-white/10 shadow-inner">
                                                <History size={40} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-black uppercase tracking-widest mb-1">Null Sequence Detected</h3>
                                                <p className="text-xs text-text-muted font-bold max-w-xs leading-loose">The execution pipeline has no recorded outcomes for this specific challenge yet.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {submissions.map((sub, idx) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={sub.id}
                                                    className="bg-[#161b22] hover:bg-[#1c2128] border border-white/10 hover:border-primary/40 rounded-2xl p-5 transition-all group cursor-pointer shadow-sm overflow-hidden relative"
                                                >
                                                    <div className="flex justify-between items-center relative z-10">
                                                        <div className="space-y-1.5">
                                                            <div className={`text-xs font-black tracking-widest flex items-center gap-2 uppercase ${sub.verdict === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {sub.verdict === 'ACCEPTED' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                                {sub.verdict.split('_').join(' ')}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                                                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 text-text-main">{sub.language}</span>
                                                                <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                                {sub.runtimeMs !== null && <span>• {sub.runtimeMs}ms</span>}
                                                            </div>
                                                        </div>
                                                        <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </div>
                                                    {sub.verdict === 'ACCEPTED' && (
                                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 blur-2xl rounded-full" />
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {leftTab === 'hints' && (
                                <motion.div
                                    key="hints"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-lg font-black uppercase tracking-widest text-text-main mb-4">Strategic Hints</h3>
                                    {(!problem.hints || problem.hints.length === 0) ? (
                                        <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-30">
                                            <Lightbulb size={48} />
                                            <p className="text-sm font-black uppercase tracking-widest leading-loose">No architectural hints established <br />for this coordinate yet.</p>
                                        </div>
                                    ) : (
                                        problem.hints.map((hint, i) => (
                                            <div key={hint.id} className="bg-[#161b22] !p-6 border border-white/10 hover:border-primary/30 rounded-2xl transition-all group flex gap-5">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black border border-primary/20 shrink-0 shadow-sm mt-1">
                                                    {i + 1}
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b949e] opacity-60">Phase Segment</span>
                                                    <p className="text-[15px] leading-[1.7] text-[#c9d1d9] font-medium">{hint.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {leftTab === 'editorial' && (
                                <motion.div key="editorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <h3 className="text-lg font-black uppercase tracking-widest text-text-main mb-4">Tactical Breakdown</h3>
                                    {problem.editorial ? (
                                        <div className="prose prose-invert max-w-none">
                                            <div className="text-[16px] leading-[1.8] text-[#c9d1d9] font-normal whitespace-pre-wrap bg-[#161b22] p-8 md:p-10 rounded-2xl border border-white/10 shadow-lg selection:bg-primary/30">
                                                {problem.editorial}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-96 flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-30">
                                            <FileText size={48} />
                                            <p className="text-sm font-black uppercase tracking-widest leading-loose">Knowledge base entry <br />still in verification phase.</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT PANEL: EDITOR + OUTPUT */}
                <div className="flex flex-col bg-[#1e1e1e] overflow-hidden">
                    <Split
                        direction="vertical"
                        sizes={[65, 35]}
                        minSize={[150, 40]}
                        gutterSize={4}
                        gutter={(index, direction) => {
                            const gutter = document.createElement('div');
                            gutter.className = `gutter gutter-${direction} bg-[#000000] hover:bg-primary/50 transition-colors cursor-row-resize border-y border-white/5`;
                            return gutter;
                        }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* Editor Section */}
                        <div className="flex flex-col overflow-hidden">
                            <div className="h-10 bg-[#252526] border-b border-black/50 flex items-center justify-between px-4 shrink-0 shadow-lg z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded flex items-center justify-center bg-white/5 border border-white/5">
                                        <FileCode2 className="text-primary" size={12} />
                                    </div>
                                    <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mt-0.5">
                                        {LANGUAGE_MAP[language].filename}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleLanguageChange(language)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all group"
                                        title="Factory Reset Script"
                                    >
                                        <RotateCcw size={14} className="group-hover:rotate-[-90deg] transition-transform" />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <button className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-all">
                                        <SettingsIcon size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-[#1e1e1e]">
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={LANGUAGE_MAP[language].monaco}
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                    onMount={(editor) => (editorRef.current = editor)}
                                    options={{
                                        fontSize: 15,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        lineNumbers: 'on',
                                        roundedSelection: true,
                                        padding: { top: 20, bottom: 20 },
                                        cursorStyle: 'line',
                                        automaticLayout: true,
                                        contextmenu: true,
                                        formatOnPaste: true,
                                        smoothScrolling: true,
                                        lineHeight: 24,
                                        letterSpacing: 0.5,
                                        cursorBlinking: 'smooth',
                                        renderLineHighlight: 'all',
                                        scrollbar: {
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8,
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bottom Output Panel */}
                        <div className="flex flex-col bg-[#0d1117] border-t border-black overflow-hidden h-full shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-20">
                            <div className="h-10 bg-[#1c2128] border-b border-white/5 flex items-center justify-between px-2 shrink-0">
                                <div className="flex">
                                    {[
                                        { id: 'testcases', label: 'Samples', icon: Terminal },
                                        { id: 'result', label: 'Output', icon: Cpu },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setBottomTab(tab.id)}
                                            className={`flex items-center gap-2.5 px-5 h-10 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${bottomTab === tab.id ? 'bg-[#0d1117] text-primary' : 'text-text-muted hover:text-text-main'
                                                }`}
                                        >
                                            <tab.icon size={12} strokeWidth={2.5} />
                                            {tab.label}
                                            {bottomTab === tab.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="px-4 flex items-center gap-2 text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] opacity-40">
                                    Terminal Status: Ready
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#0d1117] relative selection:bg-primary/40 min-h-0">
                                <AnimatePresence mode="wait">
                                    {bottomTab === 'testcases' && (
                                        <motion.div key="tc" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                            {problem.testCases?.map((tc, idx) => (
                                                <div key={idx} className="space-y-3 group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sample Case {idx + 1}</div>
                                                    </div>
                                                    <div className="bg-[#161b22] p-5 rounded-2xl border border-white/5 font-mono text-[13px] text-[#f0f6fc] leading-relaxed group-hover:border-white/10 transition-colors shadow-sm">
                                                        <div className="text-[10px] text-[#8b949e] uppercase mb-2 font-sans font-black tracking-widest opacity-40">Input String</div>
                                                        {tc.input}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {bottomTab === 'result' && (
                                        <motion.div key="res" initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 max-w-4xl">
                                            {isRunning || isSubmitting ? (
                                                <div className="flex flex-col items-center justify-center min-h-[150px] gap-6">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs font-black uppercase tracking-[0.3em] text-text-main animate-pulse">
                                                            {isSubmitting ? 'Verifying Hidden Protocols' : 'Running Diagnostic Sequence'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-50">Transmitting to Cloud Kernel...</span>
                                                    </div>
                                                </div>
                                            ) : results ? (
                                                <div className="space-y-8 pb-4">
                                                    <div className={`p-6 md:p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-8 transition-all shadow-xl ${((results.status === 'ACCEPTED' || results.verdict === 'ACCEPTED'))
                                                        ? 'bg-emerald-400/[0.03] border-emerald-400/20 shadow-emerald-400/5' : 'bg-rose-400/[0.03] border-rose-400/20 shadow-rose-400/5'
                                                        }`}>
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform rotate-[-5deg] ${(results.status === 'ACCEPTED' || results.verdict === 'ACCEPTED')
                                                                ? 'bg-emerald-400/20 text-emerald-400 ring-2 ring-emerald-400/20' : 'bg-rose-400/20 text-rose-400 ring-2 ring-rose-400/20'
                                                                }`}>
                                                                {(results.status === 'ACCEPTED' || results.verdict === 'ACCEPTED') ? <CheckCircle2 size={32} strokeWidth={2.5} /> : <XCircle size={32} strokeWidth={2.5} />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className={`text-2xl font-black tracking-tight mb-0 uppercase leading-none ${(results.status === 'ACCEPTED' || results.verdict === 'ACCEPTED') ? 'text-emerald-400' : 'text-rose-400'
                                                                    }`}>
                                                                    {(results.status || results.verdict || 'ERROR').replace(/_/g, ' ')}
                                                                </h3>
                                                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b949e]">
                                                                    Diagnostic Pass: <span className="text-text-main">{results.passedCount} / {results.totalCount}</span> Segments Verified
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-10">
                                                            {results.runtimeMs !== undefined && (
                                                                <div className="text-center md:text-right space-y-1">
                                                                    <div className="text-xl font-black text-text-main flex items-center gap-2 justify-center md:justify-end">
                                                                        <Zap size={16} className="text-warning" />
                                                                        {results.runtimeMs}ms
                                                                    </div>
                                                                    <div className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Efficiency</div>
                                                                </div>
                                                            )}
                                                            {results.memoryKb !== undefined && (
                                                                <div className="text-center md:text-right space-y-1">
                                                                    <div className="text-xl font-black text-text-main flex items-center gap-2 justify-center md:justify-end">
                                                                        <Cpu size={16} className="text-primary" />
                                                                        {results.memoryKb}KB
                                                                    </div>
                                                                    <div className="text-[10px] uppercase font-black text-text-muted tracking-[0.2em]">Heap Load</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {results.errorMessage && (
                                                        <div className="space-y-4">
                                                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-400 flex items-center gap-2">
                                                                <AlertTriangle size={14} />
                                                                Critical Exception Encountered
                                                            </h4>
                                                            <div className="bg-[#1c2128] border border-rose-400/20 rounded-2xl p-6 md:p-8 font-mono text-[13px] text-rose-100 leading-relaxed shadow-lg whitespace-pre-wrap">
                                                                {results.errorMessage}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4">
                                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8b949e] flex items-center gap-2">
                                                            Segmental Reports
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {results.testCaseResults?.map((tr, i) => (
                                                                <div key={i} className={`rounded-2xl border bg-[#161b22] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all hover:bg-[#1c2128] ${tr.status === 'PASS' ? 'border-emerald-400/10' : 'border-rose-400/10'
                                                                    }`}>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${tr.status === 'PASS' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
                                                                            }`}>
                                                                            {tr.status === 'PASS' ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[11px] font-black text-text-main uppercase tracking-widest">Case Segment 0{i + 1}</span>
                                                                            <span className={`text-[9px] font-black uppercase tracking-widest ${tr.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>{tr.status === 'PASS' ? 'Verified' : 'Invalidated'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-6">
                                                                        <div className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col gap-1">
                                                                            <span className="text-[8px] font-black text-[#8b949e] uppercase tracking-widest leading-none">Input Buffer</span>
                                                                            <span className="text-[12px] font-mono text-text-main truncate max-w-[120px]">{tr.input}</span>
                                                                        </div>
                                                                        <div className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col gap-1">
                                                                            <span className="text-[8px] font-black text-[#8b949e] uppercase tracking-widest leading-none">Result Output</span>
                                                                            <span className={`text-[12px] font-mono truncate max-w-[120px] ${tr.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>{tr.actualOutput || 'Empty'}</span>
                                                                        </div>
                                                                        <div className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 flex flex-col gap-1">
                                                                            <span className="text-[8px] font-black text-[#8b949e] uppercase tracking-widest leading-none">Expected Protocol</span>
                                                                            <span className="text-[12px] font-mono text-emerald-400 truncate max-w-[120px]">{tr.expectedOutput}</span>
                                                                        </div>
                                                                        {tr.runtimeMs !== undefined && (
                                                                            <div className="text-right">
                                                                                <div className="text-[11px] font-black text-text-main">{tr.runtimeMs}ms</div>
                                                                                <span className="text-[8px] font-black text-[#8b949e] uppercase tracking-widest leading-none">Cycles</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-64 flex flex-col items-center justify-center p-10 opacity-20 text-center space-y-4">
                                                    <div className="p-6 bg-white/5 rounded-full border border-white/10">
                                                        <Terminal size={48} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black uppercase tracking-[0.4em]">Standby...</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting execution command</p>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Split>
                </div>
            </Split>

            {/* Global CSS for Split */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .split-workspace {
                    height: 100%;
                }
                .gutter {
                    background-color: transparent;
                    background-repeat: no-repeat;
                    background-position: 50%;
                }
                .gutter.gutter-horizontal {
                    width: 3px;
                    border-left: 1px solid rgba(255,255,255,0.03);
                    border-right: 1px solid rgba(255,255,255,0.03);
                }
                .gutter.gutter-vertical {
                    height: 3px;
                    border-top: 1px solid rgba(0,0,0,0.5);
                    border-bottom: 1px solid rgba(0,0,0,0.5);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.08);
                    border-radius: 10px;
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.15);
                    background-clip: content-box;
                }
                /* Monaco overrides */
                .monaco-editor .scroll-decoration {
                    box-shadow: none !important;
                }
                .monaco-editor .margin {
                    background-color: #1e1e1e !important;
                    border-right: 1px solid rgba(255,255,255,0.02) !important;
                }
            `}} />
        </div>
    );
};

export default ProblemDetail;
