import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiShield, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex h-20 w-full items-center justify-between px-6 max-w-7xl mx-auto md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            MemoryVerse AI
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-xl text-slate-300 hover:text-white transition-colors duration-200">
            Login
          </Link>
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200">
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
            <FiCpu size={16} />
            <span>AI-Powered Digital Identity</span>
          </div>

          <h1 className="text-5xl font-extrabold sm:text-7xl mb-8 tracking-tight bg-gradient-to-r from-white via-indigo-200 to-sky-300 bg-clip-text text-transparent">
            Your Digital Identity, <br />Powered by AI.
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            MemoryVerse AI intelligently stores, organizes, connects, and retrieves your academic and professional accomplishments. Build a semantic graph of your skills, certificates, and projects.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-105">
              <span>Start Ingesting Portfolio</span>
              <FiArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/15 text-white border border-white/15 px-8 py-4 rounded-xl font-semibold backdrop-blur-md transition-all duration-300 hover:scale-105">
              Access Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full text-left"
        >
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
              <FiCpu size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Data Ingestion</h3>
            <p className="text-slate-400 leading-relaxed">
              Upload certificates, resumes, reports, and links. Our pipeline runs OCR and extracts metadata to categorize your documents instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6">
              <FiShield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Identity Graph</h3>
            <p className="text-slate-400 leading-relaxed">
              Connect your achievements and skills automatically to build a searchable knowledge graph representing your professional footprint.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <FiTrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Career Growth</h3>
            <p className="text-slate-400 leading-relaxed">
              Compare your credentials with real-world requirements. Reveal skills gaps and unlock personalized learning path insights.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2026 MemoryVerse AI. All rights reserved. Hackathon Version 1.0.0.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
