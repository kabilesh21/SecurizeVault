import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLock } from 'react-icons/fi';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8"
      style={{ background: 'linear-gradient(135deg, #F4F9F9 0%, #DDF4F1 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100/80 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <FiLock size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Privacy Policy</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Effective August 2026</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all border border-slate-150">
            <FiArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-h-[350px] overflow-y-auto pr-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">1. Information We Collect</h3>
            <p>
              We collect information that you directly upload to SecurizeVault, including certificates, resumes, portfolio link paths, and project reports. We also collect profile account information such as usernames and email addresses.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">2. How We Use Your Data</h3>
            <p>
              Your data is processed locally to extract metadata, skills, entities, and relationships. These details are stored in databases and local ChromaDB stores to construct your secure personal digital search index.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">3. Data Security</h3>
            <p>
              SecurizeVault implements technical and administrative measures to secure your data from unauthorized access or alteration. Password tokens are encrypted on our server endpoints, and account access requires a secure session.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">4. Third-Party Integrations</h3>
            <p>
              When utilizing advanced AI modules, data is securely processed via stable Google Gemini REST gateway endpoints. We do not sell, rent, or share your private portfolio uploads with third-party advertisers.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">5. Your Data Rights</h3>
            <p>
              You have the right to edit your account profile username and email address, download a full export index, or permanently delete your profile database records at any time via the user preferences dashboard.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
          SecurizeVault Platform &copy; 2026. All rights reserved.
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
