import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { FiUser, FiMail, FiShield, FiLink, FiGithub, FiExternalLink, FiEdit3 } from 'react-icons/fi';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = () => {
    userService.getProfile()
      .then(res => {
        setProfile(res.data);
        setEditUsername(res.data.username || '');
        setEditEmail(res.data.email || '');
      })
      .catch(err => {
        console.error("Could not fetch user profile", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim()) {
      setError("Username and email cannot be empty");
      return;
    }
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await userService.updateProfile({
        username: editUsername.trim(),
        email: editEmail.trim()
      });
      setProfile(res.data);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setUpdating(false);
    }
  };

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

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-left text-xs">
            <div className="flex justify-between items-center text-slate-550 dark:text-slate-400">
              <span className="font-semibold">Account Tier</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Standard Tier</span>
            </div>
            <div className="flex justify-between items-center text-slate-550 dark:text-slate-400">
              <span className="font-semibold">Vault Security</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <FiShield size={12} />
                <span>Protected</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-550 dark:text-slate-400">
              <span className="font-semibold">Session Status</span>
              <span className="font-bold text-sky-500">Active</span>
            </div>
          </div>
        </div>

        {/* Right Card - Profile Details */}
        <div className="glass-panel p-6 md:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">Account Details</h4>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5 font-medium">Basic information regarding your account</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <FiEdit3 size={13} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-500 font-semibold bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">{error}</p>}
          {success && <p className="text-xs text-emerald-500 font-semibold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">{success}</p>}

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl">
                <FiUser className="text-slate-400 shrink-0" size={20} />
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">Username</label>
                  <input 
                    type="text" 
                    value={editUsername} 
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl">
                <FiMail className="text-slate-400 shrink-0" size={20} />
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 rounded-xl opacity-60">
                <FiShield className="text-slate-400 shrink-0" size={20} />
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">Access Scope</label>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile?.role}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setEditUsername(profile.username);
                    setEditEmail(profile.email);
                    setIsEditing(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          ) : (
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
          )}

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
