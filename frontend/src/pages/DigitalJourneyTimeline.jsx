import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { timelineService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAward, FiActivity, FiBriefcase, FiBookOpen,
  FiCalendar, FiClock, FiRefreshCw, FiEye, FiExternalLink,
  FiMapPin, FiAlignLeft, FiGrid, FiList, FiPlus, FiEdit2,
  FiCheck, FiEyeOff, FiTrash2, FiX, FiChevronDown, FiChevronRight,
  FiGithub, FiLink, FiTrendingUp, FiZap, FiTarget, FiFilter,
  FiLayers, FiSliders, FiBarChart2, FiStar
} from 'react-icons/fi';

// ────────────────────────────────────────────────────────────────────
// Constants & Helpers
// ────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: 'ALL', label: 'All Events' },
  { value: 'CERTIFICATION', label: 'Certifications' },
  { value: 'PROJECT', label: 'Projects' },
  { value: 'INTERNSHIP', label: 'Internships' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'PORTFOLIO', label: 'Portfolio' },
  { value: 'ACHIEVEMENT', label: 'Achievements' },
  { value: 'LEADERSHIP', label: 'Leadership' },
  { value: 'CAREER_MILESTONE', label: 'Career Milestones' },
  { value: 'OTHER', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'importance', label: 'Highest Importance' },
  { value: 'confidence', label: 'Highest Confidence' },
];

const LAYOUT_OPTIONS = [
  { value: 'VERTICAL', icon: FiAlignLeft, label: 'Vertical' },
  { value: 'COMPACT', icon: FiList, label: 'Compact' },
  { value: 'GRID', icon: FiGrid, label: 'Grid' },
];

