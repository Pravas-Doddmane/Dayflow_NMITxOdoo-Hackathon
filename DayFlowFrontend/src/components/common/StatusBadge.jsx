import React from 'react';

export const StatusBadge = ({ status, type = 'general' }) => {
  if (!status) return null;

  let bg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let dotColor = 'bg-slate-400';

  const s = String(status).toUpperCase();

  // Active / Present / Approved
  if (['ACTIVE', 'PRESENT', 'APPROVED', 'VERIFIED'].includes(s)) {
    bg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    dotColor = 'bg-emerald-500';
  }
  // Pending / Invited / Half Day
  else if (['PENDING', 'INVITED', 'HALF_DAY'].includes(s)) {
    bg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    dotColor = 'bg-amber-500';
  }
  // Rejected / Disabled / Absent / Terminated
  else if (['REJECTED', 'DISABLED', 'ABSENT', 'TERMINATED'].includes(s)) {
    bg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    dotColor = 'bg-rose-500';
  }
  // Leave / On Leave
  else if (['LEAVE', 'ON_LEAVE'].includes(s)) {
    bg = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
    dotColor = 'bg-indigo-500';
  }

  const label = s.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      {label}
    </span>
  );
};
