import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  DollarSign,
  TrendingUp,
  ArrowRight,
  User,
  Building,
  Edit2,
  Plus,
} from 'lucide-react';
import { employeeApi } from '../../api/employeeApi';
import { salaryApi } from '../../api/salaryApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency, getInitials } from '../../utils/formatters';

export const PayrollManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toast = useToast();

  const fetchPayrollList = useCallback(
    async (page = 0) => {
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
        console.error('Failed to load payroll list:', err);
        toast.error('Failed to load workforce payroll summary.');
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchPayrollList(0);
  }, [fetchPayrollList]);

  const filtered = employees.filter(
    (e) =>
      !searchTerm ||
      e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workforce Payroll & Salaries
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain salary structures, basic pay scales, housing allowances, and monthly deductions.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee by name, code, dept..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading payroll structures...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No employees found"
              description="No employee records matched your query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Employee</th>
                  <th className="py-3.5 px-4 font-semibold">Code</th>
                  <th className="py-3.5 px-4 font-semibold">Department</th>
                  <th className="py-3.5 px-4 font-semibold">Designation</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Structure Configuration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {getInitials(emp.fullName || emp.firstName)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {emp.fullName || `${emp.firstName} ${emp.lastName}`}
                          </div>
                          <div className="text-[10px] text-slate-400">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {emp.employeeCode}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {emp.department || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {emp.designation || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.accountStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/admin/employees/${emp.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl font-semibold transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Manage Salary & Payslips →</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination pageData={pageData} onPageChange={fetchPayrollList} />
        </div>
      </div>
    </div>
  );
};
