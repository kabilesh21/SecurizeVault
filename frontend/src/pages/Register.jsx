import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const res = await register(username, email, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(res.error);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #F5EBE0 0%, #E3D5CA 50%, #FAF5EE 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(224,204,180,0.45) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(213,194,177,0.35) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-2xl font-black font-sans tracking-tight text-slate-800">
            Memory<span className="text-sky-500 font-extrabold">Verse</span> <span className="text-xs uppercase bg-sky-500/15 text-sky-700 px-2 py-0.5 rounded font-extrabold align-middle">AI</span>
          </span>
          <p className="text-slate-500 text-sm mt-2 font-medium">Begin building your digital portfolio</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(224,204,180,0.6)' }}
        >
          {success ? (
            <div className="text-center py-6">
              <FiCheckCircle size={48} className="mx-auto mb-3" style={{ color: '#10B981' }} />
              <p className="font-bold text-slate-700 text-sm">Registration successful!</p>
              <p className="text-xs text-slate-500 mt-1">Redirecting you to login...</p>
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

              {/* Username */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Username</label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="student123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E5D3BC', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}
                    onFocus={e => e.target.style.borderColor = '#B8864B'}
                    onBlur={e => e.target.style.borderColor = '#E5D3BC'}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E5D3BC', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}
                    onFocus={e => e.target.style.borderColor = '#B8864B'}
                    onBlur={e => e.target.style.borderColor = '#E5D3BC'}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-slate-400" size={15} />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 outline-none transition-all duration-300 placeholder-slate-400"
                    style={{ background: '#FAF6F0', border: '1.5px solid #E5D3BC', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)' }}
                    onFocus={e => e.target.style.borderColor = '#B8864B'}
                    onBlur={e => e.target.style.borderColor = '#E5D3BC'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #B8864B 0%, #9C6E39 100%)', boxShadow: '0 4px 18px rgba(184,134,75,0.25)' }}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold hover:opacity-80 transition-opacity" style={{ color: '#7E5529' }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
