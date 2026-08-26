import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

const TermsOfUse = () => {
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
              <FiShield size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Terms of Use</h1>
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">1. Acceptance of Terms</h3>
            <p>
              By accessing and using SecurizeVault, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">2. Service Description</h3>
            <p>
              SecurizeVault is an intelligent Digital Identity System that stores, categorizes, and retrieves academic and professional credentials. All extracted details are analyzed using local parsers and state-of-the-art AI endpoints.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">3. User Credentials & Accounts</h3>
            <p>
              You are responsible for safeguarding the credentials you use to access SecurizeVault. You agree not to disclose your password to any third party. Our platform implements local CAPTCHA verification checks to ensure secure operations.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">4. Data Ownership & Intellectual Property</h3>
            <p>
              You retain all ownership rights to the certificates, resumes, and project reports you upload to the vault. SecurizeVault claims no intellectual property rights over user-provided materials.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">5. Limitation of Liability</h3>
            <p>
              SecurizeVault is provided on an "as is" and "as available" basis. We do not guarantee that the service will be uninterrupted or error-free. We shall not be liable for any indirect, incidental, or special damages arising out of your use of the platform.
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

export default TermsOfUse;
