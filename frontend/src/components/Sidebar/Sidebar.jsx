import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pencil,
  BarChart3,
  History,
  Trophy,
  Target,
  Settings,
  LogOut,
  Moon,
  Sun,
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logoWhite from '../../assets/dragon-icon.png';
import logoBlack from '../../assets/main_logo_black-removebg.png';

const Sidebar = ({ isOpen, setSidebarOpen, isCollapsed, setSidebarCollapsed }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Practice Tests', icon: Pencil, path: '/practice-tests' },
    { name: 'Coding Practice', icon: Code2, path: '/coding-practice' },
    { name: 'Performance', icon: BarChart3, path: '/performance' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to terminate the current session?")) {
      try {
        await logout();
        navigate('/', { replace: true });
      } catch (error) {
        console.error("Logout failed", error);
        navigate('/', { replace: true });
      }
    }
  };

  const sidebarWidth = isCollapsed && !isMobile ? 'w-[70px]' : 'w-[240px]';
  const mobileTranslate = isOpen ? 'translate-x-0' : 'translate-x-[-100%]';

  return (
    <>
      {/* Dark Backdrop for Mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed md:static left-0 top-0 h-screen bg-bg-card/80 backdrop-blur-2xl border-r border-border-subtle flex flex-col z-[1000] transition-all duration-300 ease-in-out shadow-elevated ${isMobile ? mobileTranslate + ' w-[240px]' : sidebarWidth}`}>
        {/* Brand Identity */}
        <div
          className="h-[60px] flex items-center px-5 gap-3 cursor-pointer overflow-hidden shrink-0 border-b border-border-subtle"
          onClick={() => isMobile ? setSidebarOpen(false) : setSidebarCollapsed(!isCollapsed)}
        >
          <img
            src={theme === 'dark' ? logoWhite : logoBlack}
            alt="LEXIQO"
            className="w-7 h-7 object-contain shrink-0 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          />
          <span className={`text-lg font-bold tracking-[0.2em] transition-opacity duration-200 text-text-main ${(isCollapsed && !isMobile) ? 'opacity-0' : 'opacity-100'}`}>
            LEXIQO
          </span>
        </div>

        {/* Navigation Vector */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-1 font-sans">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
        flex items-center gap-3.5 px-3 py-2.5 mx-2 my-0.5 rounded-lg transition-all duration-300 group relative
        ${isActive || location.pathname.startsWith(item.path)
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : 'text-text-sub hover:bg-surface hover:text-text-main'}
       `}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  {!isCollapsed || isMobile ? (
                    <span className="text-[12px] font-semibold tracking-wide uppercase transition-all duration-200">
                      {item.name}
                    </span>
                  ) : null}

                  {/* Tooltip for collapsed state */}
                  {(isCollapsed && !isMobile) && (
                    <div className="absolute left-[70px] bg-bg-card border border-border-main text-text-main px-3 py-2 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap shadow-elevated translate-x-[-10px] group-hover:translate-x-0 capitalize">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Controls */}
        <div className="p-3 shrink-0 space-y-1.5 border-t border-border-subtle">
          <div
            className="flex items-center gap-3.5 px-3 py-2.5 mx-2 rounded-lg text-text-sub hover:bg-error/10 hover:text-error transition-all duration-300 cursor-pointer group relative"
            onClick={handleLogout}
          >

            <LogOut size={18} className="shrink-0" />
            {!isCollapsed || isMobile ? (
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Terminate
              </span>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
