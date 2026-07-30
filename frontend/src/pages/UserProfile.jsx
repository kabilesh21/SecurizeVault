import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { FiUser, FiMail, FiShield, FiLink, FiGithub, FiExternalLink } from 'react-icons/fi';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getProfile()
      .then(res => {
        setProfile(res.data);
      })
      .catch(err => {
        console.error("Could not fetch user profile", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">User Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view your academic digital profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card - Avatar */}
        <div className="glass-panel p-6 flex flex-col items-center text-center space-y-4">
          <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 text-4xl font-bold uppercase">
            {profile?.username?.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{profile?.username}</h3>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full uppercase tracking-wider mt-1 inline-block">
              {profile?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        {/* Right Card - Profile Details */}
        <div className="glass-panel p-6 md:col-span-2 space-y-6">
          <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Account Details</h4>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5 font-medium">Basic information regarding your account</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl">
              <FiUser className="text-slate-400" size={20} />
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Username</label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile?.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl">
              <FiMail className="text-slate-400" size={20} />
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Email Address</label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl">
              <FiShield className="text-slate-400" size={20} />
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Access Scope</label>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Linked Repositories & Portfolios */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-6 space-y-4">
            <div>
              <h4 className="text-md font-bold text-slate-800 dark:text-white">Linked Digital Assets</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">Connected external links</p>
            </div>

            {profile?.links && profile.links.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.links.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-center justify-between group hover:border-indigo-500 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      {link.platformName === 'GITHUB' ? (
                        <FiGithub className="text-slate-600 dark:text-slate-400" size={20} />
                      ) : (
                        <FiLink className="text-slate-600 dark:text-slate-400" size={20} />
                      )}
                      <div>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 block uppercase font-bold tracking-wider">{link.platformName}</span>
                        <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 truncate max-w-[150px] inline-block">{link.url.replace('https://', '')}</span>
                      </div>
                    </div>
                    <FiExternalLink className="text-slate-450 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No external portfolios or repository links connected yet. Link them in the Upload Center.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
