import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { employeeApi } from '../../api/employeeApi';
import { attendanceApi } from '../../api/attendanceApi';
import { leaveApi } from '../../api/leaveApi';
import { formatDate, formatTime, getInitials } from '../../utils/formatters';
import { LEAVE_STATUS } from '../../utils/constants';

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingLeavesList, setPendingLeavesList] = useState([]);
  const [todayAttendanceList, setTodayAttendanceList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        const [empRes, attRes, leaveRes] = await Promise.allSettled([
          employeeApi.getAllEmployees({ size: 5, sort: 'id,desc' }),
          attendanceApi.getAllAttendance({ from: todayStr, to: todayStr, size: 5 }),
          leaveApi.getAllLeaves({ status: LEAVE_STATUS.PENDING, size: 5 }),
        ]);

        let totalEmp = 0;
        let activeEmp = 0;
        if (empRes.status === 'fulfilled' && empRes.value) {
          totalEmp = empRes.value.totalElements || 0;
          setRecentEmployees(empRes.value.content || []);
          activeEmp = (empRes.value.content || []).filter(
            (e) => e.accountStatus === 'ACTIVE'
          ).length;
        }

        let todayAttCount = 0;
        if (attRes.status === 'fulfilled' && attRes.value) {
          todayAttCount = attRes.value.totalElements || (attRes.value.content?.length || 0);
          setTodayAttendanceList(attRes.value.content || []);
        }

        let pendingLeavesCount = 0;
        if (leaveRes.status === 'fulfilled' && leaveRes.value) {
          pendingLeavesCount = leaveRes.value.totalElements || (leaveRes.value.content?.length || 0);
          setPendingLeavesList(leaveRes.value.content || []);
        }

        setStats({
          totalEmployees: totalEmp,
          activeEmployees: activeEmp || totalEmp,
          todayAttendance: todayAttCount,
          pendingLeaves: pendingLeavesCount,
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrator Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time workforce activity, attendance records, and pending approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/employees"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Employees</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Workforce"
          value={loading ? '...' : stats.totalEmployees}
          subtitle="Enrolled staff members"
          icon={Users}
          color="indigo"
          trend={12}
          trendLabel="vs last quarter"
        />
        <StatCard
          title="Today's Check-ins"
          value={loading ? '...' : stats.todayAttendance}
          subtitle="Present on duty today"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Pending Leaves"
          value={loading ? '...' : stats.pendingLeaves}
          subtitle="Awaiting manager review"
          icon={CalendarDays}
          color="amber"
        />
        <StatCard
          title="Active Accounts"
          value={loading ? '...' : stats.activeEmployees}
          subtitle="Verified & active status"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Two Columns: Recent Attendance & Pending Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Today's Attendance Activity */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Attendance Logs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live timestamps and work durations
              </p>
            </div>
            <Link
              to="/admin/attendance"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAttendanceList.length === 0 ? (
            <EmptyState
              title="No check-ins yet today"
              description="Employees who clock in today will automatically appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Check-In</th>
                    <th className="pb-3 font-semibold">Check-Out</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {todayAttendanceList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center">
                            {getInitials(row.employeeName || row.employeeCode)}
                          </div>
                          <div>
                            <div>{row.employeeName || 'Staff Member'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {row.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">
                        {formatTime(row.checkIn)}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400 font-mono">
                        {formatTime(row.checkOut)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Pending Leave Requests */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Pending Leaves
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Awaiting administrator approval
                </p>
              </div>
              <Link
                to="/admin/leaves"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Review Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingLeavesList.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No pending leave requests at this moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeavesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.employeeName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          {item.leaveType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(item.startDate)} — {formatDate(item.endDate)}
                      </p>
                      {item.remarks && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mt-1 line-clamp-1">
                          "{item.remarks}"
                        </p>
                      )}
                    </div>
                    <Link
                      to="/admin/leaves"
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 rounded-lg hover:bg-indigo-100 transition-colors shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/admin/leaves"
              className="w-full block text-center py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Open Leave Management Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recently Enrolled Staff
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest additions to your company directory
            </p>
          </div>
          <Link
            to="/admin/employees"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Full Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Get started by adding your first team member."
            actionText="Add Employee"
            onAction={() => {}}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Name & Email</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Designation</th>
                  <th className="pb-3 font-semibold">Joining Date</th>
                  <th className="pb-3 font-semibold">Account Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                      </div>
                      <div className="text-[10px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {emp.department || '—'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {emp.designation || '—'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={emp.accountStatus} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/employees/${emp.id}`}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        360° Profile →
                      </Link>
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
