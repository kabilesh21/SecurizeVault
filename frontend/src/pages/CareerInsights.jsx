import React, { useEffect, useState } from 'react';
import { FiBriefcase, FiAward, FiCpu, FiCheckCircle, FiSearch, FiBookOpen } from 'react-icons/fi';
import { TbRobot } from 'react-icons/tb';
import { careerService } from '../services/api';

const CareerInsights = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [allPaths, setAllPaths] = useState([]);
  const [showOnlyMatches, setShowOnlyMatches] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const recsRes = await careerService.getRecommendations();
      setRecommendations(recsRes.data || []);
      const allRes = await careerService.getAll();
      setAllPaths(allRes.data || []);
    } catch (err) {
      console.error("Failed to load career insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const displayedPaths = showOnlyMatches 
    ? recommendations 
    : allPaths.map(p => {
        // Try to find if this path is in recommendations to show the match stats
        const match = recommendations.find(r => r.careerPathId === p.id);
        return {
          id: p.id,
          careerPathId: p.id,
          name: p.name,
          industry: p.industry,
          description: p.description,
          requiredSkills: p.requiredSkills,
          confidenceScore: match ? match.confidenceScore : 0,
          reason: match ? match.reason : "Based on your current documents, there isn't enough matching evidence for this pathway."
        };
      });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">AI Career Insights & Recommendations</h1>
          <p className="text-xs text-slate-600 mt-1">AI-driven pathway analysis matching your credentials to industry opportunities.</p>
        </div>
        
        {/* Toggle option */}
        <div className="flex bg-white/70 border border-slate-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setShowOnlyMatches(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showOnlyMatches ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            Matches
          </button>
          <button 
            onClick={() => setShowOnlyMatches(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!showOnlyMatches ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            All Pathways
          </button>
        </div>
      </div>

      {/* Main listing */}
      <div className="grid grid-cols-1 gap-6">
        {displayedPaths.length > 0 ? (
          displayedPaths.map((path) => {
            const hasMatch = path.confidenceScore > 0;
            return (
              <div 
                key={path.id || path.careerPathId}
                className="glass-panel p-6 bg-white/70 border-slate-100 hover:border-sky-500/50 transition-all flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Pathway Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 border border-slate-100 text-indigo-650 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiBriefcase size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{path.name}</h3>
                      <span className="text-[10px] bg-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-md font-bold tracking-wider uppercase">{path.industry}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{path.description}</p>

                  {/* Required Skills tags */}
                  {path.requiredSkills && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {path.requiredSkills.split(',').map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-150 text-[10px] text-slate-600 font-semibold"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Reason */}
                  {hasMatch && (
                    <div className="p-3 bg-sky-500/10 border border-sky-200/50 rounded-xl text-[11px] text-slate-700 leading-relaxed">
                      <TbRobot size={14} className="inline mr-1 text-sky-500" />
                      <strong>Match Reasoning:</strong> {path.reason}
                    </div>
                  )}
                </div>

                {/* Compatibility Stats */}
                <div className="md:w-56 flex flex-col justify-center items-center p-4 bg-slate-50 border border-slate-150 rounded-2xl flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Compatibility</span>
                  <div className="relative flex items-center justify-center my-3">
                    <svg className="w-20 h-20">
                      <circle 
                        className="text-slate-200" 
                        strokeWidth="5" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="30" 
                        cx="40" 
                        cy="40" 
                      />
                      <circle 
                        className="text-sky-500" 
                        strokeWidth="5" 
                        strokeDasharray={188.4}
                        strokeDashoffset={188.4 - (188.4 * (hasMatch ? path.confidenceScore : 0)) / 100}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="30" 
                        cx="40" 
                        cy="40" 
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-slate-800">
                      {hasMatch ? `${Math.round(path.confidenceScore)}%` : '0%'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${hasMatch ? 'bg-emerald-50 text-emerald-650' : 'bg-red-50 text-red-650'}`}>
                    {hasMatch ? 'Compatible' : 'Unmatched'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white/70 border border-slate-100 rounded-2xl">
            <FiSearch size={48} className="mx-auto mb-3 text-slate-400" />
            <h3 className="font-extrabold text-slate-800 text-sm">No Compatible Pathways Found</h3>
            <p className="text-xs text-slate-600 mt-1">Upload resumes, certificates, and portfolio links in the Upload Center to analyze compatibility.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerInsights;
