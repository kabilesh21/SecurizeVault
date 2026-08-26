import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #EBF6F6 0%, #DDF4F1 50%, #F4F9F9 100%)' }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(58,175,170,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(221,244,241,0.2) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-2xl font-black font-sans tracking-tight text-slate-800">
            Securize<span className="text-indigo-600 font-extrabold">Vault</span>
          </span>
          <p className="text-slate-500 text-sm mt-2 font-medium">Create a strong new password for your account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(176,230,226,0.4)' }}
        >
          {success ? (
            <div className="text-center py-6">
              <FiCheckCircle size={52} className="mx-auto mb-3" style={{ color: '#10B981' }} />
              <p className="font-black text-slate-800 text-sm">Password updated successfully!</p>
              <p className="text-xs text-slate-550 mt-1">Redirecting to login portal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="p-3 rounded-xl text-xs font-semibold border"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
                >
                  {error}
                </div>
              )}

              {/* Email (Read Only Display) */}
              {email && (
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Resetting Account for</span>
                  <span className="text-xs font-bold text-slate-700">{email}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FFFFFF', border: '1.5px solid #AEC8C8', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => e.target.style.borderColor = '#3AAFAA'}
                    onBlur={e => e.target.style.borderColor = '#AEC8C8'}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FFFFFF', border: '1.5px solid #AEC8C8', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }}
                    onFocus={e => e.target.style.borderColor = '#3AAFAA'}
                    onBlur={e => e.target.style.borderColor = '#AEC8C8'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #3AAFAA 0%, #237F7B 100%)', boxShadow: '0 4px 18px rgba(58,175,170,0.25)' }}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 font-bold text-xs pt-1 hover:opacity-80 transition-opacity"
                style={{ color: '#237F7B' }}
              >
                <FiArrowLeft size={14} />
                <span>Return to Login</span>
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
