import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Building2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  User,
  Zap,
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES } from '../../utils/constants';

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE'); // 'EMPLOYEE' | 'ADMIN'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) {
      setError('Company Name is compulsory to log into your organization workspace.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await authApi.login(payload);
      login(res.token, {
        userId: res.userId,
        employeeId: res.employeeId,
        role: res.role,
        email: res.email,
        companyId: res.companyId,
        companyName: res.companyName,
      });

      toast.success(`Welcome to ${res.companyName || 'DayFlow'}, ${res.email}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (res.role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid credentials or company name. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top App / Web Logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 mb-1">
          <Zap className="w-6 h-6 fill-white/20" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign In
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select your role and enter your company workspace details
        </p>
      </div>

      {/* Role Selector Tabs (Employee vs Admin) */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setSelectedRole('EMPLOYEE')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'EMPLOYEE'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Employee</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('ADMIN')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'ADMIN'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name (Compulsory) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Company Name :- <span className="text-purple-600 dark:text-purple-400 font-extrabold">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. TechTitans or Acme Corp"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Required because one email can be linked to multiple companies.
          </span>
        </div>

        {/* Login Id / Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Login Id / Email :- <span className="text-purple-600 dark:text-purple-400 font-extrabold">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password :- <span className="text-purple-600 dark:text-purple-400 font-extrabold">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Purple SIGN IN Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider uppercase"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>SIGN IN</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Role-based Bottom Links */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        {selectedRole === 'ADMIN' ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an Account?{' '}
            <Link
              to="/register-admin"
              className="text-purple-600 dark:text-purple-400 hover:underline font-extrabold"
            >
              Sign Up
            </Link>
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New employee? Check your email for your company invitation link.
            </p>
            <p className="text-[11px] text-slate-400">
              Are you a company administrator?{' '}
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
              >
                Switch to Admin Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
