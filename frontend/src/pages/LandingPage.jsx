import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { FiMail, FiLock, FiEye, FiEyeOff, FiFileText, FiGitBranch, FiTrendingUp, FiSearch, FiGrid, FiUser } from 'react-icons/fi';

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
      className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-teal-500/20 overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #F4F9F9 0%, #DDF4F1 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-6xl w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px] relative"
      >
        {/* Floating Capsule Blobs - Scattered across both left and right sides of the card wrapper */}
        <div className="absolute -top-12 -left-16 w-48 h-96 rounded-full bg-gradient-to-b from-teal-200/40 to-teal-400/50 transform rotate-[32deg] pointer-events-none z-0" />
        <div className="absolute top-16 left-6 w-32 h-64 rounded-full bg-gradient-to-b from-teal-100/30 to-indigo-300/40 transform rotate-[32deg] pointer-events-none z-0" />
        <div className="absolute -bottom-16 left-16 w-44 h-56 rounded-full bg-gradient-to-tr from-amber-100/40 via-teal-200/40 to-teal-300/50 transform rotate-[32deg] pointer-events-none z-0" />
        <div className="absolute -top-10 right-20 w-36 h-64 rounded-full bg-gradient-to-bl from-teal-100/30 to-teal-200/40 transform rotate-[32deg] pointer-events-none z-0" />
        <div className="absolute -bottom-12 right-6 w-40 h-56 rounded-full bg-gradient-to-tr from-indigo-100/30 via-teal-100/40 to-teal-200/50 transform rotate-[32deg] pointer-events-none z-0" />

        {/* Center Vertical Curved S-Curve Divider Line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 pointer-events-none hidden md:block z-20">
          <svg className="h-full w-full text-slate-100 fill-none stroke-current" viewBox="0 0 100 1000" preserveAspectRatio="none">
            <path d="M 50 0 C 85 250, 15 750, 50 1000" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="md:w-1/2 flex items-center justify-center p-8 min-h-[250px] md:min-h-full bg-transparent z-10">
          {/* Left Side Branding Overlay */}
          <div className="text-center space-y-4 max-w-xs drop-shadow-sm px-4">
            <img src={logo} alt="SecurizeVault Logo" className="h-28 w-auto object-contain mx-auto pointer-events-none" />
            <p className="text-xs text-slate-550 font-bold leading-relaxed pt-2">
              Unlock the power of your academic records. Trace skill pathways to industry careers.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Login Form Side */}
        <div className="md:w-1/2 flex flex-col justify-center px-8 py-10 md:px-14 lg:px-16 bg-transparent z-10">
          <div className="max-w-sm w-full mx-auto space-y-6">
            
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">SecurizeVault</h2>
              <p className="text-slate-400 text-xs font-semibold">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="p-3.5 rounded-xl text-xs font-semibold border"
                  style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
                >
                  {error}
                </div>
              )}

              {/* Username Input with icon on the LEFT */}
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-xs text-slate-850 bg-slate-100/70 border border-transparent rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder-slate-400 font-medium"
                  required
                />
              </div>

              {/* Password Input with icon on the LEFT */}
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 text-xs text-slate-855 bg-slate-100/70 border border-transparent rounded-xl outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>

              {/* Submit Button with teal gradient */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 shadow shadow-teal-500/10 active:scale-[0.98] transition-all tracking-wider uppercase mt-2"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto"></div>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>

            {/* Links Section */}
            <div className="flex flex-col items-center gap-3 text-xs font-semibold pt-2">
              <Link to="/forgot-password" className="hover:underline text-[11px] text-slate-400 hover:text-slate-600">
                Forgot Username / Password?
              </Link>
              <Link to="/register" className="hover:underline text-xs text-slate-600 hover:text-slate-800">
                Create Your Account &rarr;
              </Link>
            </div>

            {/* Bottom Footer Info */}
            <div className="text-center text-[10px] text-slate-400 font-medium pt-4 space-x-2 border-t border-slate-100">
              <a href="/terms" className="hover:underline hover:text-slate-600 transition-colors">Terms of use</a>
              <span>•</span>
              <a href="/privacy" className="hover:underline hover:text-slate-600 transition-colors">Privacy policy</a>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
