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
  Image as ImageIcon,
  CheckCircle2,
  GraduationCap,
  Globe,
  Upload,
  Code2,
  FileText,
  Sparkles,
  HeartHandshake,
  ExternalLink,
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

  // Self-service editable fields
  const [form, setForm] = useState({
    phone: '',
    alternateEmail: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    aboutMe: '',
    skills: '',
    linkedinUrl: '',
    githubUrl: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    highestQualification: '',
    institution: '',
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
        alternateEmail: res.alternateEmail || '',
        address: res.address || '',
        city: res.city || '',
        state: res.state || '',
        country: res.country || '',
        postalCode: res.postalCode || '',
        aboutMe: res.aboutMe || '',
        skills: res.skills || '',
        linkedinUrl: res.linkedinUrl || '',
        githubUrl: res.githubUrl || '',
        emergencyContactName: res.emergencyContactName || '',
        emergencyContactRelation: res.emergencyContactRelation || '',
        emergencyContactPhone: res.emergencyContactPhone || '',
        highestQualification: res.highestQualification || '',
        institution: res.institution || '',
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Avatar image size must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, profilePictureUrl: reader.result }));
        toast.info('Avatar preview updated. Click "Save Profile Changes" to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeApi.updateMyProfile(form);
      setProfile(updated);
      toast.success('Your profile details have been saved successfully!');
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
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review official company records and personalize your professional biography, skills, education, and contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpdate}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Upload */}
          <div className="relative group">
            {form.profilePictureUrl || profile?.profilePictureUrl ? (
              <img
                src={form.profilePictureUrl || profile?.profilePictureUrl}
                alt={profile?.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                {getInitials(profile?.fullName || profile?.firstName)}
              </div>
            )}

            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
              title="Upload profile photo"
            >
              <Upload className="w-3.5 h-3.5" />
            </label>
          </div>

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
                <StatusBadge status={profile?.employmentStatus || profile?.accountStatus} />
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

            {/* Quick Skills Pills */}
            {form.skills && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {form.skills.split(',').map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-[10px] font-semibold"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Official Employment Records (Read-only as required) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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

            <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
              * Official records are managed by your HR administrator and locked from direct edits.
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): Self-Service Editable Details */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* 1. Professional Biography & Skills */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Professional Bio & Skills
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    About Me / Professional Bio
                  </label>
                  <textarea
                    rows={3}
                    value={form.aboutMe}
                    onChange={(e) => setForm({ ...form, aboutMe: e.target.value })}
                    placeholder="Short introduction about your experience, interests, and background..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Skills & Technologies (comma separated)
                  </label>
                  <div className="relative">
                    <Code2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="e.g. Java, Spring Boot, React.js, PostgreSQL, Docker"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GitHub / Portfolio
                    </label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={form.githubUrl}
                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Contact & Residential Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Contact & Residential Address
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alternate / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={form.alternateEmail}
                      onChange={(e) => setForm({ ...form, alternateEmail: e.target.value })}
                      placeholder="personal.email@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Flat 4B, 5th Cross, Mallikarjuna Nilaya"
                      className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Karnataka"
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
                    placeholder="e.g. India"
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
                    placeholder="e.g. 577201"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Emergency Contact */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <HeartHandshake className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Emergency Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Full Name
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                    placeholder="e.g. Ramesh Doddmane"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContactRelation}
                    onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
                    placeholder="e.g. Parent / Spouse"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                    placeholder="+91 9988776655"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Education & Qualifications */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Education & Qualifications
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Highest Qualification / Degree
                  </label>
                  <input
                    type="text"
                    value={form.highestQualification}
                    onChange={(e) => setForm({ ...form, highestQualification: e.target.value })}
                    placeholder="e.g. B.E. Computer Science / B.Tech"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College / University / Institution
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="e.g. VTU Belagavi / Bangalore University"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
