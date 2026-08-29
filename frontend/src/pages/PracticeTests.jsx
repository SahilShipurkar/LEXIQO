import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Code, 
  Database, 
  Languages, 
  Brain, 
  Clock, 
  Target, 
  ChevronRight, 
  Search,
  Lock,
  Zap,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PracticeTests = () => {
  const navigate = useNavigate();
  const { setAppLoading } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbTests, setDbTests] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    'Logical Reasoning': Brain,
    'Quantitative Aptitude': Calculator,
    'Core Programming': Code,
    'Data Intelligence': Database,
    'Verbal Proficiency': Languages,
    'System Design': Zap,
    'DSA Fundamentals': Code,
    'Quant Basics': Calculator,
    'Logical Reasoning Pro': Brain,
    'Verbal Excellence': MessageSquare,
    'DI Mastery': TrendingUp
  };

  const colorMap = {
    'Logical Reasoning': '#6366F1',
    'Quantitative Aptitude': '#EC4899',
    'Core Programming': '#06B6D4',
    'Data Intelligence': '#10B981',
    'Verbal Proficiency': '#F59E0B',
    'System Design': '#8B5CF6',
    'DSA Fundamentals': '#8B5CF6',
    'Quant Basics': '#EC4899',
    'Logical Reasoning Pro': '#6366F1',
    'Verbal Excellence': '#F59E0B',
    'DI Mastery': '#10B981'
  };

  React.useEffect(() => {
    const init = async () => {
      setAppLoading(true);
      try {
          await fetchTests();
      } finally {
          setAppLoading(false);
      }
    };
    init();
  }, [setAppLoading]);

  const fetchTests = async () => {
    try {
      const [testsRes, catsRes] = await Promise.all([
        api.get('/tests'),
        api.get('/tests/categories')
      ]);
      
      const merged = testsRes.data.map(t => ({
        ...t,
        icon: iconMap[t.title] || Brain,
        color: colorMap[t.title] || '#6366F1',
        tag: t.category?.name || 'Logic',
        description: t.description || t.category?.description || 'Professional assessment module optimized for neural validation.',
        questions: 15,
        duration: '20m',
        mastery: 0,
        difficulty: t.difficulty || 'Intermediate'
      }));
      
      setDbTests(merged);
      setDbCategories(catsRes.data);
    } catch (err) {
      console.error("Fetch tests failed", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = dbTests.filter(cat => {
    const matchesFilter = activeFilter === 'All' || cat.category?.name === activeFilter || cat.tag === activeFilter;
    const matchesSearch = (cat.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                         (cat.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-text-main mb-0 leading-tight">Practice Tests</h1>
          <p className="text-text-sub max-w-lg font-normal">Choose a specialized logic terminal to begin your performance assessment.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-md w-full md:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={16} />
          <input 
            type="text" 
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle hover:border-border-main focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl pl-11 pr-4 py-2.5 text-[13px] transition-all outline-none text-text-main placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface border border-border-subtle rounded-xl w-fit">
        {['All', ...dbCategories.map(c => c.name)].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`
              px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300
              ${activeFilter === filter 
                ? 'bg-primary text-white shadow-main' 
                : 'text-text-sub hover:text-text-main hover:bg-white/5'}
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Category Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {filteredCategories.map((category) => (
            <motion.div
              layout
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => !category.locked && navigate(`/test/${category.id}`, { state: { source: 'practice-tests' } })}
              className={`
                glass-card ring-1 ring-border-subtle hover:border-primary/30 active:scale-[0.98] transition-all duration-300 cursor-pointer group flex flex-col h-full
                ${category.locked ? 'grayscale opacity-70 cursor-not-allowed border-dashed' : ''}
              `}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-5">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${category.color}15`, color: category.color }}
                >
                  <category.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[10px] font-bold uppercase tracking-widest text-text-sub">
                    {category.tag}
                  </span>
                  {category.locked && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-error">
                      <Lock size={10} /> Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-text-main group-hover:text-primary transition-colors leading-tight">
                  {category.title}
                </h3>
                <p className="text-text-sub text-[13px] leading-relaxed line-clamp-2 font-normal">
                  {category.description}
                </p>
              </div>



              {/* Meta Data & Footer */}
              <div className="mt-6 pt-5 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-sub transition-colors">
                    <Clock size={14} />
                    <span className="text-[11px] font-bold">{category.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-sub transition-colors">
                    <Target size={14} />
                    <span className="text-[11px] font-bold">{category.questions} Qs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">
                    {category.locked ? 'Unlock' : (category.mastery > 0 ? 'Continue' : 'Start Terminal')}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface border border-dashed border-border-main flex items-center justify-center text-text-muted mb-2">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-main">No categories found</h3>
          <p className="text-text-sub font-normal">Adjust your decryption filters to find available test terminals.</p>
          <button 
            onClick={() => {setActiveFilter('All'); setSearchQuery('');}}
            className="btn btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PracticeTests;
