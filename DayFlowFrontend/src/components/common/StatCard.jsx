import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
}) => {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-500/5',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    sky: {
      bg: 'from-sky-500/10 to-sky-500/5',
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
      border: 'hover:border-sky-300 dark:hover:border-sky-700',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-500/5',
      iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
      border: 'hover:border-violet-300 dark:hover:border-violet-700',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${scheme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold mt-2 text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(trend !== undefined || trendLabel) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs">
          {trend !== undefined && (
            <span
              className={`font-semibold ${
                trend >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {trendLabel && (
            <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
