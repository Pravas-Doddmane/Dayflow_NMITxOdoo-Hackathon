import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CalendarCheck,
  CreditCard,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react';
import { employeeApi } from '../../api/employeeApi';
import { attendanceApi } from '../../api/attendanceApi';
import { salaryApi } from '../../api/salaryApi';
import { documentApi } from '../../api/documentApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { BASE_URL } from '../../api/axios';
import {
  formatDate,
  formatTime,
  formatCurrency,
  getInitials,
} from '../../utils/formatters';
import { DOCUMENT_TYPE } from '../../utils/constants';

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attendance' | 'salary' | 'documents'
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [salaryRecords, setSalaryRecords] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [documentRecords, setDocumentRecords] = useState([]);
  const [docLoading, setDocLoading] = useState(false);

  // Modals
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Forms
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: '',
    hra: '',
    allowances: '',
    deductions: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });

  const [docForm, setDocForm] = useState({
    documentType: 'RESUME',
    file: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getEmployeeById(id);
      setEmployee(res);
    } catch (err) {
      console.error('Failed to load employee:', err);
      toast.error('Failed to fetch employee details.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  // Load Tab-specific data on switch
  useEffect(() => {
    if (!id) return;

    if (activeTab === 'attendance') {
      setAttendanceLoading(true);
      attendanceApi
        .getEmployeeAttendance(id)
        .then((res) => setAttendanceRecords(res || []))
        .catch(() => toast.error('Failed to load employee attendance.'))
        .finally(() => setAttendanceLoading(false));
    } else if (activeTab === 'salary') {
      setSalaryLoading(true);
      salaryApi
        .getEmployeeSalary(id)
        .then((res) => setSalaryRecords(res || []))
        .catch(() => toast.error('Failed to load salary structure history.'))
        .finally(() => setSalaryLoading(false));
    } else if (activeTab === 'documents') {
      setDocLoading(true);
      documentApi
        .getEmployeeDocuments(id)
        .then((res) => setDocumentRecords(res || []))
        .catch(() => toast.error('Failed to load employee documents.'))
        .finally(() => setDocLoading(false));
    }
  }, [id, activeTab, toast]);

  // Handle Create Salary Structure
  const handleSaveSalary = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        basicSalary: Number(salaryForm.basicSalary),
        hra: Number(salaryForm.hra || 0),
        allowances: Number(salaryForm.allowances || 0),
        deductions: Number(salaryForm.deductions || 0),
        effectiveFrom: salaryForm.effectiveFrom,
        effectiveTo: salaryForm.effectiveTo || null,
      };

      await salaryApi.createSalary(id, payload);
      toast.success('Salary structure assigned successfully!');
      setIsSalaryModalOpen(false);
      setSalaryForm({
        basicSalary: '',
        hra: '',
        allowances: '',
        deductions: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
      });
      // Refresh salary
      const res = await salaryApi.getEmployeeSalary(id);
      setSalaryRecords(res || []);
    } catch (err) {
      console.error('Create salary error:', err);
      const msg = err.response?.data?.message || 'Failed to save salary structure.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Upload Document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docForm.file) {
      toast.warning('Please select a file to upload.');
      return;
    }
    setSubmitting(true);
    try {
      await documentApi.uploadDocument(id, docForm.documentType, docForm.file);
      toast.success('Document uploaded successfully!');
      setIsDocModalOpen(false);
      setDocForm({ documentType: 'RESUME', file: null });
      // Refresh docs
      const res = await documentApi.getEmployeeDocuments(id);
      setDocumentRecords(res || []);
    } catch (err) {
      console.error('Document upload error:', err);
      const msg = err.response?.data?.message || 'Failed to upload document.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async () => {
    if (!docToDelete) return;
    setSubmitting(true);
    try {
      await documentApi.deleteDocument(docToDelete.id);
      toast.success('Document removed successfully.');
      setDocToDelete(null);
      const res = await documentApi.getEmployeeDocuments(id);
      setDocumentRecords(res || []);
    } catch (err) {
      console.error('Delete doc error:', err);
      toast.error('Failed to delete document.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading 360° employee profile...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="py-12">
        <EmptyState
          title="Employee Not Found"
          description="The requested employee record does not exist or was deleted."
          actionText="Back to Directory"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'attendance', label: 'Attendance Logs', icon: CalendarCheck },
    { id: 'salary', label: 'Salary & Payroll', icon: CreditCard },
    { id: 'documents', label: 'Uploaded Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          to="/admin/employees"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {employee.profilePictureUrl ? (
              <img
                src={
                  employee.profilePictureUrl.startsWith('http')
                    ? employee.profilePictureUrl
                    : `${BASE_URL}${employee.profilePictureUrl}`
                }
                alt={employee.fullName}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
                {getInitials(employee.fullName || employee.firstName)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {employee.employeeCode}
                </span>
                <StatusBadge status={employee.accountStatus} />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{employee.department || 'General'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{employee.designation || 'Staff'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{employee.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeTab === 'salary' && (
              <button
                type="button"
                onClick={() => setIsSalaryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Salary Structure</span>
              </button>
            )}

            {activeTab === 'documents' && (
              <button
                type="button"
                onClick={() => setIsDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Personal Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">First Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.firstName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Last Name</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.gender || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(employee.dateOfBirth)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.email}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Residential Address</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {employee.address || 'No residential address recorded.'}
              </span>
            </div>
          </div>

          {/* Employment & Account Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.department || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Designation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {employee.designation || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Joining Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(employee.joiningDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Employment Status</span>
                <StatusBadge status={employee.employmentStatus} />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Account Status</span>
                <StatusBadge status={employee.accountStatus} />
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Email Verification</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {employee.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              System Record Created: {formatDate(employee.createdAt)}
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Attendance Log History
          </h3>

          {attendanceLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading attendance logs...
            </div>
          ) : attendanceRecords.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="No attendance logs found for this employee yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Check-In</th>
                    <th className="pb-3 font-semibold">Check-Out</th>
                    <th className="pb-3 font-semibold">Working Hours</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {attendanceRecords.map((att) => (
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
      )}

      {/* 3. SALARY TAB */}
      {activeTab === 'salary' && (
        <div className="space-y-6 animate-fade-in">
          {salaryLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading salary structures...
            </div>
          ) : salaryRecords.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <EmptyState
                title="No salary structure assigned"
                description="Assign an active salary structure with basic salary, allowances, and deductions."
                actionText="Assign Salary Structure"
                onAction={() => setIsSalaryModalOpen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {salaryRecords.map((sal, idx) => (
                <div
                  key={sal.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm relative overflow-hidden ${
                    idx === 0
                      ? 'border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  {idx === 0 && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      CURRENT ACTIVE
                    </span>
                  )}

                  <div className="text-xs text-slate-400 font-semibold mb-1">
                    Effective From: {formatDate(sal.effectiveFrom)}{' '}
                    {sal.effectiveTo ? `to ${formatDate(sal.effectiveTo)}` : '(Current)'}
                  </div>

                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-4">
                    {formatCurrency(sal.netSalary)}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">Net Monthly</span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Basic Pay:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(sal.basicSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">HRA (Housing):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(sal.hra)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Special Allowances:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(sal.allowances)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Deductions (TDS/PF):</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(sal.deductions)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Official Documents & Certifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded resumes, ID cards, offer letters, and contracts
              </p>
            </div>
          </div>

          {docLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading document attachments...
            </div>
          ) : documentRecords.length === 0 ? (
            <EmptyState
              title="No documents uploaded"
              description="Upload verified employee identity proofs, contracts, or credentials."
              actionText="Upload Document"
              onAction={() => setIsDocModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentRecords.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {doc.documentType}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={doc.fileName}>
                      {doc.fileName}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Uploaded {formatDate(doc.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          toast.info(`Downloading ${doc.fileName}...`);
                          await documentApi.downloadDocument(doc.id, doc.fileName);
                          toast.success('Document downloaded!');
                        } catch (err) {
                          console.error('Download error:', err);
                          toast.error('Failed to download document.');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE SALARY MODAL */}
      <Modal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        title="Assign Salary Structure"
        subtitle={`Configure monthly compensation breakdown for ${employee.fullName}`}
      >
        <form onSubmit={handleSaveSalary} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Basic Monthly Pay ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={salaryForm.basicSalary}
                onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                placeholder="5000"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                House Rent Allowance (HRA)
              </label>
              <input
                type="number"
                step="0.01"
                value={salaryForm.hra}
                onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                placeholder="1500"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Other Allowances
              </label>
              <input
                type="number"
                step="0.01"
                value={salaryForm.allowances}
                onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                placeholder="500"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Deductions
              </label>
              <input
                type="number"
                step="0.01"
                value={salaryForm.deductions}
                onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                placeholder="300"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effective From Date *
              </label>
              <input
                type="date"
                required
                value={salaryForm.effectiveFrom}
                onChange={(e) => setSalaryForm({ ...salaryForm, effectiveFrom: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effective To Date (Optional)
              </label>
              <input
                type="date"
                value={salaryForm.effectiveTo}
                onChange={(e) => setSalaryForm({ ...salaryForm, effectiveTo: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSalaryModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Structure'}
            </button>
          </div>
        </form>
      </Modal>

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Upload Employee Document"
        subtitle={`Upload verified records for ${employee.fullName}`}
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Category *
            </label>
            <select
              value={docForm.documentType}
              onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {Object.keys(DOCUMENT_TYPE).map((dt) => (
                <option key={dt} value={dt}>
                  {dt.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Document File (PDF, PNG, JPG, DOCX) *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDocModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE DOCUMENT CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteDoc}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${docToDelete?.fileName}"?`}
        confirmText="Delete"
        type="danger"
        loading={submitting}
      />
    </div>
  );
};
