import React, { useEffect, useState } from 'react';
import { relationshipService } from '../services/api';
import { 
  FiSearch, FiFilter, FiCheck, FiX, 
  FiTrash2, FiInfo, FiSliders, FiClock, FiActivity
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const RelationshipExplorer = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('confidence_desc'); // confidence_desc, date_desc, type_asc

  // Detail evidence modal state
  const [activeEvidence, setActiveEvidence] = useState(null);

  const fetchRelationships = async () => {
    try {
      const res = await relationshipService.getRelationships();
      setRelationships(res.data);
    } catch (err) {
      console.error("Failed to load relationships", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const handleConfirm = async (id) => {
    try {
      await relationshipService.confirmRelationship(id);
      fetchRelationships();
    } catch (err) {
      console.error("Failed to confirm connection", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await relationshipService.rejectRelationship(id);
      fetchRelationships();
    } catch (err) {
      console.error("Failed to reject connection", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await relationshipService.deleteRelationship(id);
      fetchRelationships();
    } catch (err) {
      console.error("Failed to delete connection", err);
    }
  };

  const handleShowEvidence = async (id) => {
    try {
      const res = await relationshipService.getRelationshipDetails(id);
      setActiveEvidence(res.data);
    } catch (err) {
      console.error("Failed to load relationship details", err);
    }
  };

  // Filter & Sort Logic
  const filteredRelationships = relationships
    .filter(rel => {
      const matchesSearch = 
        rel.sourceNodeName.toLowerCase().includes(search.toLowerCase()) || 
        rel.targetNodeName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        rel.status === statusFilter;

      const matchesType = 
        typeFilter === 'ALL' || 
        rel.relationshipType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'confidence_desc') {
        return b.confidenceScore - a.confidenceScore;
      }
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'type_asc') {
        return a.relationshipType.localeCompare(b.relationshipType);
      }
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Relationship Explorer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review, filter, confirm, and verify career accomplishments links.</p>
      </div>

      {/* Filters toolbar */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search Input */}
        <div className="relative flex items-center">
          <FiSearch className="absolute left-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by entity name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 outline-none text-xs text-slate-700 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold">
          <span className="mr-2">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Pending (Active)</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold">
          <span className="mr-2">Type:</span>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none cursor-pointer w-full"
          >
            <option value="ALL">All Relations</option>
            <option value="CERTIFIES">CERTIFIES</option>
            <option value="DEMONSTRATES">DEMONSTRATES</option>
            <option value="USES">USES</option>
            <option value="CONTRIBUTES_TO">CONTRIBUTES_TO</option>
            <option value="BUILT_DURING">BUILT_DURING</option>
            <option value="SUPPORTS">SUPPORTS</option>
          </select>
        </div>

        {/* Sorting selection */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold">
          <span className="mr-2">Sort:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent outline-none cursor-pointer w-full"
          >
            <option value="confidence_desc">Highest Confidence</option>
            <option value="date_desc">Newest Links</option>
            <option value="type_asc">Relation Type (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Table view list */}
      {loading ? (
        <div className="flex py-20 justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : filteredRelationships.length > 0 ? (
        <div className="glass-panel overflow-hidden border border-slate-200 dark:border-slate-850 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-200/60 dark:border-slate-850/60">
                  <th className="p-4 pl-6">Source Entity</th>
                  <th className="p-4">Relation Type</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4 text-center">Confidence</th>
                  <th className="p-4">Source</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80 font-medium text-slate-700 dark:text-slate-300">
                {filteredRelationships.map((rel) => (
                  <tr key={rel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                    {/* Source node */}
                    <td className="p-4 pl-6">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block">{rel.sourceNodeName}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold mt-0.5">{rel.sourceNodeType}</span>
                      </div>
                    </td>

                    {/* Relation label */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                        {rel.relationshipType}
                      </span>
                    </td>

                    {/* Target node */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block">{rel.targetNodeName}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold mt-0.5">{rel.targetNodeType}</span>
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="p-4 text-center">
                      <span className="font-extrabold text-indigo-650 dark:text-indigo-400 text-sm">
                        {Math.round(rel.confidenceScore * 100)}%
                      </span>
                    </td>

                    {/* Method source */}
                    <td className="p-4 text-[10px] font-mono uppercase tracking-wide text-slate-450 dark:text-slate-500">
                      {rel.relationshipSource}
                    </td>

                    {/* Status */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${rel.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400'}`}>
                        {rel.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => handleShowEvidence(rel.id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-450 dark:text-slate-500"
                          title="View evidence"
                        >
                          <FiInfo size={14} />
                        </button>
                        
                        {rel.status === 'ACTIVE' && (
                          <>
                            <button 
                              onClick={() => handleConfirm(rel.id)}
                              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl"
                              title="Confirm"
                            >
                              <FiCheck size={14} />
                            </button>
                            <button 
                              onClick={() => handleReject(rel.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-650 dark:text-red-400 rounded-xl"
                              title="Reject"
                            >
                              <FiX size={14} />
                            </button>
                          </>
                        )}

                        {rel.generationMethod === 'MANUAL' && (
                          <button 
                            onClick={() => handleDelete(rel.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 text-red-650 dark:text-red-400 rounded-xl"
                            title="Delete manual entry"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center glass-panel text-slate-400 dark:text-slate-500">
          <FiActivity size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">No relationships match filters</p>
          <p className="text-sm mt-1">Try resetting search keywords or choosing another connection status.</p>
        </div>
      )}

      {/* Evidence display Modal */}
      <AnimatePresence>
        {activeEvidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-2xl p-6 max-w-md w-full space-y-4 text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider text-[9px]">{activeEvidence.relationshipType}</span>
                  <h4 className="font-extrabold text-slate-800 dark:text-white mt-2 leading-tight text-sm">{activeEvidence.sourceNodeName} &rarr; {activeEvidence.targetNodeName}</h4>
                </div>
                <button onClick={() => setActiveEvidence(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1">Evidence Text</span>
                  <p className="text-slate-655 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-200/40 dark:border-slate-850">{activeEvidence.evidence}</p>
                </div>

                {activeEvidence.evidences && activeEvidence.evidences.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block mb-1">Supporting Sources</span>
                    <div className="space-y-2">
                      {activeEvidence.evidences.map((ev) => (
                        <div key={ev.id} className="p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200/40 dark:border-slate-850 rounded-xl space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-450 uppercase tracking-wider">
                            <span>Document Match</span>
                            <span className="text-indigo-650 dark:text-indigo-400">Relevance: {Math.round(ev.relevanceScore * 100)}%</span>
                          </div>
                          <span className="font-bold text-slate-750 dark:text-slate-200 block">{ev.documentTitle}</span>
                          <p className="text-slate-550 dark:text-slate-400 text-[10px] leading-relaxed mt-1 italic">"{ev.evidenceText}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <button 
                  onClick={() => setActiveEvidence(null)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RelationshipExplorer;
