import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { authApi } from '../../api/authApi';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing. Please use the exact link sent to your email.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        console.error('Email verification error:', err);
        const msg =
          err.response?.data?.message ||
          'Email verification token is invalid or expired.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="text-center space-y-6 py-4 animate-fade-in">
      {loading && (
        <div className="space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Verifying your email...
          </h3>
          <p className="text-xs text-slate-500">
            Please wait while we confirm your email address.
          </p>
        </div>
      )}

      {!loading && success && (
        <div className="space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Email Verified!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your email address has been verified. You now have full access to your DayFlow account.
          </p>
          <div className="pt-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="space-y-4">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Verification Failed
          </h2>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">
            {error}
          </p>
          <div className="pt-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
