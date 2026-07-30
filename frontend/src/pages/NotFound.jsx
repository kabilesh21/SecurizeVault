import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white text-center px-4">
      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md relative z-10 space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/5">
          <FiAlertTriangle size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Milestone Missing</h2>
          <p className="text-slate-450 dark:text-slate-400 text-sm max-w-sm mx-auto">
            The path you are looking for has not been ingested, or has been relocated in memory.
          </p>
        </div>
        <div className="pt-4">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <FiArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
