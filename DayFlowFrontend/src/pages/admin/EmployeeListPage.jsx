import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { employeeApi } from '../../api/employeeApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, getInitials } from '../../utils/formatters';
import { ACCOUNT_STATUS, EMPLOYMENT_STATUS, GENDER } from '../../utils/constants';

export const EmployeeListPage = () => {
  const [employees, setEmployees] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    employee: null,
    targetStatus: null,
  });

  // Forms
  const [createForm, setCreateForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    designation: '',
    department: '',
    joiningDate: '',
    employmentStatus: 'ACTIVE',
  });

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchEmployees = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await employeeApi.getAllEmployees({
        page,
        size: 10,
        sort: 'id,desc',
      });
      setEmployees(res.content || []);
      setPageData(res);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast.error('Failed to fetch employee records.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees(0);
  }, [fetchEmployees]);

  // Handle Create Employee
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeApi.createEmployee(createForm);
      toast.success(`Employee ${createForm.firstName} created and invitation email dispatched!`);
      setIsAddModalOpen(false);
      setCreateForm({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: 'MALE',
        designation: '',
        department: '',
        joiningDate: new Date().toISOString().split('T')[0],
      });
      fetchEmployees(0);
    } catch (err) {
      console.error('Create employee error:', err);
      const msg = err.response?.data?.message || 'Failed to create employee.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      phone: emp.phone || '',
      address: emp.address || '',
      dateOfBirth: emp.dateOfBirth || '',
      gender: emp.gender || 'MALE',
      designation: emp.designation || '',
      department: emp.department || '',
      joiningDate: emp.joiningDate || '',
      employmentStatus: emp.employmentStatus || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  // Handle Update Employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSubmitting(true);
    try {
      await employeeApi.updateEmployee(selectedEmployee.id, editForm);
      toast.success('Employee profile updated successfully!');
      setIsEditModalOpen(false);
      fetchEmployees(currentPage);
    } catch (err) {
      console.error('Update employee error:', err);
      const msg = err.response?.data?.message || 'Failed to update employee.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Account Status Change (ACTIVE / DISABLED)
  const handleStatusChange = async () => {
    const { employee, targetStatus } = statusConfirmModal;
    if (!employee || !targetStatus) return;
    setSubmitting(true);
    try {
      await employeeApi.updateAccountStatus(employee.id, targetStatus);
      toast.success(`Account status updated to ${targetStatus}`);
      setStatusConfirmModal({ isOpen: false, employee: null, targetStatus: null });
      fetchEmployees(currentPage);
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to change employee status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter client-side for search term & status
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchTerm ||
      emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || emp.accountStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organization members, onboard new staff, and review profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, code..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'INVITED', 'DISABLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading workforce records...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No employees found"
              description="No employee records match your search or filter criteria."
              actionText="Add Employee"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Employee</th>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 font-semibold">Department & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Joining Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                          {getInitials(emp.fullName || emp.firstName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                          </div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {emp.employeeCode}
                    </td>

                    {/* Dept & Designation */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {emp.designation || 'Staff'}
                      </div>
                      <div className="text-[11px] text-slate-400">{emp.department || 'General'}</div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {emp.phone || '—'}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {formatDate(emp.joiningDate)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.accountStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/employees/${emp.id}`}
                          title="View 360° Profile"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => openEditModal(emp)}
                          title="Edit Information"
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {emp.accountStatus === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() =>
                              setStatusConfirmModal({
                                isOpen: true,
                                employee: emp,
                                targetStatus: 'DISABLED',
                              })
                            }
                            title="Disable Account"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setStatusConfirmModal({
                                isOpen: true,
                                employee: emp,
                                targetStatus: 'ACTIVE',
                              })
                            }
                            title="Activate Account"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination pageData={pageData} onPageChange={fetchEmployees} />
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="This will register the employee and automatically send an email invitation with a password setup link."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee Code *
              </label>
              <input
                type="text"
                required
                value={createForm.employeeCode}
                onChange={(e) =>
                  setCreateForm({ ...createForm, employeeCode: e.target.value })
                }
                placeholder="e.g. EMP001"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="jane.doe@company.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={createForm.firstName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, firstName: e.target.value })
                }
                placeholder="Jane"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={createForm.lastName}
                onChange={(e) =>
                  setCreateForm({ ...createForm, lastName: e.target.value })
                }
                placeholder="Smith"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={createForm.designation}
                onChange={(e) =>
                  setCreateForm({ ...createForm, designation: e.target.value })
                }
                placeholder="Software Engineer"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={createForm.department}
                onChange={(e) =>
                  setCreateForm({ ...createForm, department: e.target.value })
                }
                placeholder="Engineering"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={createForm.joiningDate}
                onChange={(e) =>
                  setCreateForm({ ...createForm, joiningDate: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={createForm.gender}
                onChange={(e) =>
                  setCreateForm({ ...createForm, gender: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm({ ...createForm, phone: e.target.value })
                }
                placeholder="+1 555-0199"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={createForm.dateOfBirth}
                onChange={(e) =>
                  setCreateForm({ ...createForm, dateOfBirth: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={createForm.address}
              onChange={(e) =>
                setCreateForm({ ...createForm, address: e.target.value })
              }
              placeholder="123 Tech Boulevard, Suite 400"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Creating Employee...' : 'Save & Send Invitation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee Information"
        subtitle={`Updating details for ${selectedEmployee?.fullName || selectedEmployee?.employeeCode}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <select
                value={editForm.employmentStatus}
                onChange={(e) => setEditForm({ ...editForm, employmentStatus: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* STATUS TOGGLE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={statusConfirmModal.isOpen}
        onClose={() => setStatusConfirmModal({ isOpen: false, employee: null, targetStatus: null })}
        onConfirm={handleStatusChange}
        title={`${statusConfirmModal.targetStatus === 'DISABLED' ? 'Disable' : 'Activate'} Employee Account`}
        message={`Are you sure you want to change the status of ${statusConfirmModal.employee?.fullName || 'this employee'} to ${statusConfirmModal.targetStatus}?`}
        confirmText={`Set to ${statusConfirmModal.targetStatus}`}
        type={statusConfirmModal.targetStatus === 'DISABLED' ? 'danger' : 'info'}
        loading={submitting}
      />
    </div>
  );
};
