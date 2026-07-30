import React, { useState } from 'react';
import { FiX, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { relationshipService } from '../../services/api';

const ManualRelationshipModal = ({ isOpen, onClose, nodes, onCreated }) => {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState('USES');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const relationshipTypes = [
    'CERTIFIES', 'VALIDATES', 'DEMONSTRATES', 'USES', 'RELATED_TO', 
    'CONTRIBUTES_TO', 'SUPPORTS', 'APPLIED_IN', 'BUILT_DURING', 
    'COMPLETED_AT', 'ACHIEVED_IN', 'SHOWCASES', 'MENTIONS', 
    'PRECEDES', 'RECOMMENDS'
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sourceId || !targetId) {
      setError('Please select both source and target entities');
      return;
    }
    if (sourceId === targetId) {
      setError('Cannot link an entity to itself');
      return;
    }
    if (!evidence.trim()) {
      setError('Please provide evidence or rationale for this relationship');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await relationshipService.createManualRelationship(sourceId, targetId, relType, evidence);
      onCreated();
      onClose();
      // Reset form
      setSourceId('');
      setTargetId('');
      setEvidence('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create relationship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FiPlus className="text-indigo-600 dark:text-indigo-400" />
            <span>Create Manual Connection</span>
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-2">
              <FiAlertCircle className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source node */}
          <div className="space-y-1">
            <label className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Source Entity</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">-- Select Source Node --</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>[{node.entityType}] {node.name}</option>
              ))}
            </select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Relationship Label</label>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 text-slate-750 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono font-bold"
            >
              {relationshipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Target node */}
          <div className="space-y-1">
            <label className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">Target Entity</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="">-- Select Target Node --</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>[{node.entityType}] {node.name}</option>
              ))}
            </select>
          </div>

          {/* Evidence */}
          <div className="space-y-1">
            <label className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">Evidence / Rationale</label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Explain why these two entities are connected..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-350 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? 'Creating...' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualRelationshipModal;
