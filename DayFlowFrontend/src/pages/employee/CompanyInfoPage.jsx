import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  FileText,
  Shield,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle2,
  HeartHandshake,
  Users,
  Compass,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const CompanyInfoPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setLoading(true);
      try {
        const data = await companyApi.getCompanyProfile();
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company info:', err);
        toast.error('Failed to fetch company details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading company handbook & details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. Hero Company Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo Container */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 shrink-0 shadow-lg">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            ) : (
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-indigo-100 border border-white/20">
                {company?.industry || 'Technology & Innovation'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Organization
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {company?.name || user?.companyName}
            </h1>

            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl">
              {company?.tagline || 'Empowering our workforce with collaborative excellence and smart operations.'}
            </p>

            {company?.website && (
              <div className="pt-2">
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all border border-white/20 shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Working Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Working Hours</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {company?.workingHours || '09:00 AM — 06:00 PM'}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Official operational schedule for attendance & daily logs.
          </p>
        </div>

        {/* Working Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Standard Work Week</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {company?.workingDays || 'Monday — Friday'}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Standard working days observed by the organization.
          </p>
        </div>

        {/* Established & Code */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Organization Key</span>
              <h3 className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {company?.code || 'DAYFLOW'}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            Established on {formatDate(company?.createdAt)}.
          </p>
        </div>
      </div>

      {/* 3. Workplace Address & Communication Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Headquarters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Headquarters & Office Location
              </h2>
              <p className="text-[11px] text-slate-400">Physical workplace address</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {company?.address ? (
              <p className="leading-relaxed font-medium">
                {company.address}
              </p>
            ) : (
              <p className="text-slate-400 italic">Address details not provided yet.</p>
            )}

            {(company?.city || company?.state || company?.country) && (
              <div className="pt-2 flex flex-wrap gap-2">
                {company.city && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    City: {company.city}
                  </span>
                )}
                {company.state && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    State: {company.state}
                  </span>
                )}
                {company.country && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    Country: {company.country}
                  </span>
                )}
                {company.postalCode && (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    ZIP: {company.postalCode}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* HR & Support Helpdesk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                HR & Support Desk
              </h2>
              <p className="text-[11px] text-slate-400">Contact channels for staff queries</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">HR Email</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {company?.contactEmail || company?.adminEmail || 'hr@company.com'}
                  </span>
                </div>
              </div>
              <a
                href={`mailto:${company?.contactEmail || company?.adminEmail || 'hr@company.com'}`}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Send Email
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Emergency Helpdesk</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {company?.emergencyContact || 'Available via HR Desk'}
                  </span>
                </div>
              </div>
              {company?.emergencyContact && (
                <a
                  href={`tel:${company.emergencyContact}`}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Call Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Company Leave Policy & Guidelines Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Workplace Leave Policy & Regulations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official guidelines for requesting time-off, sick leaves, and annual vacations.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {company?.leavePolicy ? (
            <p className="whitespace-pre-line">{company.leavePolicy}</p>
          ) : (
            <p className="text-slate-400 italic">
              Standard leave policies: Employees can apply for Paid, Sick, or Unpaid leaves with present/future dates. Sick leave exceeding 2 days may require medical certification.
            </p>
          )}
        </div>
      </div>

      {/* 5. About the Company & Culture Note */}
      {company?.about && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                About Our Company & Culture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core mission, shared values, and employee code of collaboration.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {company.about}
          </div>
        </div>
      )}
    </div>
  );
};
