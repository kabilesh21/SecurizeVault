import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiUser } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/60 backdrop-blur-md px-6 md:px-8">
      {/* Welcome Greeting & Brand */}
      <div className="flex items-center gap-4">
        {/* Project Name */}
        <span className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100 pr-4 border-r border-slate-200">
          Securize<span className="text-sky-500 font-extrabold">Vault</span>
        </span>
        <div>
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Welcome Back 👋,</h2>
          <p className="text-base font-black text-slate-800">{user?.username || 'Student'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* Mobile Menu Trigger */}
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-600 rounded-xl hover:bg-slate-100 md:hidden"
        >
          <FiMenu size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
