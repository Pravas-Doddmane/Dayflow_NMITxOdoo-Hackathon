import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
