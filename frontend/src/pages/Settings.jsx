import React, { useState } from 'react';
import { FiShield, FiBell, FiLock } from 'react-icons/fi';
import { userService } from '../services/api';

const Settings = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2 });
    setCaptchaInput('');
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    generateCaptcha();
    setShowChangePassword(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    const expected = captchaQuestion.num1 + captchaQuestion.num2;
    if (parseInt(captchaInput) !== expected) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      return;
    }

    setSubmitting(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword
      });
      setSuccess("Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCaptchaInput('');
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error("Change password failed", err);
      setError(err.response?.data?.message || "Failed to change password. Make sure current password is correct.");
      generateCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your personal preferences and system settings.</p>
      </div>

      <div className="glass-panel p-6 divide-y divide-slate-200/50 dark:divide-slate-800/80 space-y-6">
        
        {/* Security Settings */}
        <div className="pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FiLock size={18} />
                <span>Password & Security</span>
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">Update credentials and manage secure session tokens.</p>
            </div>
            {!showChangePassword && (
              <button 
                onClick={handleOpenChangePassword}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-900 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-all"
              >
                Manage Credentials
              </button>
            )}
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl space-y-4 max-w-md">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Change Password</h4>
              
              {error && <p className="text-xs text-red-500 font-semibold bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">{error}</p>}
              {success && <p className="text-xs text-emerald-500 font-semibold bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">{success}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                {/* CAPTCHA Section */}
                <div className="p-3 bg-slate-150/40 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider mb-1.5">Security Check (CAPTCHA)</label>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 tracking-widest select-none">
                      {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                    </span>
                    <input 
                      type="number" 
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Answer"
                      className="w-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
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
