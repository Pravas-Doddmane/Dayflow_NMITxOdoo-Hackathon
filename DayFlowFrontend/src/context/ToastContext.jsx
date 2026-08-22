import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => {
          let bg = 'bg-slate-900 text-white border-slate-700';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (item.type === 'success') {
            bg = 'bg-emerald-900/90 text-emerald-50 border-emerald-700/60';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />;
          } else if (item.type === 'error') {
            bg = 'bg-rose-900/90 text-rose-50 border-rose-700/60';
            icon = <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />;
          } else if (item.type === 'warning') {
            bg = 'bg-amber-900/90 text-amber-50 border-amber-700/60';
            icon = <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${bg}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-5">{item.message}</div>
              <button
                onClick={() => removeToast(item.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
