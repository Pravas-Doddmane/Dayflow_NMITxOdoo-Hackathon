import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Image,
  X,
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';

export const AdminRegisterPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toast = useToast();

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        logoUrl: logoPreview || undefined,
      };

      await authApi.registerAdmin(payload);
      setSuccess(true);
      toast.success('Registration successful! Verification email sent.');
    } catch (err) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your inputs.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-5 py-4 animate-fade-in">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Verification Link Sent
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          We’ve registered <strong>{formData.companyName}</strong>. A verification email has been sent to{' '}
          <strong className="text-slate-800 dark:text-slate-200">{formData.email}</strong>. Please verify your email before signing in.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top App / Web Logo */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 mb-1">
          <Zap className="w-6 h-6 fill-white/20" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sign Up
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Register your organization and administrator account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Company Name + Logo Upload button */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Company Name :- <span className="text-purple-600 font-extrabold">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Acme Innovations"
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Logo Upload Button / Preview */}
            <label
              title="Upload Company Logo"
              className="relative p-2.5 rounded-xl border border-dashed border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 cursor-pointer transition-colors flex items-center justify-center shrink-0"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              {logoPreview ? (
                <div className="relative w-6 h-6">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-6 h-6 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveLogo();
                    }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <UploadCloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </label>
          </div>
        </div>

        {/* Name :- First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              First Name :-
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Last Name :-
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Email :- */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Email :- <span className="text-purple-600 font-extrabold">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@company.com"
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Phone :- */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Phone :-
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 555 0199"
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Password :- */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Password :- <span className="text-purple-600 font-extrabold">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password :- */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Confirm Password :- <span className="text-purple-600 font-extrabold">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Purple Sign Up Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider uppercase"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Link: Already have an account ? Sign In */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account ?{' '}
          <Link
            to="/login"
            className="text-purple-600 dark:text-purple-400 hover:underline font-extrabold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
