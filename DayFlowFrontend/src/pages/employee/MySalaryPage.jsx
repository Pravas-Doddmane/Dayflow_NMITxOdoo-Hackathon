import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { salaryApi } from '../../api/salaryApi';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const MySalaryPage = () => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchSalary = async () => {
      setLoading(true);
      try {
        const res = await salaryApi.getMySalary();
        setSalaryHistory(Array.isArray(res) ? res : res.content || []);
      } catch (err) {
        console.error('Failed to load my salary:', err);
        toast.error('Failed to fetch compensation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalary();
  }, [toast]);

  const activeStructure = salaryHistory.length > 0 ? salaryHistory[0] : null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Salary & Compensation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed monthly compensation breakdown, earnings, allowances, and statutory deductions.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your salary structure...</p>
        </div>
      ) : !activeStructure ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <EmptyState
            title="No Salary Structure Assigned"
            description="Your HR department has not configured an active salary structure yet."
          />
        </div>
      ) : (
        <>
          {/* Main Active Payslip Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  CURRENT ACTIVE STRUCTURE
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Monthly Compensation Overview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Effective from {formatDate(activeStructure.effectiveFrom)}{' '}
                  {activeStructure.effectiveTo ? `to ${formatDate(activeStructure.effectiveTo)}` : '(Current)'}
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400 font-semibold block">Net Take-Home Pay</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(activeStructure.netSalary)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">per calendar month</span>
              </div>
            </div>

            {/* Split Breakdown: Earnings vs Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Earnings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Earnings / Additions
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Gross: {formatCurrency(Number(activeStructure.basicSalary) + Number(activeStructure.hra || 0) + Number(activeStructure.allowances || 0))}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        Basic Salary
                      </span>
                      <span className="text-[10px] text-slate-400">Base contractual monthly pay</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white self-center">
                      {formatCurrency(activeStructure.basicSalary)}
                    </span>
                  </div>

                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        House Rent Allowance (HRA)
                      </span>
                      <span className="text-[10px] text-slate-400">Housing and accommodation benefit</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white self-center">
                      {formatCurrency(activeStructure.hra)}
                    </span>
                  </div>

                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        Special Allowances
                      </span>
                      <span className="text-[10px] text-slate-400">Transport, medical & performance perks</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 self-center">
                      +{formatCurrency(activeStructure.allowances)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Statutory Deductions
                  </h3>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Total: -{formatCurrency(activeStructure.deductions)}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                    <div>
                      <span className="font-semibold text-rose-900 dark:text-rose-200 block">
                        Monthly Deductions
                      </span>
                      <span className="text-[10px] text-slate-400">TDS, Provident Fund, State Insurance</span>
                    </div>
                    <span className="font-bold text-rose-600 dark:text-rose-400 self-center">
                      -{formatCurrency(activeStructure.deductions)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    <p className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      Payroll Transparency Guarantee
                    </p>
                    All statutory tax deductions and social contributions are calculated automatically per labor policies.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Salary Revisions */}
          {salaryHistory.length > 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Historical Salary Revisions
              </h3>

              <div className="space-y-3">
                {salaryHistory.slice(1).map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDate(s.effectiveFrom)} — {formatDate(s.effectiveTo)}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Basic: {formatCurrency(s.basicSalary)} | Allowances: {formatCurrency(s.allowances)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Net: {formatCurrency(s.netSalary)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
