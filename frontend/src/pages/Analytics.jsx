import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiActivity, FiCpu, FiAward, FiLayers, FiList, FiAlertTriangle } from 'react-icons/fi';
import { userService, categorizationService } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const statsRes = await userService.getStats();
      setStats(statsRes.data);
      const skillsRes = await categorizationService.getSkills();
      setSkills(skillsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  // Calculate stats for chart
  const categoriesCount = {
    RESUME: stats?.resumeCount || 0,
    CERTIFICATE: stats?.certificatesCount || 0,
    PROJECT: stats?.projectsCount || 0,
    INTERNSHIP: stats?.internshipsCount || 0,
  };

  const chartData = {
    labels: ['Resumes', 'Certificates', 'Projects', 'Internships'],
    datasets: [
      {
        label: 'Documents',
        data: [categoriesCount.RESUME, categoriesCount.CERTIFICATE, categoriesCount.PROJECT, categoriesCount.INTERNSHIP],
        backgroundColor: [
          'rgba(140, 91, 112, 0.7)',  // Mulberry
          'rgba(184, 134, 75, 0.7)',  // Sandalwood Tan Accent
          'rgba(245, 194, 155, 0.7)', // Apricot
          'rgba(96, 125, 139, 0.7)',  // Dusty Blue-Gray
        ],
        borderColor: [
          '#8c5b70',
          '#B8864B',
          '#f5c29b',
          '#607d8b',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Profile completeness helper
  const totalDocs = stats?.totalDocuments || 0;
  const completeness = Math.min(100, Math.round((totalDocs > 0 ? 30 : 0) + (skills.length > 0 ? 40 : 0) + ((stats?.portfolioLinksCount || 0) > 0 ? 30 : 0)));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Skills Gap & Portfolio Analytics</h1>
        <p className="text-xs text-slate-600 mt-1">Detailed statistical insights into your digital accomplishments, category splits, and skill metrics.</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completeness Card */}
        <div className="glass-panel p-6 bg-white/70 border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Strength</span>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{completeness}%</h3>
            <p className="text-[11px] text-slate-600 mt-1">Based on documents uploaded, skills parsed, and custom links added.</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
            <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${completeness}%` }}></div>
          </div>
        </div>

        {/* Total Documents Card */}
        <div className="glass-panel p-6 bg-white/70 border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Ingested Records</span>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{totalDocs}</h3>
            <p className="text-[11px] text-slate-600 mt-1">Successfully organized across primary indices.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-650 border border-slate-100">
            <FiLayers size={22} />
          </div>
        </div>

        {/* Top parsed skills */}
        <div className="glass-panel p-6 bg-white/70 border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Extracted Skill Keywords</span>
            <h3 className="text-3xl font-black text-slate-800 mt-2">{skills.length}</h3>
            <p className="text-[11px] text-slate-600 mt-1">Active skill sets extracted from your catalog context.</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650 border border-slate-100">
            <FiActivity size={22} />
          </div>
        </div>
      </div>

      {/* Detail breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution chart */}
        <div className="glass-panel p-6 bg-white/70 border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Category Index Allocation</h3>
            <p className="text-[11px] text-slate-600 mb-6">Visual split of files currently ingested in your database.</p>
          </div>
          {totalDocs > 0 ? (
            <div className="max-w-[240px] mx-auto">
              <Doughnut data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }} />
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <FiAlertTriangle size={36} className="mx-auto mb-2" />
              <p className="text-xs">No records ingested yet. Upload files to render charts.</p>
            </div>
          )}
        </div>

        {/* Extracted Skills List Card */}
        <div className="glass-panel p-6 bg-white/70 border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">Extracted Skill Inventory</h3>
            <p className="text-[11px] text-slate-600 mb-4">Competencies detected by the AI Categorization pipeline.</p>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">#{index+1}</span>
                    <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-650 border border-slate-100">
                    {skill.proficiencyLevel || 'INTERMEDIATE'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FiList size={36} className="mx-auto mb-2" />
                <p className="text-xs">No skills extracted. Ingest resumes or certificates first.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
