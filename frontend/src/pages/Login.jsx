import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #EBF6F6 0%, #DDF4F1 50%, #F4F9F9 100%)' }}
    >
      {/* Soft decorative blobs */}
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
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-2xl font-black font-sans tracking-tight text-slate-800">
            Securize<span className="text-indigo-600 font-extrabold">Vault</span>
          </span>
          <p className="text-slate-500 text-sm mt-2 font-medium">Your AI-powered personal knowledge hub</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(176,230,226,0.4)' }}>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl text-xs font-semibold border"
                style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                {error}
              </div>
            )}

            {/* Username/Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Username or Email
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #AEC8C8',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3AAFAA'}
                  onBlur={e => e.target.style.borderColor = '#AEC8C8'}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                <Link to="/forgot-password"
                  className="text-xs font-bold hover:opacity-80 transition-opacity"
                  style={{ color: '#237F7B' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-slate-400" size={15} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #AEC8C8',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3AAFAA'}
                  onBlur={e => e.target.style.borderColor = '#AEC8C8'}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #3AAFAA 0%, #237F7B 100%)', boxShadow: '0 4px 18px rgba(58,175,170,0.25)' }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-slate-500 text-xs mt-6 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-extrabold hover:opacity-80 transition-opacity" style={{ color: '#237F7B' }}>
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
