import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { searchService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMic, FiRefreshCw, FiTrash2, FiClock, FiLayers, 
  FiCalendar, FiAward, FiBookOpen, FiBriefcase, FiLink, FiGithub, 
  FiExternalLink, FiX, FiCheckCircle, FiCpu, FiTrendingUp, 
  FiFileText, FiFolder, FiStar, FiZap, FiDownload, FiArrowRight
} from 'react-icons/fi';

const SmartSearch = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [status, setStatus] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [listening, setListening] = useState(false);
  const [intent, setIntent] = useState(null);
  const [filters, setFilters] = useState(null);
  const [searched, setSearched] = useState(false);

  // Web Speech API
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    initSpeechRecognition();
    if (location.state && location.state.initialQuery) {
      setQuery(location.state.initialQuery);
      handleSearch(location.state.initialQuery);
    }
  }, [location.state]);

  const fetchInitialData = async () => {
    try {
      const [histRes, suggRes, statusRes] = await Promise.all([
        searchService.getHistory(),
        searchService.getSuggestions(),
        searchService.getStatus()
      ]);
      setHistory(histRes.data || []);
      setSuggestions(suggRes.data || []);
      setStatus(statusRes.data || null);
    } catch (e) {
      console.error("Failed to load initial search configurations", e);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognitionRef.current = rec;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await searchService.search(q);
      const data = res.data;
      setResults(data.results || []);
      setIntent(data.detectedIntent ? { name: data.detectedIntent, confidence: data.intentConfidence } : null);
      setFilters(data.filters || null);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
      
      // Reload history
      const histRes = await searchService.getHistory();
      setHistory(histRes.data || []);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (sugg) => {
    setQuery(sugg);
    handleSearch(sugg);
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await searchService.deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await searchService.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      await searchService.reindex();
      // Keep loading status to simulate indexing
      setTimeout(async () => {
        const statusRes = await searchService.getStatus();
        setStatus(statusRes.data);
        setReindexing(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setReindexing(false);
    }
  };

  const getRelevanceBadge = (score) => {
    if (score >= 0.8) return { label: 'Highly Relevant', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' };
    if (score >= 0.5) return { label: 'Relevant', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' };
    return { label: 'Possible Match', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20' };
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'CERTIFICATE':
      case 'CERTIFICATION':
        return { icon: FiAward, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
      case 'RESUME':
        return { icon: FiBookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
      case 'PROJECT':
      case 'PROJECT_REPORT':
        return { icon: FiActivity, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' };
      case 'INTERNSHIP':
      case 'INTERNSHIP_LETTER':
        return { icon: FiBriefcase, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
      case 'PORTFOLIO_LINK':
        return { icon: FiLink, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' };
      case 'GITHUB_REPO':
        return { icon: FiGithub, color: 'text-slate-600 bg-slate-50 dark:bg-slate-950/20' };
      default:
        return { icon: FiFileText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' };
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      
      {/* ── Header & Indexing Status ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Ask MemoryVerse</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Find any part of your academic and professional journey instantly.
          </p>
        </div>

        {status && (
          <div className="glass-panel px-4 py-2.5 flex items-center gap-3.5 text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                <FiCheckCircle size={14} className="text-emerald-500" />
                <span>Search Index: {status.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{status.documentsIndexed} Documents Indexed ({status.mode})</p>
            </div>
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors disabled:opacity-50"
              title="Reindex all documents"
            >
              <FiRefreshCw size={13} className={reindexing ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* ── Search Bar Section ── */}
      <div className="max-w-3xl mx-auto w-full space-y-4 pt-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask anything about your academic and professional journey..."
            className="w-full pl-12 pr-28 py-4.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md text-slate-800 dark:text-white transition-all placeholder-slate-400"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            <FiSearch size={20} />
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title="Search by voice"
            >
              <FiMic size={18} />
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {/* ── Suggestion Chips ── */}
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          {suggestions.slice(0, 4).map((sugg, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(sugg)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              {sugg}
            </button>
          ))}
        </div>
      </div>

      {/* ── Intent & Filter Results Indicator ── */}
      {searched && (intent || filters) && (
        <div className="max-w-3xl mx-auto w-full flex flex-wrap gap-2.5 items-center bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1">Query Interpretation:</span>
          {intent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/10">
              <FiCpu size={12} /> Intent: {intent.name} ({Math.round(intent.confidence * 100)}%)
            </span>
          )}
          {filters?.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/10">
              Category: {filters.category}
            </span>
          )}
          {filters?.year && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/10">
              <FiCalendar size={12} /> Year: {filters.year}
            </span>
          )}
          {filters?.skills?.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/10">
              Skill: {filters.skills.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* ── Search Results ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Results Stream (Left 3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="py-28 flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mb-4" />
              <p className="text-xs text-slate-400">Semantic AI retrieving documents...</p>
            </div>
          ) : !searched ? (
            /* Welcome state before search */
            <div className="py-24 text-center glass-panel">
              <FiSearch size={48} className="mx-auto text-indigo-500/30 mb-4" />
              <h3 className="text-base font-extrabold text-slate-700 dark:text-white">Ask MemoryVerse Anything</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                Type natural queries like "Show certificates related to Python" or "Find projects using Spring Boot" to explore.
              </p>
            </div>
          ) : results.length === 0 ? (
            /* Elegant empty state */
            <div className="py-20 text-center glass-panel space-y-6">
              <div>
                <FiX size={44} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-base font-extrabold text-slate-700 dark:text-white">No Exact Match Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  MemoryVerse searched your complete digital journey but couldn't locate specific documents.
                </p>
              </div>
              
              <div className="inline-flex gap-3 justify-center">
                <Link
                  to="/upload"
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-md"
                >
                  Upload New Files
                </Link>
                <Link
                  to="/organization"
                  className="px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Browse All Documents
                </Link>
              </div>
            </div>
          ) : (
            /* Result list */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span>Returned {results.length} relevant match(es)</span>
              </div>
              
              <AnimatePresence>
                {results.map((res) => {
                  const catTheme = getCategoryIcon(res.resultType);
                  const relTheme = getRelevanceBadge(res.relevanceScore);
                  return (
                    <motion.div
                      key={res.documentId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="glass-panel p-5 border border-slate-200/50 dark:border-slate-850 flex flex-col md:flex-row gap-5 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Left: Icon & Score */}
                      <div className="flex md:flex-col items-center gap-3 flex-shrink-0">
                        <div className={`p-3 rounded-2xl border border-slate-200/20 shadow-inner ${catTheme.color}`}>
                          <catTheme.icon size={20} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${relTheme.color}`}>
                          {relTheme.label}
                        </span>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{res.resultType}</span>
                          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug mt-0.5">{res.title}</h3>
                          {res.organization && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{res.organization}</p>
                          )}
                        </div>

                        {/* Explanation block */}
                        {res.explanation && (
                          <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border-l-2 border-indigo-500/40 p-2.5 rounded-r-xl">
                            <p className="text-[11px] text-indigo-950 dark:text-indigo-300 font-semibold leading-relaxed">
                              {res.explanation}
                            </p>
                          </div>
                        )}

                        {/* Demonstrated Skills */}
                        {res.matchedSkills && res.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {res.matchedSkills.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap md:flex-col gap-2 justify-end md:justify-start flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800/80 md:border-l md:pl-5">
                        <Link
                          to={`/documents/${res.documentId}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-800/30 transition-colors"
                        >
                          <FiFileText size={12} /> View Details
                        </Link>
                        
                        <a
                          href={`/api/documents/${res.documentId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-800/30 transition-colors"
                        >
                          <FiExternalLink size={12} /> Open File
                        </a>

                        {res.timelineEventId && (
                          <Link
                            to="/timeline"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 transition-colors"
                          >
                            <FiCalendar size={12} /> View in Journey
                          </Link>
                        )}

                        {res.nodeId && (
                          <Link
                            to="/graph"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
                          >
                            <FiLayers size={12} /> View Connections
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Search Logs / History (Right 1 col on lg) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150 dark:border-slate-800">
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiClock size={13} className="text-slate-400" />
                <span>Recent Searches</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-6">Your recent searches will appear here.</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item.query)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{item.query}</p>
                      <p className="text-[9px] text-slate-450 uppercase tracking-wide font-bold mt-0.5">
                        {item.detectedIntent.replace("_SEARCH", "")} · {item.resultCount} Match(es)
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Tips */}
          <div className="glass-panel p-5 bg-gradient-to-tr from-indigo-50/10 to-purple-50/10 text-xs">
            <h4 className="font-extrabold text-slate-700 dark:text-white flex items-center gap-1.5">
              <FiZap size={14} className="text-indigo-500" />
              <span>Smart Search Tips</span>
            </h4>
            <ul className="mt-3 space-y-2.5 text-slate-500 dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Search across categories: "certificates", "projects", "internships".</li>
              <li>Ask for specific skills: "Java projects", "Python certifications".</li>
              <li>Sort by date: "Show my latest resume".</li>
              <li>Semantic matching finds documents even if different words are used.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SmartSearch;
