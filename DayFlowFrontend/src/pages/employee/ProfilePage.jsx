import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Shield,
  Save,
  Image,
  CheckCircle2,
} from 'lucide-react';
import { employeeApi } from '../../api/employeeApi';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { BASE_URL } from '../../api/axios';
import { formatDate, getInitials } from '../../utils/formatters';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    address: '',
    profilePictureUrl: '',
  });

  const toast = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getMyProfile();
      setProfile(res);
      setForm({
        phone: res.phone || '',
        address: res.address || '',
        profilePictureUrl: res.profilePictureUrl || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Failed to load your profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeApi.updateMyProfile(form);
      setProfile(updated);
      toast.success('Your profile contact information has been updated!');
    } catch (err) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Employee Self-Service Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your official employment records and update your contact phone, address, and picture.
        </p>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {profile?.profilePictureUrl ? (
            <img
              src={
                profile.profilePictureUrl.startsWith('http')
                  ? profile.profilePictureUrl
                  : `${BASE_URL}${profile.profilePictureUrl}`
              }
              alt={profile.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
              {getInitials(profile?.fullName || profile?.firstName)}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.fullName || `${profile?.firstName} ${profile?.lastName}`}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {profile?.designation} • {profile?.department}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {profile?.employeeCode}
                </span>
                <StatusBadge status={profile?.accountStatus} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.email}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {formatDate(profile?.joiningDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Read-Only Info vs Editable Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 cols): Official Employment Details (Read-only) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Company Records
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Employee Identification:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {profile?.employeeCode}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile?.department || '—'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Official Designation:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile?.designation || '—'}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Date of Joining:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(profile?.joiningDate)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatDate(profile?.dateOfBirth)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/60">
              <span className="text-slate-400">Gender:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile?.gender || '—'}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Employment Status:</span>
              <StatusBadge status={profile?.employmentStatus} />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2">
            * Note: To update formal employment details (Designation, Dept, DOB), please reach out to your HR administrator.
          </p>
        </div>

        {/* Right Column (6 cols): Self-Service Editable Contact Info */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Self-Service Contact Details
            </h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Residential Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Flat 4B, Silicon Heights, Tech Park"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Profile Avatar URL (Optional)
              </label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={form.profilePictureUrl}
                  onChange={(e) => setForm({ ...form, profilePictureUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
