import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    Search,
    Filter,
    ChevronRight,
    CheckCircle2,
    Circle,
    Clock,
    LayoutGrid,
    List,
    Target,
    Trophy
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ProblemList = () => {
    const navigate = useNavigate();
    const { setAppLoading } = useAuth();
    const [problems, setProblems] = useState([]);
    const [activeDifficulty, setActiveDifficulty] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchProblems();
        fetchStats();
    }, []);

    const fetchProblems = async () => {
        setAppLoading(true);
        try {
            const res = await api.get('/coding/problems');
            setProblems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setAppLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/coding/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredProblems = problems.filter(prob => {
        const matchesDifficulty = activeDifficulty === 'All' || prob.difficulty.toLowerCase() === activeDifficulty.toLowerCase();
        const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prob.tags.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesDifficulty && matchesSearch;
    });

    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    const getDifficultyColor = (diff) => {
        switch (diff.toUpperCase()) {
            case 'EASY': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'HARD': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-text-sub bg-surface border-border-subtle';
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Stats Section */}
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Code2 className="text-primary" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-text-main mb-0 tracking-tight">Coding Practice</h1>
                    </div>
                    <p className="text-text-sub max-w-2xl font-normal leading-relaxed text-sm md:text-base">
                        Master the most frequent coding interview questions from top-tier product companies.
                        Build your professional portfolio through consistent technical excellence.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 xl:w-auto shrink-0">
                    {[
                        { label: 'Solved', value: stats?.totalSolved || 0, icon: CheckCircle2, color: 'text-emerald-400' },
                        { label: 'Accuracy', value: `${Math.round(stats?.accuracy || 0)}%`, icon: Target, color: 'text-primary' },
                        { label: 'Points', value: (stats?.totalSolved || 0) * 50, icon: Trophy, color: 'text-amber-400' },
                        { label: 'Streak', value: '3d', icon: Clock, color: 'text-rose-400' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card !p-4 flex flex-col items-center justify-center text-center space-y-1 min-w-[100px] sm:min-w-[120px]">
                            <stat.icon className={`${stat.color} mb-1`} size={18} />
                            <span className="text-xl font-bold text-text-main tracking-tight">{stat.value}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-sub">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 p-1 bg-surface border border-border-subtle rounded-xl w-full lg:w-fit overflow-x-auto no-scrollbar">
                    {difficulties.map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setActiveDifficulty(diff)}
                            className={`
                px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0
                ${activeDifficulty === diff
                                    ? 'bg-primary text-white shadow-main shadow-primary/20'
                                    : 'text-text-sub hover:text-text-main hover:bg-white/5'}
              `}
                        >
                            {diff}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full lg:w-auto items-center">
                    <div className="relative group flex-1 lg:w-[320px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={16} />
                        <input
                            type="text"
                            placeholder="Search problems or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-card border border-border-subtle hover:border-border-main focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-11 pr-4 py-2.5 text-[13px] transition-all outline-none text-text-main placeholder:text-text-muted"
                        />
                    </div>

                    <div className="flex gap-1 p-1 bg-surface border border-border-subtle rounded-xl shrink-0">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-bg-card text-primary shadow-sm' : 'text-text-sub hover:text-text-main'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-bg-card text-primary shadow-sm' : 'text-text-sub hover:text-text-main'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Problems Repository */}
            <AnimatePresence mode='popLayout'>
                {viewMode === 'grid' ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredProblems.map((prob) => (
                            <motion.div
                                layout
                                key={prob.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => navigate(`/coding-practice/${prob.slug}`)}
                                className="glass-card group relative flex flex-col h-full border border-border-subtle hover:border-primary/40 hover:shadow-primary/5 transition-all duration-500 cursor-pointer overflow-hidden"
                            >
                                {/* Visual Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${getDifficultyColor(prob.difficulty)}`}>
                                        {prob.difficulty}
                                    </div>
                                    {prob.isSolved ? (
                                        <div className="flex items-center gap-1.5 text-emerald-400">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Solved</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <Circle size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Unsolved</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 relative z-10">
                                    <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors leading-tight tracking-tight">
                                        {prob.title}
                                    </h3>
                                    <p className="text-text-sub text-[13px] leading-relaxed line-clamp-2 font-normal">
                                        {prob.shortDescription || 'Master this fundamental challenge to enhance your technical interview performance.'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {prob.tags?.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 rounded-full bg-surface/50 border border-border-subtle text-[10px] text-text-sub font-medium">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 pt-5 border-t border-border-subtle flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-sub transition-colors">
                                        <Clock size={14} />
                                        <span className="text-[11px] font-bold">{prob.estimatedMinutes} Mins</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all font-bold">
                                        <span className="text-[10px] uppercase tracking-widest">Solve Now</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div layout className="glass-card !p-0 overflow-hidden border border-border-subtle">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-subtle bg-surface/50">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Difficulty</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Topic</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProblems.map((prob) => (
                                    <tr
                                        key={prob.id}
                                        onClick={() => navigate(`/coding-practice/${prob.slug}`)}
                                        className="border-b border-border-subtle/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            {prob.isSolved ? (
                                                <CheckCircle2 className="text-emerald-400" size={18} />
                                            ) : (
                                                <Circle className="text-text-muted" size={18} />
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                                                {prob.title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold uppercase ${getDifficultyColor(prob.difficulty).split(' ')[0]}`}>
                                                {prob.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {prob.tags?.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} className="text-[10px] text-text-sub bg-surface px-2 py-0.5 rounded border border-border-subtle font-medium">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all inline-block" size={18} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredProblems.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-surface border-2 border-dashed border-border-main flex items-center justify-center text-text-muted animate-pulse">
                        <Search size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-text-main">No challenges found</h3>
                        <p className="text-text-sub font-normal max-w-sm mx-auto">None of our current coding repositories match your search parameters. Try specialized filters.</p>
                    </div>
                    <button
                        onClick={() => { setActiveDifficulty('All'); setSearchQuery(''); }}
                        className="px-8 py-3 bg-white/5 border border-border-subtle hover:border-primary text-text-main rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary/10"
                    >
                        Intelligence Reset
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProblemList;
