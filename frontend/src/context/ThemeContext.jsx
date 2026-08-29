import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  // DOM manipulator (purely visual)
  const syncThemeDOM = (themeName) => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', themeName);
    
    if (themeName === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  const setAndApplyTheme = (themeName) => {
    setTheme(themeName);
    localStorage.setItem('theme', themeName);
    syncThemeDOM(themeName);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setAndApplyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: setAndApplyTheme, 
      toggleTheme, 
      applyTheme: syncThemeDOM 
    }}>
      {children}
    </ThemeContext.Provider>
  );

};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
