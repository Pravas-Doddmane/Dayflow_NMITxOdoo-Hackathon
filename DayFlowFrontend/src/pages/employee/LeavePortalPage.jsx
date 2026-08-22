import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { leaveApi } from '../../api/leaveApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, calculateDays } from '../../utils/formatters';
import { LEAVE_TYPE } from '../../utils/constants';

export const LeavePortalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    leaveType: 'PAID',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchMyLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyLeaves();
      setLeaves(Array.isArray(res) ? res : res.content || []);
    } catch (err) {
      console.error('Failed to load my leaves:', err);
      toast.error('Failed to fetch your leave requests.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be prior to start date.');
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.applyForLeave(form);
      toast.success('Leave application submitted successfully for review!');
      setIsApplyModalOpen(false);
      setForm({
        leaveType: 'PAID',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      fetchMyLeaves();
    } catch (err) {
      console.error('Apply leave error:', err);
      const msg = err.response?.data?.message || 'Failed to submit leave application.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedDays = calculateDays(form.startDate, form.endDate);

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leave Management & Time Off
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for paid, sick, or casual leave and track real-time manager approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Status Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Under Review</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {pendingCount} Requests
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Approved Leaves</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {approvedCount} Applications
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Total Submissions</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {leaves.length} Recorded
            </h3>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            My Application History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Full audit log of your time-off submissions and administrator decisions
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading your leave requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No leave requests"
              description="You have not submitted any leave applications yet."
              actionText="Apply for Leave"
              onAction={() => setIsApplyModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Leave Type</th>
                  <th className="py-3.5 px-4 font-semibold">Duration & Dates</th>
                  <th className="py-3.5 px-4 font-semibold">Days</th>
                  <th className="py-3.5 px-4 font-semibold">Reason / Remarks</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Review Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaves.map((l) => {
                  const days = calculateDays(l.startDate, l.endDate);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                          {l.leaveType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(l.startDate)} — {formatDate(l.endDate)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {l.remarks ? `"${l.remarks}"` : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={l.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {l.adminComment ? (
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 italic">
                            "{l.adminComment}"
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPLY LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Time Off"
        subtitle="Submit a formal leave application for manager approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Leave Category *
            </label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="PAID">PAID LEAVE</option>
              <option value="SICK">SICK LEAVE</option>
              <option value="UNPAID">UNPAID LEAVE</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
            <span>Requested Duration:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. Attending family function / Doctor appointment"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
