import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiUser } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md px-6 md:px-8">
      {/* Mobile Menu Trigger & Welcome */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <div className="hidden md:block">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Welcome Back,</h2>
          <p className="text-base font-black text-slate-800">{user?.username || 'Student'}</p>
        </div>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Clickable User Profile Badge */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 pl-3 py-1 pr-2 border-l border-slate-200 cursor-pointer hover:bg-sky-500/10 active:scale-95 rounded-xl transition-all duration-300 group"
          title="View User Profile"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
            <FiUser size={16} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-700 group-hover:text-sky-700 transition-colors">{user?.username || 'Guest'}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">Student Profile</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
