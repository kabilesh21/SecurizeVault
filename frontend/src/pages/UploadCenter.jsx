import React, { useCallback, useEffect, useState } from 'react';
import { documentService, userService } from '../services/api';
import { 
  FiUploadCloud, FiFileText, FiLink, FiGithub, 
  FiTrash2, FiEye, FiDownload, FiRefreshCw, 
  FiCheckCircle, FiAlertCircle, FiInfo 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const UploadCenter = () => {
  // DB States
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ totalDocuments: 0, certificatesCount: 0, resumeCount: 0, projectsCount: 0, internshipsCount: 0 });
  const [loading, setLoading] = useState(true);

  // Form URL States
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioStatus, setPortfolioStatus] = useState({ type: '', msg: '' });
  const [githubStatus, setGithubStatus] = useState({ type: '', msg: '' });

  // Upload progress list state
  const [uploads, setUploads] = useState([]);

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [replacingDocId, setReplacingDocId] = useState(null);

  // Drag and drop highlights
  const [isDragActive, setIsDragActive] = useState(false);

  // Fetch DB details
  const fetchDbData = async () => {
    try {
      const docsRes = await documentService.getAll();
      setDocuments(docsRes.data);
      const statsRes = await userService.getStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load upload center assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  // Submit Portfolio Link
  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    setPortfolioStatus({ type: '', msg: '' });
    if (!portfolioUrl.startsWith('http://') && !portfolioUrl.startsWith('https://')) {
      setPortfolioStatus({ type: 'error', msg: 'URL must start with http:// or https://' });
      return;
    }
    try {
      await documentService.submitPortfolioLink(portfolioUrl);
      setPortfolioStatus({ type: 'success', msg: 'Portfolio link saved!' });
      setPortfolioUrl('');
      fetchDbData();
    } catch (err) {
      setPortfolioStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to save link' });
    }
  };

  // Submit GitHub Link
  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    setGithubStatus({ type: '', msg: '' });
    if (!githubUrl.startsWith('http://') && !githubUrl.startsWith('https://')) {
      setGithubStatus({ type: 'error', msg: 'URL must start with http:// or https://' });
      return;
    }
    if (!githubUrl.toLowerCase().includes('github.com')) {
      setGithubStatus({ type: 'error', msg: 'Must be a valid github.com domain' });
      return;
    }
    try {
      await documentService.submitGithubLink(githubUrl);
      setGithubStatus({ type: 'success', msg: 'GitHub Repository link saved!' });
      setGithubUrl('');
      fetchDbData();
    } catch (err) {
      setGithubStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to save link' });
    }
  };

  // File Validation
  const validateFile = (file) => {
    const ALLOWED_MIME = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png', 'image/jpeg', 'image/jpg'
    ];
    if (!ALLOWED_MIME.includes(file.type)) {
      return 'Unsupported file type. Upload PDF, DOCX, or Images (PNG/JPG)';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      return 'File too large. Maximum size is 10MB';
    }
    return null;
  };

  // Process File Upload
  const performUpload = async (fileObj) => {
    const uploadId = fileObj.id;
    
    // Update progress state
    setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'uploading', progress: 0, error: '' } : u));

    try {
      let res;
      if (replacingDocId) {
        res = await documentService.replace(replacingDocId, fileObj.file, (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
        });
        setReplacingDocId(null);
      } else {
        res = await documentService.upload(fileObj.file, (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
        });
      }

      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'success', progress: 100 } : u));
      
      // Auto-clear success upload items after 3 seconds
      setTimeout(() => {
        setUploads(prev => prev.filter(u => u.id !== uploadId));
      }, 3000);

      fetchDbData();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Server upload failed';
      setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'failed', error: errMsg } : u));
    }
  };

  // Handle new files dropped or selected
  const handleFiles = (fileList) => {
    const filesArray = Array.from(fileList);
    const newUploads = filesArray.map(file => {
      const errorMsg = validateFile(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: errorMsg ? 'invalid' : 'pending',
        error: errorMsg || ''
      };
    });

    setUploads(prev => [...prev, ...newUploads]);

    // Upload only valid files automatically
    newUploads.forEach(u => {
      if (u.status === 'pending') {
        performUpload(u);
      }
    });
  };

  // Drag listeners
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Delete Document
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await documentService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchDbData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Formatter helpers
  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const removeUploadFromList = (id) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Head */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Upload Center</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage documents, certifications, projects, and external URLs.</p>
      </div>

      {/* Grid containing Dropzone and URL submission forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Card and Drag Area */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Document Uploader</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Supports PDF, DOCX, and Images (Max 10MB)</p>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500/50'}`}
          >
            <input 
              type="file" 
              multiple 
              onChange={(e) => handleFiles(e.target.files)} 
              className="hidden" 
              id="file-selector"
            />
            <label htmlFor="file-selector" className="cursor-pointer flex flex-col items-center">
              <FiUploadCloud size={48} className="text-slate-400 dark:text-slate-500 mb-4 animate-bounce" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Drag & Drop files here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span></span>
              <span className="text-xs text-slate-400 mt-2 block">Upload certificates, resumes, internship letters, or projects reports.</span>
            </label>
          </div>

          {/* Active Uploads List */}
          {uploads.length > 0 && (
            <div className="space-y-3 mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Uploading Queue</span>
              {uploads.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <FiFileText className="text-indigo-500 shrink-0" size={20} />
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{u.name}</p>
                      <p className="text-xs text-slate-400">{formatBytes(u.size)}</p>
                    </div>
                  </div>

                  {/* Right Action / Progress */}
                  <div className="flex items-center gap-3">
                    {u.status === 'uploading' && (
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${u.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{u.progress}%</span>
                      </div>
                    )}

                    {u.status === 'success' && (
                      <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold">
                        <FiCheckCircle size={16} /> Success
                      </span>
                    )}

                    {u.status === 'failed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 flex items-center gap-1 text-xs font-semibold" title={u.error}>
                          <FiAlertCircle size={16} /> Failed
                        </span>
                        <button onClick={() => performUpload(u)} className="p-1 text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                          <FiRefreshCw size={14} />
                        </button>
                        <button onClick={() => removeUploadFromList(u.id)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}

                    {u.status === 'invalid' && (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 text-xs font-medium" title={u.error}>{u.error}</span>
                        <button onClick={() => removeUploadFromList(u.id)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Portfolio & GitHub Link submissions */}
        <div className="space-y-6">
          {/* Upload Statistics panel */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Ingestion Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documents</p>
                <h4 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats.totalDocuments}</h4>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificates</p>
                <h4 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{stats.certificatesCount}</h4>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumes</p>
                <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resumeCount}</h4>
              </div>
              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
                <h4 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.projectsCount}</h4>
              </div>
            </div>
          </div>

          {/* Links forms */}
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Connect Platforms</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">URLs will be parsed separately to extract meta accomplishments</p>
            </div>

            {/* Portfolio Link Form */}
            <form onSubmit={handlePortfolioSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Portfolio URL</label>
              <div className="flex gap-2">
                <div className="relative flex items-center flex-1">
                  <FiLink className="absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="https://myportfolio.dev" 
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 outline-none text-sm text-slate-700 dark:text-white"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">Submit</button>
              </div>
              {portfolioStatus.msg && (
                <p className={`text-xs font-medium ${portfolioStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{portfolioStatus.msg}</p>
              )}
            </form>

            {/* GitHub URL Form */}
            <form onSubmit={handleGithubSubmit} className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">GitHub Repository URL</label>
              <div className="flex gap-2">
                <div className="relative flex items-center flex-1">
                  <FiGithub className="absolute left-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="https://github.com/username/project" 
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 outline-none text-sm text-slate-700 dark:text-white"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">Submit</button>
              </div>
              {githubStatus.msg && (
                <p className={`text-xs font-medium ${githubStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{githubStatus.msg}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Uploaded Documents Grid Table */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ingested Credentials</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Documents verified and indexed in memory store</p>
          </div>
        </div>

        {loading ? (
          <div className="flex py-10 justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="relative p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-800 shadow-sm flex flex-col justify-between group transition-all duration-300">
                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-6" title={doc.title}>{doc.title}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${doc.status === 'PROCESSED' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'}`}>
                      {doc.category || 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Meta items */}
                  <div className="space-y-1 text-xs text-slate-400 dark:text-slate-500">
                    <p className="truncate">File Name: <span className="font-medium text-slate-600 dark:text-slate-350">{doc.originalName}</span></p>
                    <p>File Size: <span className="font-medium text-slate-600 dark:text-slate-350">{formatBytes(doc.size)}</span></p>
                    <p>Uploaded: <span className="font-medium text-slate-600 dark:text-slate-350">{new Date(doc.uploadedAt).toLocaleDateString()}</span></p>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-5">
                  <div className="flex gap-2">
                    <Link 
                      to={`/documents/${doc.id}`} 
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center"
                      title="View AI Analysis"
                    >
                      <FiEye size={15} />
                    </Link>
                    <a 
                      href={`/api/documents/${doc.id}/download`} 
                      download
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
                      title="Download"
                    >
                      <FiDownload size={15} />
                    </a>
                  </div>

                  <div className="flex gap-2">
                    {/* Replace file input */}
                    <input 
                      type="file" 
                      id={`replace-selector-${doc.id}`}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReplacingDocId(doc.id);
                          handleFiles(e.target.files);
                        }
                      }}
                    />
                    <label 
                      htmlFor={`replace-selector-${doc.id}`}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <FiRefreshCw size={13} />
                      Replace
                    </label>
                    
                    <button 
                      onClick={() => setDeleteConfirmId(doc.id)} 
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl transition-all"
                      title="Delete"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500">
            <FiInfo size={36} className="mx-auto mb-3" />
            <p>No ingested documents found. Begin by uploading files or platforms.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
                <FiTrash2 size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">Delete Document?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">This operation is permanent. It will clear all index references and OCR records.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Modal Head */}
              <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                <div className="overflow-hidden pr-6">
                  <h4 className="font-extrabold text-slate-800 dark:text-white truncate">{previewDoc.title}</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">File Name: {previewDoc.originalName}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>
              </div>

              {/* Preview Body */}
              <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col md:flex-row gap-6">
                
                {/* Visual Preview */}
                <div className="flex-1 h-full min-h-[300px] border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden relative flex items-center justify-center">
                  {previewDoc.fileType === 'application/pdf' ? (
                    <iframe 
                      src={`/api/documents/${previewDoc.id}/view`} 
                      title={previewDoc.title} 
                      className="w-full h-full border-none"
                    />
                  ) : previewDoc.fileType.startsWith('image/') ? (
                    <img 
                      src={`/api/documents/${previewDoc.id}/view`} 
                      alt={previewDoc.title} 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <FiFileText size={48} className="mx-auto mb-3" />
                      <p className="text-sm">In-browser preview is only supported for PDFs and Images.</p>
                      <a href={`/api/documents/${previewDoc.id}/download`} className="inline-block mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 underline">Download to View File</a>
                    </div>
                  )}
                </div>

                {/* AI / Metadata summary */}
                <div className="w-full md:w-80 space-y-5">
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Ingestion Engine Output</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 block">Classified Category</label>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{previewDoc.category || 'PENDING'}</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 dark:text-slate-500 block">Status</label>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{previewDoc.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 h-[220px] overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Extracted OCR Text</span>
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-mono whitespace-pre-wrap">
                      {previewDoc.ocrText || 'No OCR text extracted.'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Foot */}
              <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-end bg-slate-50 dark:bg-slate-950/20">
                <button onClick={() => setPreviewDoc(null)} className="px-5 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-semibold text-sm">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadCenter;
