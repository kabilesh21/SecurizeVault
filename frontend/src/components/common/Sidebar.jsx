import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiUploadCloud, FiSearch, FiCalendar, 
  FiShare2, FiCpu, FiBarChart2, FiBriefcase, 
  FiShield, FiUser, FiSettings, FiLogOut, FiMenu, FiFolder, FiGitCommit 
} from 'react-icons/fi';

import { TbRobot } from 'react-icons/tb';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Upload Center', path: '/upload', icon: FiUploadCloud },
    { name: 'AI Organization', path: '/organization', icon: FiFolder },
    { name: 'Knowledge Graph', path: '/graph', icon: FiShare2 },
    { name: 'Relationship Explorer', path: '/relationships', icon: FiGitCommit },
    { name: 'Semantic Search', path: '/search', icon: FiSearch },
    { name: 'Milestone Timeline', path: '/timeline', icon: FiCalendar },
    { name: 'AI Assistant', path: '/assistant', icon: TbRobot },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart2 },
    { name: 'Career Insights', path: '/career', icon: FiBriefcase },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    menuItems.push({ name: 'Admin Dashboard', path: '/admin', icon: FiShield });
  }

  const userItems = [
    { name: 'User Profile', path: '/profile', icon: FiUser },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-semibold border-l-4 border-indigo-600 transition-all duration-200";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all duration-200";

  return (
    <aside className={`fixed inset-y-0 right-0 z-40 w-72 transform bg-white/80 dark:bg-slate-900/90 border-l border-slate-200/80 dark:border-slate-850 backdrop-blur-lg transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col justify-between px-6 py-6">
        <div className="flex-1 overflow-y-auto pr-1 mb-4">
          {/* User Profile Header */}
          <div className="flex flex-col items-center text-center p-4 mb-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
            <Link 
              to="/profile" 
              onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 mb-2 hover:bg-indigo-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
              title="View Profile Details"
            >
              <FiUser size={20} />
            </Link>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-full">{user?.username || 'Guest'}</h4>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Student Profile</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-semibold break-all max-w-[200px]">{user?.email || 'kabilesh@securizevault.com'}</p>
            {/* Close btn for mobile */}
            <button className="md:hidden absolute top-3 right-3 p-1.5 text-slate-400 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800" onClick={toggleSidebar}>
              <FiMenu size={16} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}

            <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-4 mx-4" />

            {userItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
                className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer profile & logout */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button 
            onClick={logout} 
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-all duration-200"
          >
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
