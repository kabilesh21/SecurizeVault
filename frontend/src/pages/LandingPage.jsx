import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCpu, FiFileText, FiGitBranch, FiTrendingUp, FiSearch, FiGrid } from 'react-icons/fi';

const LandingPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await login(usernameOrEmail, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col justify-between items-center overflow-x-hidden px-4 py-12 md:py-16 selection:bg-[#B8864B]/20"
      style={{ background: 'linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 50%, #FAF5EE 100%)' }}
    >
      {/* Decorative Blob Shapes (Positioned organically matching the Mangools layout) */}
      <div
        className="absolute top-1/4 right-[12%] w-48 h-48 md:w-64 md:h-64 pointer-events-none -z-10 opacity-70 animate-pulse"
        style={{
          background: 'linear-gradient(135deg, #E5D3BC 0%, #B8864B 100%)',
          borderRadius: '43% 57% 73% 27% / 45% 40% 60% 55%',
          animationDuration: '6s'
        }}
      />
      <div
        className="absolute bottom-1/3 left-[10%] w-28 h-28 md:w-36 md:h-36 pointer-events-none -z-10 opacity-70 animate-pulse"
        style={{
          background: 'linear-gradient(135deg, #E5D3BC 0%, #B8864B 100%)',
          borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
          animationDuration: '8s'
        }}
      />

      {/* Top Header - Brand Logo and Title */}
      <header className="flex flex-col items-center z-10 w-full">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-[#B8864B] flex items-center justify-center text-white shadow-md">
            <FiCpu size={16} />
          </div>
          <span className="text-2xl font-black font-sans tracking-tight text-slate-800">
            Memory<span className="text-sky-500 font-extrabold">Verse</span> <span className="text-xs uppercase bg-[#B8864B]/15 text-[#9C6E39] px-2 py-0.5 rounded font-extrabold align-middle">AI</span>
          </span>
        </div>

        {/* Good to see you again Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
          Good to see you again
        </h2>
      </header>

      {/* Centered Login Card */}
      <main className="w-full max-w-md my-8 md:my-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100/80"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="p-3.5 rounded-xl text-xs font-semibold border"
                style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            {/* Email / Username Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your email or username</label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#B8864B] transition-all bg-slate-50">
                <div className="flex items-center justify-center w-12 border-r border-slate-200 bg-slate-50 text-slate-400">
                  <FiMail size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. elon@tesla.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs text-slate-800 bg-transparent outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your password</label>
              <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#B8864B] transition-all bg-slate-50">
                <div className="flex items-center justify-center w-12 border-r border-slate-200 bg-slate-50 text-slate-400">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="e.g. ilovememoryverse123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs text-slate-800 bg-transparent outline-none placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #B8864B 0%, #9C6E39 100%)', boxShadow: '0 4px 14px rgba(184,134,75,0.2)' }}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Links Row */}
          <div className="flex items-center justify-between text-xs font-bold mt-6 px-1">
            <Link to="/register" className="text-blue-600 hover:underline">
              Don't have an account?
            </Link>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Bottom Footer - Row of Module Pills */}
      <footer className="w-full max-w-5xl z-10 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm text-slate-700 hover:scale-[1.02] transition-transform select-none">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
              <FiFileText className="text-red-500" size={13} />
              AI Ingestion
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm text-slate-700 hover:scale-[1.02] transition-transform select-none">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
              <FiGitBranch className="text-amber-500" size={13} />
              Graph Builder
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm text-slate-700 hover:scale-[1.02] transition-transform select-none">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
              <FiTrendingUp className="text-indigo-500" size={13} />
              Gap Analysis
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm text-slate-700 hover:scale-[1.02] transition-transform select-none">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
              <FiSearch className="text-blue-500" size={13} />
              Semantic Search
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-2xl shadow-sm text-slate-700 hover:scale-[1.02] transition-transform select-none">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
              <FiGrid className="text-emerald-500" size={13} />
              Dashboard
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
