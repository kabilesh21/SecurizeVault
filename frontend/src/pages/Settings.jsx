import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiShield, FiBell, FiLock } from 'react-icons/fi';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your personal preferences and system settings.</p>
      </div>

      <div className="glass-panel p-6 divide-y divide-slate-200/50 dark:divide-slate-800/80 space-y-6">
        
        {/* Theme Settings */}
        <div className="pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {isDark ? <FiMoon size={18} /> : <FiSun size={18} />}
              <span>Application Theme</span>
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">Toggle between system light and dark UI modes.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-150 text-indigo-650 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition-all duration-300"
          >
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Security Settings */}
        <div className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiLock size={18} />
              <span>Password & Security</span>
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">Update credentials and manage secure session tokens.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-900 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-all">
            Manage Credentials
          </button>
        </div>

        {/* Notifications */}
        <div className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiBell size={18} />
              <span>Notifications</span>
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">Control browser alerts and email report notifications.</p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" id="notification-switch" />
            <label htmlFor="notification-switch" className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></label>
          </div>
        </div>

        {/* Platform Integrity */}
        <div className="pt-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiShield size={18} />
              <span>Data & Privacy</span>
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">Download a full index export or request account deletion.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 transition-all">
            Delete Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
