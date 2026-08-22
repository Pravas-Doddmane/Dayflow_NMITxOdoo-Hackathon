import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  User,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { employeeApi } from '../../api/employeeApi';
import { salaryApi } from '../../api/salaryApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate,
  formatTime,
  formatCurrency,
  getInitials,
} from '../../utils/formatters';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [mySalary, setMySalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);

  const [timer, setTimer] = useState('00:00:00');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [profileRes, attListRes, leavesRes, salaryRes] =
        await Promise.allSettled([
          employeeApi.getMyProfile(),
          attendanceApi.getMyAttendance({ size: 10 }),
          leaveApi.getMyLeaves(),
          salaryApi.getMySalary(),
        ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
      }

      if (attListRes.status === 'fulfilled' && attListRes.value) {
        const records = Array.isArray(attListRes.value)
          ? attListRes.value
          : attListRes.value.content || [];
        setRecentAttendance(records);

        // Check if there is a record for today
        const todayRec = records.find((r) => r.attendanceDate === todayStr);
        setTodayAttendance(todayRec || null);
      }

      if (leavesRes.status === 'fulfilled' && leavesRes.value) {
        const lList = Array.isArray(leavesRes.value)
          ? leavesRes.value
          : leavesRes.value.content || [];
        setMyLeaves(lList);
      }

      if (salaryRes.status === 'fulfilled' && salaryRes.value) {
        const sList = Array.isArray(salaryRes.value)
          ? salaryRes.value
          : salaryRes.value.content || [];
        if (sList.length > 0) setMySalary(sList[0]);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Live timer since check-in
  useEffect(() => {
    if (!todayAttendance?.checkIn || todayAttendance?.checkOut) {
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(todayAttendance.checkIn).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimer(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Handle Check-in
  const handleCheckIn = async () => {
    setClockActionLoading(true);
    try {
      const res = await attendanceApi.checkIn();
      setTodayAttendance(res);
      toast.success('Successfully checked in for today!');
      fetchDashboardData();
    } catch (err) {
      console.error('Check-in error:', err);
      const msg = err.response?.data?.message || 'Failed to check in.';
      toast.error(msg);
    } finally {
      setClockActionLoading(false);
    }
  };

  // Handle Check-out
  const handleCheckOut = async () => {
    setClockActionLoading(true);
    try {
      const res = await attendanceApi.checkOut();
      setTodayAttendance(res);
      toast.success('Successfully checked out! Great work today.');
      fetchDashboardData();
    } catch (err) {
      console.error('Check-out error:', err);
      const msg = err.response?.data?.message || 'Failed to check out.';
      toast.error(msg);
    } finally {
      setClockActionLoading(false);
    }
  };

  const isCheckedIn = !!todayAttendance?.checkIn;
  const isCheckedOut = !!todayAttendance?.checkOut;

  const pendingLeavesCount = myLeaves.filter((l) => l.status === 'PENDING').length;
  const approvedLeavesCount = myLeaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Check-In Widget */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Welcome User Text */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Employee Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {profile?.firstName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              Track your daily work hours, apply for leaves, and inspect your compensation structure.
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-indigo-200/80">
              <span>Emp Code: <strong className="text-white font-mono">{profile?.employeeCode || '—'}</strong></span>
              <span>•</span>
              <span>Role: <strong className="text-white">{profile?.designation || 'Staff'}</strong></span>
            </div>
          </div>

          {/* Clock In / Out Action Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 w-full lg:w-96 flex flex-col items-center justify-center text-center shadow-lg">
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-1">
              Live Duty Status
            </div>

            {/* Time status */}
            {!isCheckedIn ? (
              <div className="my-2">
                <span className="text-sm font-semibold text-indigo-200">Not clocked in yet today</span>
              </div>
            ) : isCheckedOut ? (
              <div className="my-2 space-y-0.5">
                <span className="text-xs text-emerald-300 font-bold block">Duty Completed Today</span>
                <span className="text-lg font-mono font-bold text-white">
                  {todayAttendance.workingHours ? `${todayAttendance.workingHours} Hours Logged` : 'Clocked Out'}
                </span>
              </div>
            ) : (
              <div className="my-2 space-y-0.5">
                <span className="text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Clocked In & Active
                </span>
                <span className="text-3xl font-extrabold font-mono tracking-wider text-white">
                  {timer}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full mt-4">
              {!isCheckedIn ? (
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={clockActionLoading}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{clockActionLoading ? 'Recording Check-In...' : 'Clock In for Today'}</span>
                </button>
              ) : !isCheckedOut ? (
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={clockActionLoading}
                  className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{clockActionLoading ? 'Recording Check-Out...' : 'Clock Out for Today'}</span>
                </button>
              ) : (
                <div className="py-2.5 px-4 bg-white/10 rounded-xl text-xs font-semibold text-emerald-200 border border-emerald-400/30 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Daily shift finished</span>
                </div>
              )}
            </div>

            {/* Time stamps pill */}
            {isCheckedIn && (
              <div className="mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-around text-[11px] text-indigo-200">
                <div>In: <strong className="text-white font-mono">{formatTime(todayAttendance.checkIn)}</strong></div>
                {isCheckedOut && (
                  <div>Out: <strong className="text-white font-mono">{formatTime(todayAttendance.checkOut)}</strong></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Attendance Logged"
          value={loading ? '...' : recentAttendance.length}
          subtitle="Recent logged shifts"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Pending Leaves"
          value={loading ? '...' : pendingLeavesCount}
          subtitle="Awaiting manager review"
          icon={CalendarDays}
          color="amber"
        />
        <StatCard
          title="Approved Leaves"
          value={loading ? '...' : approvedLeavesCount}
          subtitle="Total approved time-offs"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Monthly Pay"
          value={loading ? '...' : mySalary ? formatCurrency(mySalary.netSalary) : '—'}
          subtitle="Active net structure"
          icon={CreditCard}
          color="violet"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Recent Attendance History */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Attendance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your latest recorded check-in logs
              </p>
            </div>
            <Link
              to="/employee/attendance"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Calendar →
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No recent attendance logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Check-In</th>
                    <th className="pb-3 font-semibold">Check-Out</th>
                    <th className="pb-3 font-semibold">Hours</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentAttendance.slice(0, 5).map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(att.attendanceDate)}
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {formatTime(att.checkIn)}
                      </td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                        {formatTime(att.checkOut)}
                      </td>
                      <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {att.workingHours ? `${att.workingHours} hrs` : '—'}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={att.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Quick Leave Portal & Actions */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Leave Applications
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track your pending and approved time-offs
                </p>
              </div>
              <Link
                to="/employee/leaves"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                Apply Leave
              </Link>
            </div>

            {myLeaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You have not submitted any leave requests yet.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {myLeaves.slice(0, 3).map((l) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {l.leaveType} Leave
                        </span>
                        <StatusBadge status={l.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(l.startDate)} — {formatDate(l.endDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/employee/leaves"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/employee/profile"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline"
            >
              Edit Profile Info →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
