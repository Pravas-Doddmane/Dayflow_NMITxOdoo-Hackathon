import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { leaveApi } from '../../api/leaveApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, calculateDays, getInitials } from '../../utils/formatters';
import { LEAVE_STATUS } from '../../utils/constants';

export const LeaveManagementPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Review Modal State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    leave: null,
    action: 'APPROVE', // 'APPROVE' | 'REJECT'
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchLeaves = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 10,
          sort: 'createdAt,desc',
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
        };

        const res = await leaveApi.getAllLeaves(params);
        setLeaves(res.content || []);
        setPageData(res);
        setCurrentPage(page);
      } catch (err) {
        console.error('Failed to load leaves:', err);
        toast.error('Failed to fetch leave requests.');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, toast]
  );

  useEffect(() => {
    fetchLeaves(0);
  }, [fetchLeaves]);

  const openReviewModal = (leave, action) => {
    setReviewModal({
      isOpen: true,
      leave,
      action,
      comment: '',
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const { leave, action, comment } = reviewModal;
    if (!leave) return;

    setSubmitting(true);
    try {
      const payload = { adminComment: comment.trim() || undefined };

      if (action === 'APPROVE') {
        await leaveApi.approveLeave(leave.id, payload);
        toast.success(`Leave request approved for ${leave.employeeName}`);
      } else {
        await leaveApi.rejectLeave(leave.id, payload);
        toast.success(`Leave request rejected for ${leave.employeeName}`);
      }

      setReviewModal({ isOpen: false, leave: null, action: 'APPROVE', comment: '' });
      fetchLeaves(currentPage);
    } catch (err) {
      console.error('Review leave error:', err);
      const msg = err.response?.data?.message || 'Failed to process leave review.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Leave Requests Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, or reject employee time-off applications with custom remarks.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leave List Cards / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading leave requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No leave requests found"
              description={
                statusFilter === 'PENDING'
                  ? 'Great job! There are no pending leave requests to review.'
                  : 'No leave applications match the selected filter.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Employee</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Dates & Duration</th>
                  <th className="py-3.5 px-4 font-semibold">Reason / Remarks</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaves.map((leave) => {
                  const totalDays = calculateDays(leave.startDate, leave.endDate);
                  const isPending = leave.status === 'PENDING';

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Employee info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                            {getInitials(leave.employeeName || leave.employeeCode)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {leave.employeeName || 'Staff Member'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {leave.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                          {leave.leaveType}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                          {leave.remarks ? `"${leave.remarks}"` : '—'}
                        </p>
                        {leave.adminComment && (
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>Admin note: "{leave.adminComment}"</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={leave.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openReviewModal(leave, 'APPROVE')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openReviewModal(leave, 'REJECT')}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold text-xs rounded-xl transition-colors border border-rose-200 dark:border-rose-800/60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Reviewed {formatDate(leave.reviewedAt || leave.updatedAt)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination pageData={pageData} onPageChange={fetchLeaves} />
        </div>
      </div>

      {/* REVIEW LEAVE MODAL */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        title={`${reviewModal.action === 'APPROVE' ? 'Approve' : 'Reject'} Leave Request`}
        subtitle={`Employee: ${reviewModal.leave?.employeeName} (${reviewModal.leave?.leaveType} Leave)`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Duration:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(reviewModal.leave?.startDate)} to{' '}
                {formatDate(reviewModal.leave?.endDate)}
              </span>
            </div>
            {reviewModal.leave?.remarks && (
              <div>
                <span className="text-slate-400 block mb-0.5">Employee reason:</span>
                <span className="text-slate-700 dark:text-slate-300 italic">
                  "{reviewModal.leave.remarks}"
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Remarks / Comment (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewModal.comment}
              onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
              placeholder={
                reviewModal.action === 'APPROVE'
                  ? 'e.g. Approved. Please ensure handoff before leave starts.'
                  : 'e.g. Rejecting due to overlapping sprint release dates.'
              }
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReviewModal({ ...reviewModal, isOpen: false })}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50 ${
                reviewModal.action === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Submitting...' : `Confirm ${reviewModal.action}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
