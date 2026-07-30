import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

const ComingSoon = ({ title, description }) => {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center max-w-lg"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6 shadow-xl shadow-indigo-500/5 animate-pulse">
          <FiCpu size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white sm:text-4xl mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
          {description}
        </p>
        <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400 ring-1 ring-slate-900/10 dark:ring-white/10 hover:ring-slate-900/20 dark:hover:ring-white/20">
          Module implementation coming soon. {' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">MemoryVerse AI</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
