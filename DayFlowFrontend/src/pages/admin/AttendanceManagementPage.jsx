import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime, getInitials } from '../../utils/formatters';

export const AttendanceManagementPage = () => {
  const [records, setRecords] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');

  const toast = useToast();

  const fetchAttendance = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 15,
          sort: 'attendanceDate,desc',
          ...(fromDate && { from: fromDate }),
          ...(toDate && { to: toDate }),
          ...(employeeIdFilter && { employeeId: employeeIdFilter }),
        };

        const res = await attendanceApi.getAllAttendance(params);
        setRecords(res.content || []);
        setPageData(res);
        setCurrentPage(page);
      } catch (err) {
        console.error('Failed to load attendance logs:', err);
        toast.error('Failed to load company attendance records.');
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate, employeeIdFilter] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    fetchAttendance(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAttendance(0);
  };

  const handleResetFilters = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    setFromDate(d.toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setEmployeeIdFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Attendance Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Company-wide attendance history, daily check-in times, and working hours.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAttendance(currentPage)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Date & Filter Card */}
      <form
        onSubmit={handleFilterSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm items-end"
      >
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            From Date
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
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Employee ID (Optional)
          </label>
          <input
            type="number"
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            placeholder="e.g. 5"
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-xl hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading attendance data...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No attendance records found"
              description="No logs were found for the selected date range and filter criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Employee</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Check-In</th>
                  <th className="py-3.5 px-4 font-semibold">Check-Out</th>
                  <th className="py-3.5 px-4 font-semibold">Working Hours</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {records.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center">
                          {getInitials(att.employeeName || att.employeeCode)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {att.employeeName || 'Staff Member'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {att.employeeCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(att.attendanceDate)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatTime(att.checkIn)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {formatTime(att.checkOut)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
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

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination pageData={pageData} onPageChange={fetchAttendance} />
        </div>
      </div>
    </div>
  );
};
