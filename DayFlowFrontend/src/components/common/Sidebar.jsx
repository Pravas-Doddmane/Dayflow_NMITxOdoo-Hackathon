import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  Calendar,
  User,
  LogOut,
  Zap,
  Sparkles,
  ChevronRight,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Attendance Logs', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Leave Requests', path: '/admin/leaves', icon: CalendarDays },
    { name: 'Salary & Payroll', path: '/admin/payroll', icon: CreditCard },
    { name: 'Company Profile', path: '/admin/profile', icon: Building2 },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee', icon: LayoutDashboard, exact: true },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { name: 'Apply Leaves', path: '/employee/leaves', icon: CalendarDays },
    { name: 'My Salary', path: '/employee/salary', icon: CreditCard },
    { name: 'Documents', path: '/employee/documents', icon: FileText },
    { name: 'Calendar', path: '/employee/calendar', icon: Calendar },
    { name: 'Company Info', path: '/employee/company', icon: Building2 },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <img
                src="/group-discussions.png"
                alt="DayFlow"
                className="w-9 h-9 rounded-xl object-contain bg-indigo-50 dark:bg-slate-800 p-1 border border-indigo-100 dark:border-indigo-900/40 shadow-sm"
              />
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Day<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  HRMS Suite
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              {isAdmin ? 'Administration' : 'Self Service'}
            </p>
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white/80' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                          }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer Area: Info badge & Sign Out */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Quick status pill */}


          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
