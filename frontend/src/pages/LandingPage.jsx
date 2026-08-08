import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCpu, FiAward, FiShield, FiFileText, FiGitBranch, FiTrendingUp, FiActivity, FiLayers } from 'react-icons/fi';

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
      className="relative min-h-screen flex flex-col justify-center items-center overflow-x-hidden px-4 sm:px-8 py-12 md:py-20"
      style={{ background: 'linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 50%, #FAF5EE 100%)' }}
    >
      {/* Inject custom CSS animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-1.5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 9s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>

      {/* Decorative large glowing backdrop circles */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(224,204,180,0.55) 0%, transparent 70%)' }} />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(213,194,177,0.45) 0%, transparent 70%)' }} />

      {/* Header Container */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-16 z-20 px-2 sm:px-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black font-sans tracking-tight text-slate-800">
            Memory<span className="text-sky-500 font-extrabold">Verse</span> <span className="text-xs uppercase bg-sky-500/15 text-sky-700 px-2 py-0.5 rounded font-extrabold align-middle">AI</span>
          </span>
        </div>
      </header>

      {/* Main Grid: Responsive split panel */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10 px-2 sm:px-4">
        
        {/* Left Side: Neat Project Title, Search, and Create Account CTA */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center lg:items-start text-center lg:text-left z-10 pt-16 lg:pt-0">
          <span className="text-sm font-black text-[#9C6E39] tracking-widest uppercase mb-3">Welcome to</span>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black font-sans tracking-tight text-slate-800 leading-none">
            Memory<span className="text-sky-500 font-black">Verse</span> <span className="text-xs uppercase bg-sky-500/15 text-sky-700 px-3 py-1 rounded-lg font-black align-middle">AI</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-4 font-bold max-w-md">
            Your AI-powered personal knowledge management system.
          </p>

          <p className="text-slate-500 text-xs sm:text-sm mt-6 leading-relaxed max-w-xl font-medium">
            MemoryVerse AI enables students and professionals to extract, structure, and search their academic and professional accomplishments. Securely parse your files and visualize your dynamic knowledge graph in real-time.
          </p>

          {/* Mock search interface representing platform search */}
          <div className="w-full max-w-lg mt-8 relative">
            <div className="flex items-center w-full bg-white/70 backdrop-blur-md border border-[#E5D3BC] rounded-2xl p-1.5 shadow-sm">
              <div className="flex items-center gap-2 px-3 text-slate-400 w-full">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search your certificates, skills, or projects..."
                  disabled
                  className="bg-transparent text-xs w-full outline-none text-slate-500 font-medium placeholder-slate-400 cursor-not-allowed"
                />
              </div>
              <button className="bg-[#B8864B] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0 cursor-not-allowed opacity-95 hover:bg-[#9c6e39] transition-all">
                Search
              </button>
            </div>
          </div>

          {/* Create Account call-to-action placed right near the search input */}
          <div className="flex items-center gap-3 mt-5 px-1">
            <span className="text-xs text-slate-500 font-bold">New here?</span>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #B8864B 0%, #9C6E39 100%)', boxShadow: '0 4px 14px rgba(184,134,75,0.2)' }}
            >
              <span>Create Account</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Side: Animated Connector Design & Glassmorphic Login Card */}
        <div className="lg:col-span-5 flex flex-col justify-center relative items-center">
          
          {/* Glowing orbital network diagram in the background */}
          <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-40">
            <svg className="w-full h-full max-w-md" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="250" cy="250" r="180" stroke="#B8864B" strokeWidth="1" strokeDasharray="4 6" className="animate-spin-slow" />
              <circle cx="250" cy="250" r="110" stroke="#E3D5CA" strokeWidth="1.5" />
              
              <line x1="250" y1="250" x2="100" y2="120" stroke="#B8864B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="250" y1="250" x2="380" y2="150" stroke="#B8864B" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="250" y1="250" x2="300" y2="380" stroke="#B8864B" strokeWidth="1" strokeDasharray="3 3" />
              
              <circle cx="100" cy="120" r="8" fill="#B8864B" />
              <circle cx="380" cy="150" r="6" fill="#9C6E39" />
              <circle cx="300" cy="380" r="10" fill="#E3D5CA" />
            </svg>
          </div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-md rounded-3xl p-8 md:p-10 shadow-2xl relative"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(25px)', border: '1px solid rgba(224,204,180,0.65)' }}
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-slate-800">Welcome Back 👋</h3>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">Sign in to continue to MemoryVerse AI</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="p-3.5 rounded-xl text-xs font-semibold border"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
                >
                  {error}
                </div>
              )}

              {/* Email / Username field */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Username or Email</label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="you@university.edu"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3.5 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E5D3BC', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}
                    onFocus={e => e.target.style.borderColor = '#B8864B'}
                    onBlur={e => e.target.style.borderColor = '#E5D3BC'}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-bold hover:underline" style={{ color: '#7E5529' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-11 py-3.5 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E5D3BC', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}
                    onFocus={e => e.target.style.borderColor = '#B8864B'}
                    onBlur={e => e.target.style.borderColor = '#E5D3BC'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded text-[#B8864B] focus:ring-[#B8864B] border-slate-300"
                />
                <label htmlFor="remember" className="text-[10px] text-slate-500 font-bold select-none cursor-pointer">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-xs text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #B8864B 0%, #9C6E39 100%)', boxShadow: '0 4px 18px rgba(184,134,75,0.25)' }}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Secure Lock Alert Footer */}
            <div className="mt-6 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#B8864B]/5 border border-[#B8864B]/10">
              <FiShield className="text-[#9C6E39]" size={12} />
              <span className="text-[9px] font-bold text-slate-600">Your data is safe and private with us.</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Clean Professional Footer */}
      <footer className="mt-16 w-full max-w-7xl mx-auto border-t border-[#E5D3BC]/40 pt-8 text-center text-slate-500 text-[10px] z-10 px-2 sm:px-4">
        <p>&copy; 2026 MemoryVerse AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
