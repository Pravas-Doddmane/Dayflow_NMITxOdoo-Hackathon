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
  Upload,
  User,
  FileCheck,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { leaveApi } from '../../api/leaveApi';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, calculateDays } from '../../utils/formatters';

export const LeavePortalPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [form, setForm] = useState({
    leaveType: 'PAID',
    startDate: todayStr,
    endDate: todayStr,
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
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

  const handleStartDateChange = (val) => {
    if (val < todayStr) {
      toast.error('Past dates are not allowed. Please select today or a future date.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      startDate: val,
      endDate: prev.endDate < val ? val : prev.endDate,
    }));
  };

  const handleEndDateChange = (val) => {
    if (val < form.startDate) {
      toast.error('End date cannot be prior to start date.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      endDate: val,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Medical certificate file size must be less than 5MB.');
        return;
      }
      setAttachedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, attachmentUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedFile(null);
      setForm((prev) => ({ ...prev, attachmentUrl: undefined }));
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (form.startDate < todayStr) {
      toast.error('Leave start date cannot be in the past. Please select today or a future date.');
      return;
    }

    if (form.endDate < form.startDate) {
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
        startDate: todayStr,
        endDate: todayStr,
        remarks: '',
      });
      setAttachedFile(null);
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
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

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
          onClick={() => {
            setForm({
              leaveType: 'PAID',
              startDate: todayStr,
              endDate: todayStr,
              remarks: '',
            });
            setAttachedFile(null);
            setIsApplyModalOpen(true);
          }}
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
              {approvedCount} Approved
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

      {/* Leave Application History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              My Application History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Full audit log of your time-off submissions and administrative review status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading leave applications...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No leave requests yet"
              description="You have not submitted any time-off requests. Click 'Apply for Leave' above whenever you need time off."
              actionText="Apply for Leave"
              onAction={() => {
                setForm({
                  leaveType: 'PAID',
                  startDate: todayStr,
                  endDate: todayStr,
                  remarks: '',
                });
                setAttachedFile(null);
                setIsApplyModalOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Duration & Dates</th>
                  <th className="py-3.5 px-4 font-semibold">Days</th>
                  <th className="py-3.5 px-4 font-semibold">Reason</th>
                  <th className="py-3.5 px-4 font-semibold">Medical Certificate</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted On</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Manager Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {l.leaveType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(l.startDate)} → {formatDate(l.endDate)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {calculateDays(l.startDate, l.endDate)} {calculateDays(l.startDate, l.endDate) === 1 ? 'Day' : 'Days'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={l.remarks}>
                      {l.remarks || '—'}
                    </td>

                    {/* Medical Certificate Column */}
                    <td className="py-3.5 px-4">
                      {l.attachmentUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDoc({
                              url: l.attachmentUrl,
                              leaveType: l.leaveType,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(l.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={l.status} />
                    </td>

                    <td className="py-3.5 px-4 max-w-[220px]">
                      {l.adminComment ? (
                        <div className="inline-flex items-start gap-1.5 p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={l.adminComment}>
                            "{l.adminComment}"
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No remarks provided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TIME OFF TYPE REQUEST MODAL (Matching Wireframe) */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Time off Type Request"
        subtitle="Submit a formal request for manager approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          {/* Employee Row */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Employee:
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {user?.email || 'Logged In Staff'}
            </span>
          </div>

          {/* Time off Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time off Type *
            </label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="PAID">Paid Time off</option>
              <option value="SICK">Sick Leave</option>
              <option value="UNPAID">Unpaid Leaves</option>
            </select>
          </div>

          {/* Validity Period (Present and Future Dates Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Validity Period * <span className="text-[11px] font-normal text-slate-400">(Present & future dates only)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">From (Start Date)</span>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={form.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">To (End Date)</span>
                <input
                  type="date"
                  required
                  min={form.startDate || todayStr}
                  value={form.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Allocation */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-semibold">Allocation:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {calculatedDays.toFixed(2)} Days
            </span>
          </div>

          {/* Attachment (For sick leave certificate / doctor note) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attachment <span className="text-[11px] font-normal text-slate-400">(For sick leave certificate / doctor's note)</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:border-indigo-400 transition-colors text-center">
              <input
                type="file"
                id="sick-leave-attachment"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <label
                htmlFor="sick-leave-attachment"
                className="cursor-pointer flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80">
                  <Upload className="w-4 h-4" />
                </div>
                <span>{attachedFile ? attachedFile.name : 'Upload Medical Certificate / Document'}</span>
              </label>
              {attachedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setAttachedFile(null);
                    setForm((prev) => ({ ...prev, attachmentUrl: undefined }));
                  }}
                  className="text-[10px] text-rose-500 hover:underline mt-1 block mx-auto"
                >
                  Remove attached certificate
                </button>
              )}
            </div>
          </div>

          {/* Reason / Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Remarks
            </label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. Doctor appointment / Family function"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Buttons: Submit & Discard */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                setIsApplyModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MEDICAL CERTIFICATE PREVIEW & DOWNLOAD MODAL */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title="Medical Certificate & Attachment"
        subtitle={`Submitted Time-off Document (${previewDoc?.leaveType || 'Leave'})`}
      >
        <div className="space-y-4">
          <div className="max-h-[65vh] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center">
            {previewDoc?.url?.startsWith('data:image/') || previewDoc?.url?.includes('.png') || previewDoc?.url?.includes('.jpg') || previewDoc?.url?.includes('.jpeg') ? (
              <img
                src={previewDoc.url}
                alt="Medical Certificate"
                className="max-h-[55vh] object-contain rounded-xl shadow-sm"
              />
            ) : (
              <iframe
                src={previewDoc?.url}
                title="Medical Certificate Document"
                className="w-full h-[55vh] rounded-xl border-0"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href={previewDoc?.url}
              download="Medical_Certificate.png"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