const getEventTheme = (eventType) => {
  switch (eventType) {
    case 'CERTIFICATION':
      return { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-500', Icon: FiAward };
    case 'PROJECT':
      return { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/40', dot: 'bg-purple-500', Icon: FiActivity };
    case 'INTERNSHIP':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-500', Icon: FiBriefcase };
    case 'ACADEMIC':
      return { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/40', dot: 'bg-blue-500', Icon: FiBookOpen };
    case 'GITHUB':
      return { bg: 'bg-slate-50 dark:bg-slate-950/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/40', dot: 'bg-slate-600', Icon: FiGithub };
    case 'PORTFOLIO':
      return { bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800/40', dot: 'bg-pink-500', Icon: FiLink };
    case 'ACHIEVEMENT':
      return { bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/40', dot: 'bg-yellow-500', Icon: FiStar };
    case 'LEADERSHIP':
      return { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/40', dot: 'bg-orange-500', Icon: FiTarget };
    case 'CAREER_MILESTONE':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/40', dot: 'bg-indigo-500', Icon: FiTrendingUp };
    default:
      return { bg: 'bg-slate-50 dark:bg-slate-950/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/40', dot: 'bg-slate-400', Icon: FiZap };
  }
};

const getDateSourceLabel = (source) => {
  const map = {
    DOCUMENT_CONTENT: { label: 'From Document', color: 'text-emerald-600 dark:text-emerald-400' },
    DOCUMENT_TITLE: { label: 'From Title', color: 'text-blue-600 dark:text-blue-400' },
    UPLOAD_DATE_FALLBACK: { label: 'Upload Date (Fallback)', color: 'text-amber-600 dark:text-amber-400' },
    USER_CREATED: { label: 'User Provided', color: 'text-indigo-600 dark:text-indigo-400' },
    UNKNOWN: { label: 'Unknown', color: 'text-slate-400' },
  };
  return map[source] || { label: source, color: 'text-slate-400' };
};

// ────────────────────────────────────────────────────────────────────
// Sub-Components
// ────────────────────────────────────────────────────────────────────

const ImportanceBadge = ({ score }) => {
  const color = score >= 80 ? 'text-red-500' : score >= 60 ? 'text-amber-500' : 'text-slate-400';
  const bars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
  return (
    <div className={`flex items-center gap-0.5 ${color}`} title={`Importance: ${score}/100`}>
      {[1,2,3].map(i => (
        <div key={i} className={`h-2 w-1 rounded-sm ${i <= bars ? 'bg-current' : 'bg-slate-200 dark:bg-slate-700'}`}/>
      ))}
      <span className="text-[9px] font-bold ml-0.5">{score}</span>
    </div>
  );
};

const MilestoneBadge = ({ labels }) => {
  if (!labels || labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map(label => (
        <span key={label} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <FiStar size={8} /> {label}
        </span>
      ))}
    </div>
  );
};

const ConfidenceDot = ({ score }) => {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} title={`Confidence: ${pct}%`} />
  );
};

// ────────────────────────────────────────────────────────────────────
// Event Detail Modal
// ────────────────────────────────────────────────────────────────────

const EventDetailModal = ({ event, onClose, onConfirm, onHide, onDelete }) => {
  if (!event) return null;
  const theme = getEventTheme(event.eventType);
  const dateSource = getDateSourceLabel(event.dateSource);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`p-5 border-b border-slate-100 dark:border-slate-800 ${theme.bg} rounded-t-2xl`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${theme.bg} border ${theme.border}`}>
                <theme.Icon size={16} className={theme.text} />
              </div>
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${theme.text}`}>{event.eventType}</span>
                {event.isUserConfirmed && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">Confirmed</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <FiX size={16} className="text-slate-400" />
            </button>
          </div>
          <h2 className="text-base font-extrabold text-slate-800 dark:text-white mt-3 leading-snug">{event.title}</h2>
          {event.organization && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <FiMapPin size={11} /> {event.organization}
            </p>
          )}
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Date Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Date</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{event.displayDate || 'Unknown'}</p>
              <p className={`text-[10px] mt-0.5 font-semibold ${dateSource.color}`}>{dateSource.label}</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Precision</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">{event.datePrecision || '—'}</p>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Importance</span>
              <ImportanceBadge score={event.importanceScore || 0} />
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Confidence</span>
              <div className="flex items-center gap-1.5">
                <ConfidenceDot score={event.confidenceScore} />
                <span className="text-slate-700 dark:text-slate-300 font-bold">{Math.round((event.confidenceScore || 0) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800">
              {event.description || 'No description available.'}
            </p>
          </div>

          {/* Milestone badges */}
          {event.milestoneLabels?.length > 0 && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Milestones</span>
              <MilestoneBadge labels={event.milestoneLabels} />
            </div>
          )}

          {/* Skills */}
          {event.relatedSkillNames?.length > 0 && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Skills Demonstrated</span>
              <div className="flex flex-wrap gap-1.5">
                {event.relatedSkillNames.map(skill => (
                  <span key={skill} className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 font-bold text-[10px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technologies */}
          {event.technologies?.length > 0 && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Technologies</span>
              <div className="flex flex-wrap gap-1">
                {event.technologies.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related documents */}
          {event.relatedDocumentIds?.length > 0 && (
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">Source Documents</span>
              <div className="flex flex-wrap gap-2">
                {event.relatedDocumentIds.map(docId => (
                  <Link
                    key={docId}
                    to={`/documents/${docId}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-semibold transition-colors"
                  >
                    <FiEye size={11} />
                    Document #{docId}
                    <FiExternalLink size={10} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {!event.isUserConfirmed && (
              <button
                onClick={() => { onConfirm(event.id); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold transition-colors"
              >
                <FiCheck size={11} /> Confirm
              </button>
            )}
            <button
              onClick={() => { onHide(event.id); onClose(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-colors"
            >
              <FiEyeOff size={11} /> Hide
            </button>
            {event.isUserCreated && (
              <button
                onClick={() => { onDelete(event.id); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-500 text-[10px] font-bold transition-colors"
              >
                <FiTrash2 size={11} /> Delete
              </button>
            )}
            <Link
              to="/graph"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold transition-colors hover:bg-indigo-100"
            >
              <FiLayers size={11} /> View Connections
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Manual Event Modal
// ────────────────────────────────────────────────────────────────────

const ManualEventModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', description: '', eventType: 'OTHER', organization: '', displayDate: '', importanceScore: 60 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await timelineService.createManual({ ...form, dateSource: 'USER_CREATED', datePrecision: 'UNKNOWN', isUserCreated: true });
      onSave();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Add Manual Event</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><FiX size={16} className="text-slate-400" /></button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Python Programming Certification" />
          </div>

          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Event Type</label>
            <select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {EVENT_TYPES.filter(t => t.value !== 'ALL').map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Organization</label>
            <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Coursera, University" />
          </div>

          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Date (display)</label>
            <input value={form.displayDate} onChange={e => setForm({ ...form, displayDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. June 2025, 2025, or 2025-06-15" />
          </div>

          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What did you achieve?" />
          </div>

          <div>
            <label className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Importance (0-100)</label>
            <input type="range" min="0" max="100" value={form.importanceScore}
              onChange={e => setForm({ ...form, importanceScore: parseInt(e.target.value) })}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>Low</span><span className="font-bold text-slate-600 dark:text-slate-300">{form.importanceScore}</span><span>High</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Event'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Event Cards
// ────────────────────────────────────────────────────────────────────

const VerticalEventCard = ({ event, onSelect, isLeft }) => {
  const theme = getEventTheme(event.eventType);
  return (
    <div className={`relative flex items-start ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row z-10`}>
      {/* Timeline connector dot */}
      <div className="absolute left-6 md:left-1/2 top-5 transform -translate-x-1/2 z-20">
        <div className={`w-4 h-4 rounded-full ${theme.dot} border-4 border-white dark:border-slate-950 shadow-md transition-transform hover:scale-125`} />
      </div>

      {/* Card */}
      <div className={`w-full md:w-[47%] pl-14 md:pl-0 ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.35 }}
          onClick={() => onSelect(event)}
          className="glass-panel p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group border border-slate-200/50 dark:border-slate-800/60"
        >
          {/* Type + Date header */}
          <div className="flex items-center justify-between mb-3">
            <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}>
              <theme.Icon size={10} /> {event.eventType}
            </span>
            <div className="flex items-center gap-1.5">
              <ConfidenceDot score={event.confidenceScore} />
              <span className="text-[10px] text-slate-400 font-semibold">{event.displayDate || 'Unknown'}</span>
            </div>
          </div>

          {/* Milestone badges */}
          <MilestoneBadge labels={event.milestoneLabels} />

          {/* Title */}
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>

          {/* Organization */}
          {event.organization && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1 flex items-center gap-1">
              <FiMapPin size={10} /> {event.organization}
            </p>
          )}

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5 line-clamp-2">
            {event.description}
          </p>

          {/* Footer: skills + importance */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-wrap gap-1">
              {(event.relatedSkillNames || []).slice(0, 3).map(s => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 text-[9px] font-semibold text-slate-600 dark:text-slate-400">{s}</span>
              ))}
              {(event.relatedSkillNames || []).length > 3 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 text-[9px] font-semibold text-slate-400">+{event.relatedSkillNames.length - 3}</span>
              )}
            </div>
            <ImportanceBadge score={event.importanceScore || 0} />
          </div>
        </motion.div>
      </div>

      {/* Empty opposite side on desktop */}
      <div className="hidden md:block w-[47%]" />
    </div>
  );
};

const CompactEventCard = ({ event, onSelect }) => {
  const theme = getEventTheme(event.eventType);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(event)}
      className="flex items-center gap-4 p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900/70 cursor-pointer transition-all hover:shadow-md group"
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${theme.bg} border ${theme.border}`}>
        <theme.Icon size={14} className={theme.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title}</p>
        <p className="text-[10px] text-slate-400">{event.displayDate} {event.organization ? `· ${event.organization}` : ''}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <MilestoneBadge labels={event.milestoneLabels?.slice(0, 1)} />
        <ImportanceBadge score={event.importanceScore || 0} />
      </div>
    </motion.div>
  );
};

const GridEventCard = ({ event, onSelect }) => {
  const theme = getEventTheme(event.eventType);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => onSelect(event)}
      className="glass-panel p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all group border border-slate-200/50 dark:border-slate-800/60"
    >
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-3 ${theme.bg} ${theme.text} border ${theme.border}`}>
        <theme.Icon size={10} /> {event.eventType}
      </div>
      <h3 className="text-xs font-extrabold text-slate-800 dark:text-white leading-snug mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {event.title}
      </h3>
      {event.organization && (
        <p className="text-[10px] text-slate-400 mb-2">{event.organization}</p>
      )}
      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-slate-400 font-semibold">{event.displayDate}</span>
        <ImportanceBadge score={event.importanceScore || 0} />
      </div>
    </motion.div>
  );
};

// ────────────────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────────────────

const DigitalJourneyTimeline = () => {
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [minImportance, setMinImportance] = useState(0);
  const [sortBy, setSortBy] = useState('oldest');
  const [layout, setLayout] = useState('VERTICAL');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, insightsRes, milestonesRes, summaryRes] = await Promise.all([
        timelineService.getAll({ eventType: eventTypeFilter !== 'ALL' ? eventTypeFilter : undefined }),
        timelineService.getInsights(),
        timelineService.getMilestones(),
        timelineService.getSummary(),
      ]);
      setEvents(eventsRes.data || []);
      setInsights(insightsRes.data || []);
      setMilestones(milestonesRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.error('Failed to fetch timeline data', err);
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Apply client-side sorting and importance filter
  const filteredEvents = events
    .filter(e => minImportance === 0 || (e.importanceScore || 0) >= minImportance)
    .sort((a, b) => {
      if (sortBy === 'newest') return (b.startDate || '').localeCompare(a.startDate || '');
      if (sortBy === 'importance') return (b.importanceScore || 0) - (a.importanceScore || 0);
      if (sortBy === 'confidence') return (b.confidenceScore || 0) - (a.confidenceScore || 0);
      return (a.startDate || '').localeCompare(b.startDate || '');
    });

  // Group by year
  const eventsByYear = filteredEvents.reduce((acc, ev) => {
    const year = ev.startDate ? ev.startDate.split('-')[0] : 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(ev);
    return acc;
  }, {});

  const sortedYears = Object.keys(eventsByYear).sort((a, b) => sortBy === 'newest' ? b.localeCompare(a) : a.localeCompare(b));

  const handleGenerate = async () => {
    setGenerating(true);
    try { await timelineService.generate(); await fetchData(); }
    catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const handleRebuild = async () => {
    setRebuilding(true);
    try { await timelineService.rebuild(); await fetchData(); }
    catch (e) { console.error(e); }
    finally { setRebuilding(false); }
  };

  const handleConfirm = async (id) => {
    try { await timelineService.confirmEvent(id); fetchData(); } catch (e) { console.error(e); }
  };
  const handleHide = async (id) => {
    try { await timelineService.hideEvent(id); fetchData(); } catch (e) { console.error(e); }
  };
  const handleDelete = async (id) => {
    try { await timelineService.deleteEvent(id); fetchData(); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">My Digital Journey</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Explore your academic and professional growth over time — automatically mapped from your uploaded documents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FiPlus size={13} /> Add Event
          </button>
          <button
            onClick={handleRebuild}
            disabled={rebuilding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw size={13} className={rebuilding ? 'animate-spin' : ''} />
            {rebuilding ? 'Rebuilding...' : 'Rebuild'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <FiZap size={13} className={generating ? 'animate-pulse' : ''} />
            {generating ? 'Generating...' : 'Generate Timeline'}
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Events', value: summary.totalEvents, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Certifications', value: summary.certificatesCount, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Projects', value: summary.projectsCount, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Internships', value: summary.internshipsCount, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Milestones', value: summary.milestoneCount, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Most Active', value: summary.mostActiveYear || '—', color: 'text-blue-600 dark:text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-panel p-3 text-center">
              <div className={`text-xl font-extrabold ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters & Layout ── */}
      <div className="glass-panel p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Event Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <FiFilter size={13} className="text-slate-400" />
            <select
              value={eventTypeFilter}
              onChange={e => setEventTypeFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            >
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 text-xs">
            <FiSliders size={13} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Min importance slider */}
          <div className="flex items-center gap-2 text-xs">
            <FiBarChart2 size={13} className="text-slate-400" />
            <span className="text-slate-400 text-[10px]">Min:</span>
            <input
              type="range" min="0" max="90" step="10" value={minImportance}
              onChange={e => setMinImportance(parseInt(e.target.value))}
              className="w-20 accent-indigo-600"
            />
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold w-6">{minImportance}</span>
          </div>
        </div>

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {LAYOUT_OPTIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setLayout(value)}
              title={label}
              className={`p-1.5 rounded-md transition-colors ${layout === value ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Insights Panel ── */}
      {insights.length > 0 && (
        <div>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <FiTrendingUp size={14} />
            Journey Insights ({insights.length})
            {showInsights ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
          </button>
          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2"
              >
                {insights.map(insight => (
                  <div key={insight.id} className="glass-panel p-4 border-l-4 border-indigo-500/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full">{insight.insightType}</span>
                      <span className="text-[10px] text-slate-400">{Math.round((insight.confidenceScore || 0) * 100)}% confidence</span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">{insight.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Main Timeline Content ── */}
      {loading ? (
        <div className="py-32 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-28 text-center glass-panel">
          <FiCalendar size={54} className="mx-auto mb-4 opacity-30 text-indigo-500" />
          <p className="text-lg font-extrabold text-slate-700 dark:text-white">Your digital journey will appear here</p>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            Upload certificates, projects, internships, and achievements to automatically build your journey roadmap.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/upload" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors">
              Upload Documents
            </Link>
            <button onClick={handleGenerate} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Generate Timeline
            </button>
          </div>
        </div>
      ) : layout === 'VERTICAL' ? (
        /* Vertical alternating timeline */
        <div className="relative py-6">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 via-slate-200 to-transparent dark:from-indigo-800 dark:via-slate-800 transform -translate-x-1/2 z-0" />
          <div className="space-y-16">
            {sortedYears.map(year => (
              <div key={year} className="space-y-10">
                {/* Year Marker */}
                <div className="flex justify-center items-center relative z-10">
                  <span className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-extrabold shadow-lg shadow-indigo-500/30">
                    {year}
                  </span>
                </div>
                {eventsByYear[year].map((event, idx) => (
                  <VerticalEventCard
                    key={event.id}
                    event={event}
                    onSelect={setSelectedEvent}
                    isLeft={idx % 2 === 0}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : layout === 'COMPACT' ? (
        /* Compact list view grouped by year */
        <div className="space-y-8">
          {sortedYears.map(year => (
            <div key={year}>
              <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                <FiCalendar size={13} /> {year}
              </h3>
              <div className="space-y-2">
                {eventsByYear[year].map(event => (
                  <CompactEventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid view */
        <div className="space-y-8">
          {sortedYears.map(year => (
            <div key={year}>
              <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                <FiCalendar size={13} /> {year}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsByYear[year].map(event => (
                  <GridEventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onConfirm={handleConfirm}
            onHide={handleHide}
            onDelete={handleDelete}
          />
        )}
        {showManual && (
          <ManualEventModal
            onClose={() => setShowManual(false)}
            onSave={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DigitalJourneyTimeline;
