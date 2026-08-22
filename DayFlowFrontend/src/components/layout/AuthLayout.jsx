import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors relative">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="px-6 py-4 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Zap className="w-5 h-5 fill-white/20" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            Day<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </header>

      {/* Centered Auth Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} DayFlow HRMS • Smart Multi-Company Workforce Suite
      </footer>
    </div>
  );
};
