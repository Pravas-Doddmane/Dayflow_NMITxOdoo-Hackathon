import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  PartyPopper,
  FileText,
  Upload,
  User,
  Info,
  CalendarDays,
  Flame,
  Briefcase,
  AlertCircle,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate, calculateDays } from '../../utils/formatters';

// List of Standard Public Holidays for 2026
const PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-14', name: 'Makar Sankranti / Kite Festival' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'Maha Shivaratri / Dhulandi' },
  { date: '2026-03-25', name: 'Holi Festival' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti' },
  { date: '2026-05-01', name: 'May Day / Labour Day' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-08-28', name: 'Raksha Bandhan' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra (Vijayadashami)' },
  { date: '2026-11-08', name: 'Diwali (Deepavali)' },
  { date: '2026-11-10', name: 'Govardhan Puja / New Year' },
  { date: '2026-11-11', name: 'Bhai Dooj' },
  { date: '2026-12-25', name: 'Christmas Day' },
];

export const CalendarPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentDate, setCurrentDate] = useState(new Date(2026, new Date().getMonth(), 1));
  const [viewMode, setViewMode] = useState('MONTH'); // 'MONTH' or 'YEAR'
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected Day Details Modal / Drawer
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  // Apply Leave Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    leaveType: 'PAID',
    startDate: todayStr,
    endDate: todayStr,
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  // Load Attendance and Leave Records
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attRes, leaveRes] = await Promise.all([
        attendanceApi.getMyAttendance({ page: 0, size: 400 }),
        leaveApi.getMyLeaves(),
      ]);

      setAttendanceRecords(attRes.content || (Array.isArray(attRes) ? attRes : []));
      setLeaves(Array.isArray(leaveRes) ? leaveRes : leaveRes.content || []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
      toast.error('Failed to load your attendance and leave history.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const nextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check information for a specific date (YYYY-MM-DD)
  const getDateStatus = (dateStr) => {
    // 1. Check if public holiday
    const holiday = PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr);
    if (holiday) {
      return { type: 'HOLIDAY', holiday };
    }

    // 2. Check if leave covers this date
    const leave = leaves.find((l) => {
      const start = l.startDate;
      const end = l.endDate;
      return dateStr >= start && dateStr <= end;
    });

    if (leave) {
      if (leave.status === 'APPROVED') {
        return { type: 'LEAVE_APPROVED', leave };
      }
      if (leave.status === 'PENDING') {
        return { type: 'LEAVE_PENDING', leave };
      }
      if (leave.status === 'REJECTED') {
        return { type: 'LEAVE_REJECTED', leave };
      }
    }

    // 3. Check attendance record
    const att = attendanceRecords.find((a) => {
      const aDate = a.date || (a.checkInTime ? a.checkInTime.split('T')[0] : null);
      return aDate === dateStr;
    });

    if (att) {
      if (att.status === 'PRESENT' || att.checkInTime) {
        return { type: 'ATTENDED', attendance: att };
      }
      if (att.status === 'ABSENT') {
        return { type: 'ABSENT', attendance: att };
      }
      if (att.status === 'HALF_DAY') {
        return { type: 'HALF_DAY', attendance: att };
      }
    }

    // 4. Weekend check
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { type: 'WEEKEND' };
    }

    // 5. If past date without attendance or leave -> Absent / Not recorded
    const nowStr = new Date().toISOString().split('T')[0];
    if (dateStr < nowStr) {
      return { type: 'UNRECORDED' };
    }

    return { type: 'UPCOMING' };
  };

  // Leave Balances Calculation
  const approvedPaidLeaves = leaves
    .filter((l) => l.leaveType === 'PAID' && l.status === 'APPROVED')
    .reduce((sum, l) => sum + (calculateDays(l.startDate, l.endDate) || 1), 0);

  const approvedSickLeaves = leaves
    .filter((l) => l.leaveType === 'SICK' && l.status === 'APPROVED')
    .reduce((sum, l) => sum + (calculateDays(l.startDate, l.endDate) || 1), 0);

  const paidAvailable = Math.max(0, 24 - approvedPaidLeaves);
  const sickAvailable = Math.max(0, 7 - approvedSickLeaves);

  const totalAttendedDays = attendanceRecords.filter(
    (a) => a.status === 'PRESENT' || a.checkInTime
  ).length;

  // Handle Leave Submission
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (form.startDate > form.endDate) {
      toast.error('End Date cannot precede Start Date.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveApi.applyForLeave({
        ...form,
        documentUrl: attachedFile,
      });
      toast.success('Time off request submitted successfully!');
      setIsApplyModalOpen(false);
      setForm({
        leaveType: 'PAID',
        startDate: todayStr,
        endDate: todayStr,
        remarks: '',
      });
      setAttachedFile(null);
      fetchData();
    } catch (err) {
      console.error('Apply leave error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Certificate Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile(reader.result);
      toast.success(`Attached certificate: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Month Grid Calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Time Off & Attendance Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track attended work shifts, approved leaves, public holidays, and request time off.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'MONTH'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Month View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('YEAR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'YEAR'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              Year 2026 Overview
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Paid Time Off */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Paid Time Off</span>
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {paidAvailable < 10 ? `0${paidAvailable}` : paidAvailable}{' '}
            <span className="text-[11px] font-normal text-slate-500">Days Left</span>
          </div>
          <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">
            Annual Quota: 24 Paid Days
          </p>
        </div>

        {/* Sick Time Off */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-purple-50/80 to-pink-50/40 dark:from-purple-950/40 dark:to-slate-900 border border-purple-100 dark:border-purple-900/40 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sick Time Off</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {sickAvailable < 10 ? `0${sickAvailable}` : sickAvailable}{' '}
            <span className="text-[11px] font-normal text-slate-500">Days Left</span>
          </div>
          <p className="text-[10px] text-purple-600/80 dark:text-purple-400/80">
            Medical certificate required
          </p>
        </div>

        {/* Attended Working Days */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Attended Days</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalAttendedDays < 10 ? `0${totalAttendedDays}` : totalAttendedDays}{' '}
            <span className="text-[11px] font-normal text-slate-500">Total Shifts</span>
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
            Present & Checked In
          </p>
        </div>

        {/* Public Holidays */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/40 dark:to-slate-900 border border-amber-100 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Public Holidays</span>
            <PartyPopper className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {PUBLIC_HOLIDAYS_2026.length}{' '}
            <span className="text-[11px] font-normal text-slate-500">Official Holidays</span>
          </div>
          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">
            Paid non-working days
          </p>
        </div>
      </div>

      {/* Main Calendar View: MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Calendar Main Card (3 Cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Month Navigation Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {monthNames[month]} {year}
                </h2>
                <button
                  type="button"
                  onClick={goToToday}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="text-rose-500">Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div className="text-indigo-500">Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Prev Month Days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => {
                const dayNum = daysInPrevMonth - firstDayIndex + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    className="min-h-[48px] sm:min-h-[58px] p-1.5 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800/30 opacity-25 text-slate-400 text-[10px]"
                  >
                    <span className="font-semibold">{dayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const mStr = String(month + 1).padStart(2, '0');
                const dStr = String(dayNum).padStart(2, '0');
                const fullDateStr = `${year}-${mStr}-${dStr}`;
                const isToday = fullDateStr === todayStr;

                const statusInfo = getDateStatus(fullDateStr);

                let bgClass = 'bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700';
                let tagBadge = null;

                if (statusInfo.type === 'HOLIDAY') {
                  bgClass = 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60';
                  tagBadge = (
                    <div className="mt-0.5 px-1 py-0.2 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[9px] font-bold truncate">
                      🎉 {statusInfo.holiday.name}
                    </div>
                  );
                } else if (statusInfo.type === 'LEAVE_APPROVED') {
                  bgClass = 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60';
                  tagBadge = (
                    <div className="mt-0.5 px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[9px] font-bold truncate">
                      🌴 {statusInfo.leave.leaveType}
                    </div>
                  );
                } else if (statusInfo.type === 'LEAVE_PENDING') {
                  bgClass = 'bg-amber-50/80 dark:bg-amber-950/40 border-dashed border-amber-300 dark:border-amber-700/60';
                  tagBadge = (
                    <div className="mt-0.5 px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold truncate">
                      ⏳ Pending
                    </div>
                  );
                } else if (statusInfo.type === 'ATTENDED') {
                  bgClass = 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/40';
                  tagBadge = (
                    <div className="mt-0.5 px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-semibold truncate flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      <span>Present</span>
                    </div>
                  );
                } else if (statusInfo.type === 'WEEKEND') {
                  bgClass = 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50 text-slate-400';
                }

                return (
                  <div
                    key={fullDateStr}
                    onClick={() =>
                      setSelectedDateDetails({ date: fullDateStr, ...statusInfo })
                    }
                    className={`min-h-[48px] sm:min-h-[58px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${bgClass} ${isToday ? 'ring-2 ring-indigo-600 shadow-sm' : 'shadow-2xs'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold ${isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center -ml-0.5 text-[10px]'
                          : 'text-slate-700 dark:text-slate-200'
                          }`}
                      >
                        {dayNum}
                      </span>

                      {statusInfo.type === 'ATTENDED' && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      )}
                      {statusInfo.type === 'HOLIDAY' && (
                        <PartyPopper className="w-3 h-3 text-teal-500" />
                      )}
                    </div>

                    <div>{tagBadge}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Legend & Public Holidays List (1 Col) */}
          <div className="space-y-4">
            {/* Color Legend Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Calendar Legend</span>
              </h3>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Attended / Checked-In
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Approved Leave (Validated)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-400 border border-dashed border-amber-600 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    To Approve (Pending)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-teal-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Official Public Holiday
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-rose-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Refused / Absent
                  </span>
                </div>
              </div>
            </div>

            {/* Public Holidays 2026 List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PartyPopper className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Public Holidays 2026</span>
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 text-[9px] font-bold">
                  {PUBLIC_HOLIDAYS_2026.length} Days
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {PUBLIC_HOLIDAYS_2026.map((h, i) => (
                  <div key={i} className="pt-2 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {h.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(h.date)}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold shrink-0">
                      Paid Off
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12-MONTH YEAR OVERVIEW VIEW (Matches User Sketch) */}
      {viewMode === 'YEAR' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Year 2026 Calendar Schedule
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hover or click any month to open full view</span>
            </div>
          </div>

          {/* 12-Month Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {monthNames.map((mName, mIdx) => {
              const fDay = new Date(year, mIdx, 1).getDay();
              const numDays = new Date(year, mIdx + 1, 0).getDate();

              return (
                <div
                  key={mName}
                  onClick={() => {
                    setCurrentDate(new Date(year, mIdx, 1));
                    setViewMode('MONTH');
                  }}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white">
                    <span>{mName} 2026</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Open →
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-rose-500">S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span className="text-indigo-500">S</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                    {Array.from({ length: fDay }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: numDays }).map((_, i) => {
                      const dNumber = i + 1;
                      const dateString = `2026-${String(mIdx + 1).padStart(2, '0')}-${String(
                        dNumber
                      ).padStart(2, '0')}`;
                      const status = getDateStatus(dateString);

                      let dotClass = 'text-slate-700 dark:text-slate-300';
                      if (status.type === 'HOLIDAY') {
                        dotClass = 'bg-teal-500 text-white font-bold rounded-full';
                      } else if (status.type === 'LEAVE_APPROVED') {
                        dotClass = 'bg-purple-600 text-white font-bold rounded-full';
                      } else if (status.type === 'LEAVE_PENDING') {
                        dotClass = 'bg-amber-400 text-slate-900 font-bold rounded-full';
                      } else if (status.type === 'ATTENDED') {
                        dotClass = 'bg-emerald-500 text-white font-bold rounded-full';
                      }

                      return (
                        <span
                          key={dateString}
                          className={`w-5 h-5 flex items-center justify-center mx-auto text-[10px] ${dotClass}`}
                        >
                          {dNumber}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECTED DATE DETAILS MODAL */}
      <Modal
        isOpen={!!selectedDateDetails}
        onClose={() => setSelectedDateDetails(null)}
        title={`Date Details: ${selectedDateDetails ? formatDate(selectedDateDetails.date) : ''}`}
        maxWidth="max-w-md"
      >
        {selectedDateDetails && (
          <div className="space-y-4 text-xs">
            {selectedDateDetails.type === 'HOLIDAY' && (
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 space-y-2">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
                  <PartyPopper className="w-5 h-5" />
                  <span>{selectedDateDetails.holiday.name}</span>
                </div>
                <p className="text-teal-600 dark:text-teal-400 text-xs">
                  Official Public Holiday. No work attendance required.
                </p>
              </div>
            )}

            {selectedDateDetails.type === 'ATTENDED' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Work Shift Attended (Present)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Check-In Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedDateDetails.attendance.checkInTime
                        ? new Date(selectedDateDetails.attendance.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Check-Out Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedDateDetails.attendance.checkOutTime
                        ? new Date(selectedDateDetails.attendance.checkOutTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'Active Shift'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {(selectedDateDetails.type === 'LEAVE_APPROVED' ||
              selectedDateDetails.type === 'LEAVE_PENDING' ||
              selectedDateDetails.type === 'LEAVE_REJECTED') && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                      {selectedDateDetails.leave.leaveType} Leave Request
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {selectedDateDetails.leave.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="text-slate-400">Duration: </span>
                      <span className="font-semibold">
                        {formatDate(selectedDateDetails.leave.startDate)} to{' '}
                        {formatDate(selectedDateDetails.leave.endDate)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-400">Reason: </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedDateDetails.leave.remarks || 'No remarks provided.'}
                      </span>
                    </p>
                    {selectedDateDetails.leave.adminFeedback && (
                      <p className="pt-1 text-indigo-600 dark:text-indigo-400">
                        <span className="font-bold">Admin Feedback: </span>
                        {selectedDateDetails.leave.adminFeedback}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {selectedDateDetails.type === 'WEEKEND' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <p className="font-bold text-slate-700 dark:text-slate-300">Weekend / Off Day</p>
                <p className="text-[11px] text-slate-400 mt-1">Standard non-working weekly rest day.</p>
              </div>
            )}

            {selectedDateDetails.type === 'UNRECORDED' && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-center">
                <p className="font-bold text-rose-700 dark:text-rose-300">No Attendance Logged (Absent)</p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                  You did not log a check-in shift or request time off for this day.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDateDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* TIME OFF REQUEST POPUP MODAL (Matches Drawing) */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Time off Type Request"
        subtitle="Submit a formal leave or time-off allocation to your company HR."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          {/* Employee Identifier */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Employee:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user?.fullName || user?.firstName || 'Current Employee'}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
              {user?.employeeCode || 'ACTIVE'}
            </span>
          </div>

          {/* Time Off Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time off Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'PAID', label: 'Paid Time Off', desc: 'Vacation' },
                { id: 'SICK', label: 'Sick Leave', desc: 'Medical' },
                { id: 'CASUAL', label: 'Casual Leave', desc: 'Personal' },
                { id: 'UNPAID', label: 'Unpaid Leaves', desc: 'Loss of Pay' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, leaveType: t.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${form.leaveType === t.id
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white block">{t.label}</span>
                  <span className="text-[10px] text-slate-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Validity Start Date *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Validity End Date *
              </label>
              <input
                type="date"
                required
                min={form.startDate || todayStr}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Allocation Counter */}
          <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">
              Total Requested Allocation:
            </span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
              {calculateDays(form.startDate, form.endDate) < 10
                ? `0${calculateDays(form.startDate, form.endDate)}`
                : calculateDays(form.startDate, form.endDate)}{' '}
              Days
            </span>
          </div>

          {/* Attachment (For Medical / Sick Leave) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attachment: (For sick leave medical certificate)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {attachedFile ? 'File Attached (Click to change)' : 'Upload Medical Certificate / Document'}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, or PDF up to 5MB</span>
              </div>
            </div>
          </div>

          {/* Remarks / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Remarks *
            </label>
            <textarea
              required
              rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="State the purpose of this time-off request..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
