import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import {
  Menu,
  Moon,
  Sun,
  LayoutDashboard,
  Pencil,
  BarChart3,
  History,
  Trophy,
  Target,
  Settings,
  CheckCircle2,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LevelStatsModal from '../Modals/LevelStatsModal';
import ProfileModal from '../Modals/ProfileModal';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { setAppLoading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLevelModalOpen, setLevelModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const getModuleInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return { name: 'Dashboard', icon: LayoutDashboard };
    if (path.startsWith('/practice-tests')) return { name: 'Practice Tests', icon: Pencil };
    if (path.startsWith('/performance')) return { name: 'Performance', icon: BarChart3 };
    if (path.startsWith('/history')) return { name: 'History', icon: History };
    if (path.startsWith('/leaderboard')) return { name: 'Leaderboard', icon: Trophy };
    if (path.startsWith('/goals')) return { name: 'Goals', icon: Target };
    if (path.startsWith('/settings')) return { name: 'Settings', icon: Settings };
    if (path.startsWith('/result')) return { name: 'Results', icon: CheckCircle2 };
    return { name: 'Lexiqo', icon: LayoutDashboard };
  };

  const module = getModuleInfo();
  const ModuleIcon = module.icon;

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden font-sans transition-colors duration-500">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header - Refined Premium SaaS Style */}
        <header className="h-[60px] flex items-center justify-between px-5 md:px-8 bg-bg-card/40 backdrop-blur-xl border-b border-border-subtle sticky top-0 z-[990] shrink-0 transition-all duration-300">
          <div className="flex items-center gap-5">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface text-text-sub hover:text-text-main hover:bg-surface-hover transition-all duration-300 shadow-sm"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center py-2 border-l border-border-subtle pl-0">
              <span className="text-lg font-semibold text-text-main tracking-tight">{module.name}</span>
            </div>
          </div>

          {/* Performance Hub: Unified Control Center */}
          <div className="flex items-center gap-2 pl-6 pr-3 py-2 rounded-full bg-surface/30 backdrop-blur-2xl border border-white/10 shadow-elevated group/all transition-all duration-300 hover:bg-surface/40 hover:translate-y-[-1px]">
            
            {/* 🎯 XP Tracker Section - Clickable for Modal */}
            <div 
              onClick={() => setLevelModalOpen(true)}
              className="hidden lg:flex flex-col gap-1.5 w-[150px] pr-8 border-r border-border-main cursor-pointer group/xp hover:opacity-80 transition-all"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">LVL {user?.level || 1}</span>
                <span className="text-[10px] font-bold text-text-sub">{(user?.totalXP || 0) % 500} / 500</span>
              </div>
              <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                  style={{ width: `${((user?.totalXP || 0) % 500) / 500 * 100}%` }}
                />
              </div>
            </div>


            {/* 👤 Workspace Profile */}
            <div 
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-4 pl-4 pr-5 py-1 rounded-full cursor-pointer group/profile hover:bg-surface/20 transition-all rounded-xl"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-primary/20 transition-transform group-hover/profile:scale-110 overflow-hidden">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[13px] font-bold tracking-wide text-text-main uppercase leading-tight group-hover/profile:text-primary transition-colors">{user?.name || 'Authorized Learner'}</span>
                <span className="text-[9px] font-bold text-text-sub uppercase tracking-widest leading-none mt-1">Workspace</span>
              </div>
            </div>

            {/* 🌓 Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 rounded-full flex items-center justify-center text-text-sub hover:text-primary transition-all duration-300"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-bg-page px-5 md:px-8 py-8 transition-colors duration-500 premium-bg font-sans">
          <div className="min-h-full w-full max-w-[1200px] mx-auto animate-fade-in transition-opacity duration-500">
            {children}
          </div>
        </main>
      </div>

      <LevelStatsModal 
        isOpen={isLevelModalOpen} 
        onClose={() => setLevelModalOpen(false)} 
        user={user}
      />
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
