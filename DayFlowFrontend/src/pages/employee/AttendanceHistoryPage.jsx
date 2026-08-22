import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/formatters';

export const AttendanceHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters (default to current month)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const toast = useToast();

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      };
      const res = await attendanceApi.getMyAttendance(params);
      setRecords(Array.isArray(res) ? res : res.content || []);
    } catch (err) {
      console.error('Failed to load my attendance:', err);
      toast.error('Failed to fetch personal attendance history.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchAttendance();
  };

  // Calculations
  const totalShifts = records.length;
  const totalHours = records.reduce(
    (acc, cur) => acc + (cur.workingHours ? Number(cur.workingHours) : 0),
    0
  );
  const avgHours = totalShifts > 0 ? (totalHours / totalShifts).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Attendance History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your daily clock-in records, departure times, and total work hours.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAttendance}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Shifts</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalShifts} Days
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Hours Logged</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalHours.toFixed(1)} hrs
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Avg Hours / Shift</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {avgHours} hrs/day
            </h3>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm items-end"
      >
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          Filter Range
        </button>
      </form>

      {/* Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading your attendance records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No records found"
              description="No attendance logs found for the selected date range."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Check-In</th>
                  <th className="py-3.5 px-4 font-semibold">Check-Out</th>
                  <th className="py-3.5 px-4 font-semibold">Working Hours</th>
                  <th className="py-3.5 px-4 font-semibold">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {records.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {formatDate(att.attendanceDate)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatTime(att.checkIn)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatTime(att.checkOut)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {att.workingHours ? `${att.workingHours} hrs` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={att.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
