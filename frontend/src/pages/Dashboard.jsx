import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService, categorizationService, relationshipService, timelineService } from '../services/api';
import { 
  FiFileText, FiAward, FiBookOpen, FiBriefcase, 
  FiLink, FiGithub, FiActivity, FiCpu, FiPlus, 
  FiChevronRight, FiGrid, FiGitCommit, FiLayers,
  FiCalendar, FiTrendingUp, FiStar, FiZap, FiSearch
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    certificatesCount: 0,
    resumeCount: 0,
    projectsCount: 0,
    internshipsCount: 0,
    portfolioLinksCount: 0,
    githubLinksCount: 0
  });
  
  const [skills, setSkills] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Graph stats
  const [graphStats, setGraphStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    strongEdges: 0,
    avgConfidence: 0,
    topSkill: 'N/A',
    topProject: 'N/A'
  });
  const [recommendedCareer, setRecommendedCareer] = useState(null);
  const [journeySummary, setJourneySummary] = useState(null);
  const [recentMilestones, setRecentMilestones] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await userService.getStats();
        setStats(statsRes.data);
        
        const skillsRes = await categorizationService.getSkills();
        setSkills(skillsRes.data);

        const docsRes = await categorizationService.getCategorizedDocuments();
        setRecentDocs(docsRes.data.slice(0, 4));

        // Fetch Graph Data
        const graphRes = await relationshipService.getKnowledgeGraph();
        const nodes = graphRes.data.nodes || [];
        const edges = graphRes.data.edges || [];

        // Calculate averages
        const avgConf = edges.length > 0
          ? Math.round((edges.reduce((sum, e) => sum + e.confidenceScore, 0) / edges.length) * 100)
          : 0;

        const strongCount = edges.filter(e => e.confidenceScore >= 0.85).length;

        // Calculate top skill by edge connections
        let topSkillName = 'N/A';
        let maxSkillConnections = 0;
        const skillNodes = nodes.filter(n => n.entityType === 'SKILL');
        
        for (const skill of skillNodes) {
          const connections = edges.filter(e => e.sourceNodeId === skill.id || e.targetNodeId === skill.id).length;
          if (connections > maxSkillConnections) {
            maxSkillConnections = connections;
            topSkillName = skill.name;
          }
        }

        // Calculate top project by edge connections
        let topProjectName = 'N/A';
        let maxProjectConnections = 0;
        const projectNodes = nodes.filter(n => n.entityType === 'PROJECT');
        
        for (const proj of projectNodes) {
          const connections = edges.filter(e => e.sourceNodeId === proj.id || e.targetNodeId === proj.id).length;
          if (connections > maxProjectConnections) {
            maxProjectConnections = connections;
            topProjectName = proj.name;
          }
        }

        setGraphStats({
          totalNodes: nodes.length,
          totalEdges: edges.length,
          strongEdges: strongCount,
          avgConfidence: avgConf,
          topSkill: topSkillName,
          topProject: topProjectName
        });

        // Fetch Career Recommendations
        const careerRes = await relationshipService.getRecommendations();
        if (careerRes.data && careerRes.data.length > 0) {
          setRecommendedCareer(careerRes.data[0]); // Top career path recommendation
        }

        // Fetch Timeline Journey Summary
        try {
          const [summaryRes, milestonesRes] = await Promise.all([
            timelineService.getSummary(),
            timelineService.getMilestones(),
          ]);
          setJourneySummary(summaryRes.data);
          setRecentMilestones((milestonesRes.data || []).slice(0, 3));
        } catch (timelineErr) {
          // Timeline data is optional — don't break dashboard
        }

      } catch (err) {
        console.error("Could not fetch dashboard assets", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statCards = [
    { name: 'Total Documents', value: stats.totalDocuments, icon: FiFileText, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { name: 'Certificates', value: stats.certificatesCount, icon: FiAward, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' },
    { name: 'Resumes', value: stats.resumeCount, icon: FiBookOpen, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { name: 'Projects', value: stats.projectsCount, icon: FiActivity, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30' },
  ];

  // Dynamic Chart.js category mapping
  const chartData = {
    labels: ['Certificates', 'Resumes', 'Projects', 'Internships', 'Others'],
    datasets: [
      {
        data: [
          stats.certificatesCount,
          stats.resumeCount,
          stats.projectsCount,
          stats.internshipsCount,
          Math.max(0, stats.totalDocuments - (stats.certificatesCount + stats.resumeCount + stats.projectsCount + stats.internshipsCount))
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(99, 102, 241, 0.7)',
        ],
        borderColor: [
          '#f59e0b',
          '#10b981',
          '#a855f7',
          '#0ea5e9',
          '#6366f1',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(156, 163, 175, 1)',
          font: {
            family: 'Outfit',
            size: 11
          }
        }
      }
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Profile Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">AI-powered digital catalog showing categorized accomplishments.</p>
      </div>

      {/* Quick Smart Search */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            placeholder="Ask anything about your academic and professional journey..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/search', { state: { initialQuery: e.target.value } });
              }
            }}
          />
          <FiSearch size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
        </div>
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold transition-colors w-full sm:w-auto justify-center"
        >
          <FiSearch size={13} />
          <span>Ask MemoryVerse</span>
        </button>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="glass-panel p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.name}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon size={20} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Module 3 Graph Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Graph Nodes</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{graphStats.totalNodes}</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Identified Entities</span>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Relationships</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{graphStats.totalEdges}</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">({graphStats.strongEdges} Strong)</span>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg Confidence</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-2xl font-extrabold text-slate-800 dark:text-white">{graphStats.avgConfidence}%</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">AI Inferred</span>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Top Connected Skill</span>
          <div className="flex justify-between items-baseline mt-2">
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-white truncate max-w-[130px]" title={graphStats.topSkill}>{graphStats.topSkill}</h4>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Key Competency</span>
          </div>
        </div>
      </div>

      {/* Recommended Career Path Detail */}
      {recommendedCareer && (
        <div className="glass-panel p-5 border border-indigo-500/20 bg-indigo-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              <FiCpu size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-455 dark:text-slate-500 font-bold uppercase tracking-wider">Top Recommended Career Path</span>
              <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">{recommendedCareer.name} ({Math.round(recommendedCareer.confidenceScore * 100)}% Match)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{recommendedCareer.reason}</p>
            </div>
          </div>
          <Link 
            to="/graph"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Explore Path Graph</span>
            <FiChevronRight />
          </Link>
        </div>
      )}

      {/* Details analytics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Doughnut */}
        <div className="glass-panel p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Smart Category Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Summary of classified files in database</p>
          </div>
          <div className="h-60 mt-4 relative flex items-center justify-center">
            {stats.totalDocuments > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <p className="text-slate-400 text-sm">No files uploaded yet to render chart.</p>
            )}
          </div>
        </div>

        {/* Knowledge Graph Quick Links Panel */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-bold flex items-center gap-2">
                <FiLayers className="text-indigo-600 dark:text-indigo-400" />
                <span>Relationship Mapping</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Graph statistics & top links</p>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Most Connected Project:</span>
                <span className="font-bold text-slate-750 dark:text-slate-200 truncate max-w-[130px]">{graphStats.topProject}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Chronological Events:</span>
                <span className="font-bold text-slate-750 dark:text-slate-200">{stats.totalDocuments}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">AI Inferred Bridges:</span>
                <span className="font-bold text-slate-750 dark:text-slate-200">{graphStats.totalEdges} Links</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80">
            <Link 
              to="/graph"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 shadow-md transition-colors text-xs"
            >
              <FiGitCommit size={15} />
              <span>Open Interactive Graph</span>
            </Link>
            <Link 
              to="/relationships"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold py-2.5 transition-colors text-xs"
            >
              <span>Explore Connections Table</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Digital Journey Widget ── */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiCalendar className="text-indigo-600 dark:text-indigo-400" />
              My Digital Journey
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Chronological roadmap of your academic & professional growth</p>
          </div>
          <Link
            to="/timeline"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            <FiTrendingUp size={13} />
            View Full Journey
          </Link>
        </div>

        {journeySummary ? (
          <div className="space-y-5">
            {/* Journey Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Journey Start', value: journeySummary.firstYear > 0 ? journeySummary.firstYear : '—', icon: FiCalendar, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Timeline Events', value: journeySummary.totalEvents, icon: FiZap, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Milestones', value: journeySummary.milestoneCount, icon: FiStar, color: 'text-amber-600 dark:text-amber-400' },
                { label: 'Most Active Year', value: journeySummary.mostActiveYear || '—', icon: FiTrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 text-center">
                  <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                  <div className={`text-lg font-extrabold ${color}`}>{value}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>

            {/* Recent Milestones */}
            {recentMilestones.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Milestones</p>
                <div className="space-y-1.5">
                  {recentMilestones.map(m => (
                    <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20">
                      <FiStar size={11} className="text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.label}</span>
                      <span className="ml-auto text-[9px] text-amber-600 dark:text-amber-400 font-bold">{m.importanceScore}pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <FiCalendar size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No journey data yet</p>
            <p className="text-xs text-slate-400 mt-1">Generate your timeline to see your journey here.</p>
            <Link to="/timeline" className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors">
              Go to Timeline
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
