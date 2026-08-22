import React, { useState, useEffect } from 'react';
import {
  Building2,
  Shield,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Calendar,
  FileText,
  Save,
  CheckCircle2,
  Upload,
  Sparkles,
  Info,
  AlertCircle,
  HelpCircle,
  User,
  Hash,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AdminProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);

  // Form State
  const [form, setForm] = useState({
    tagline: '',
    industry: '',
    website: '',
    contactEmail: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    workingHours: '',
    workingDays: '',
    about: '',
    leavePolicy: '',
    emergencyContact: '',
    logoUrl: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await companyApi.getCompanyProfile();
      setCompany(data);
      setForm({
        tagline: data.tagline || '',
        industry: data.industry || '',
        website: data.website || '',
        contactEmail: data.contactEmail || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        postalCode: data.postalCode || '',
        workingHours: data.workingHours || '',
        workingDays: data.workingDays || '',
        about: data.about || '',
        leavePolicy: data.leavePolicy || '',
        emergencyContact: data.emergencyContact || '',
        logoUrl: data.logoUrl || '',
      });
    } catch (err) {
      console.error('Failed to load company profile:', err);
      toast.error('Failed to load company profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo image size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, logoUrl: reader.result }));
        toast.info('Logo preview updated. Click "Save Company Details" to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await companyApi.updateCompanyProfile(form);
      setCompany(updated);
      toast.success('Company profile updated successfully!');
    } catch (err) {
      console.error('Failed to update company profile:', err);
      const msg = err.response?.data?.message || 'Failed to save changes.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading administrator & company profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Administrator & Company Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your registration credentials and maintain essential organization information for your workforce.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Company Details'}</span>
        </button>
      </div>

      {/* 1. Account Credentials & Registration Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Administrator Credentials (Created at Registration)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanent organizational identity created during your workspace account setup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Admin Email */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              Admin Account Email
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
              {company?.adminEmail || user?.email}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              Verified Primary Owner
            </span>
          </div>

          {/* Company Name (Fixed) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              Company Legal Name
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
              {company?.name || user?.companyName}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Locked / Read-Only
            </span>
          </div>

          {/* Company Unique Code (Fixed) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-500" />
              Organization Code
            </span>
            <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {company?.code}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              Internal Tenant Key
            </span>
          </div>

          {/* Registered Date */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Workspace Established
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              {formatDate(company?.createdAt)}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              Active Platform Tenant
            </span>
          </div>
        </div>
      </div>

      {/* 2. Detailed Company Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Logo & Brand Identity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Brand & Company Identity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual brand assets and public company mission shown across employee dashboards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Logo Preview & Upload */}
            <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-center">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="w-10 h-10 text-indigo-400 opacity-60" />
                )}
              </div>
              <input
                type="file"
                id="company-logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <label
                htmlFor="company-logo-upload"
                className="cursor-pointer px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo</span>
              </label>
              <p className="text-[10px] text-slate-400 mt-2">
                PNG, JPG or SVG up to 2MB.
              </p>
            </div>

            {/* Tagline & Industry */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Empowering modern engineering teams with agile innovation."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry / Domain
                  </label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="e.g. Information Technology & SaaS"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Website URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Workplace & Contact Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Location & Workforce Communications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official contact channels and physical headquarters for official letters & tax invoices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official HR / Workplace Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="hr@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact / Helpdesk Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  placeholder="e.g. +1 (555) 019-2834 (HR Support Desk)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headquarters Street Address
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. Suite 400, 100 Innovation Way, Tech Park"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. San Francisco"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="e.g. California"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. United States"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Postal / ZIP Code
              </label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="e.g. 94105"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Employee Operational Guidelines & Policies */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workforce Operations, Shifts & Policy Brief
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operating policies that all active staff members can reference in their workplace portal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Working Hours
              </label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                placeholder="e.g. 09:00 AM — 06:00 PM (Flexible 1 hr)"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Working Days
              </label>
              <input
                type="text"
                value={form.workingDays}
                onChange={(e) => setForm({ ...form, workingDays: e.target.value })}
                placeholder="e.g. Monday — Friday (Weekends Off)"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Workplace Leave & Time-Off Policy Summary
              </label>
              <textarea
                rows={3}
                value={form.leavePolicy}
                onChange={(e) => setForm({ ...form, leavePolicy: e.target.value })}
                placeholder="e.g. 18 Paid Annual Leaves, 12 Sick Leaves. Sick leave exceeding 2 days requires a medical certificate. Apply at least 24 hours in advance for planned leaves."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                About the Company & Culture Note
              </label>
              <textarea
                rows={3}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                placeholder="Brief summary of company culture, core values, and vision for employees."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save & Publish Organization Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
