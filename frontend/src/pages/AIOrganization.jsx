import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categorizationService } from '../services/api';
import { 
  FiSearch, FiFilter, FiFolder, FiTrendingUp, 
  FiCalendar, FiAward, FiBookOpen, FiActivity, 
  FiBriefcase, FiLink, FiGithub, FiFileText, 
  FiClock, FiChevronRight, FiGrid
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const AIOrganization = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filtering States
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(0);
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, name_asc, confidence_desc

  const navigate = useNavigate();

  const fetchAssets = async () => {
    try {
      const docsRes = await categorizationService.getCategorizedDocuments();
      setDocuments(docsRes.data);
      const catsRes = await categorizationService.getCategories();
      setCategories(catsRes.data);
    } catch (err) {
      console.error("Failed to load organization assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Category Icon Mapper
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'FiAward': return <FiAward size={20} />;
      case 'FiBookOpen': return <FiBookOpen size={20} />;
      case 'FiActivity': return <FiActivity size={20} />;
      case 'FiBriefcase': return <FiBriefcase size={20} />;
      case 'FiLink': return <FiLink size={20} />;
      case 'FiGithub': return <FiGithub size={20} />;
      case 'FiFileText': return <FiFileText size={20} />;
      default: return <FiFolder size={20} />;
    }
  };

  // Group items by category to calculate category card counters
  const getCategoryCounts = () => {
    const counts = { ALL: documents.length };
    categories.forEach(c => {
      counts[c.name] = documents.filter(doc => doc.category === c.name).length;
    });
    counts['UNCATEGORIZED'] = documents.filter(doc => !doc.category || doc.category === 'PENDING_CLASSIFICATION' || doc.category === 'UNCLASSIFIED').length;
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Filter & Sort Logic
  const processedDocuments = documents
    .filter(doc => {
      // 1. Search Query filter (checks title, original name, category name)
      const matchesSearch = doc.title?.toLowerCase().includes(search.toLowerCase()) || 
                            doc.originalName?.toLowerCase().includes(search.toLowerCase());
      
      // 2. Category Filter
      let matchesCategory = true;
      if (selectedCategory !== 'ALL') {
        if (selectedCategory === 'UNCATEGORIZED') {
          matchesCategory = !doc.category || doc.category === 'PENDING_CLASSIFICATION' || doc.category === 'UNCLASSIFIED';
        } else {
          matchesCategory = doc.category === selectedCategory;
        }
      }
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort configurations
      if (sortBy === 'date_desc') {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      }
      if (sortBy === 'name_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0; // Default unchanged
    });

  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">AI Organization</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Filter, sort, and organize your credential catalog by smart category profiles.</p>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* All card */}
        <div 
          onClick={() => setSelectedCategory('ALL')}
          className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between h-28 ${selectedCategory === 'ALL' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'glass-panel hover:border-slate-300 dark:hover:border-slate-800'}`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider">All Assets</span>
            <FiGrid size={18} />
          </div>
          <h4 className="text-3xl font-extrabold">{categoryCounts['ALL']}</h4>
        </div>

        {/* Category Specific Cards */}
        {categories.slice(0, 4).map(c => {
          const isSelected = selectedCategory === c.name;
          return (
            <div 
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between h-28 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'glass-panel hover:border-slate-300 dark:hover:border-slate-800'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider truncate pr-3">{c.name.replace('_', ' ')}</span>
                {getCategoryIcon(c.icon)}
              </div>
              <h4 className="text-3xl font-extrabold">{categoryCounts[c.name] || 0}</h4>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Field */}
        <div className="relative flex items-center w-full md:max-w-md">
          <FiSearch className="absolute left-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by document title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-sm text-slate-700 dark:text-white"
          />
        </div>

        {/* Sort and Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Sorting dropdown */}
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold gap-2">
            <FiClock />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-4"
            >
              <option value="date_desc">Newest Uploads</option>
              <option value="date_asc">Oldest Uploads</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* Quick Clear Filter */}
          {(selectedCategory !== 'ALL' || search !== '') && (
            <button 
              onClick={() => { setSelectedCategory('ALL'); setSearch(''); }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Ingested List */}
      {loading ? (
        <div className="flex py-20 justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : processedDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {processedDocuments.map((doc, idx) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: min(idx * 0.05, 0.4) }}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="glass-panel p-5 cursor-pointer hover:border-indigo-500/50 dark:hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiFileText size={20} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-extrabold text-slate-800 dark:text-white truncate" title={doc.title}>{doc.title}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()} &bull; {formatBytes(doc.size)}</span>
                  </div>
                </div>

                {/* Subtitle / category tag */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-450 dark:text-slate-500 font-medium">Smart Classification</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {doc.category?.replace('_', ' ') || 'UNCLASSIFIED'}
                  </span>
                </div>
              </div>

              {/* Action arrow */}
              <div className="flex justify-end items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 pt-4 mt-2">
                <span>Review Details</span>
                <FiChevronRight size={14} className="ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel text-slate-400 dark:text-slate-500">
          <FiFolder size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">No documents match filters</p>
          <p className="text-sm mt-1">Try adjusting your search keywords or choosing another category.</p>
        </div>
      )}
    </div>
  );
};

// Helper min function
const min = (val1, val2) => val1 < val2 ? val1 : val2;

export default AIOrganization;
