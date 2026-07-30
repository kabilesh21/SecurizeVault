import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService, categorizationService } from '../services/api';
import { 
  FiArrowLeft, FiRefreshCw, FiEdit3, FiEye, 
  FiDownload, FiCpu, FiAward, FiBookOpen, 
  FiActivity, FiBriefcase, FiLink, FiGithub, 
  FiFolder, FiCalendar, FiCheckCircle, FiInfo 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const DocumentDetails = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  // Document states
  const [doc, setDoc] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reprocessing indicator
  const [reprocessing, setReprocessing] = useState(false);

  // Correction states
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const [previewUrl, setPreviewUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchDetails = async () => {
    try {
      const docRes = await documentService.getById(documentId);
      const documentData = docRes.data;
      setDoc(documentData);
      
      const analysisRes = await categorizationService.getResults(documentId);
      setAnalysis(analysisRes.data);
      
      const catsRes = await categorizationService.getCategories();
      setCategories(catsRes.data);
      if (catsRes.data.length > 0) {
        setSelectedCategoryId(catsRes.data[0].id);
      }

      // Fetch secure document blob for preview (attaches JWT automatically)
      if (documentData.fileType === 'application/pdf' || documentData.fileType.startsWith('image/')) {
        try {
          const axiosModule = await import('axios');
          const axios = axiosModule.default;
          const viewRes = await axios.get(`/api/documents/${documentId}/view`, {
            responseType: 'blob'
          });
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          const blobUrl = URL.createObjectURL(viewRes.data);
          setPreviewUrl(blobUrl);
        } catch (previewErr) {
          console.error("Failed to load secure preview", previewErr);
        }
      }
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [documentId]);

  // Secure download handler
  const handleDownload = async () => {
    if (!doc) return;
    setDownloading(true);
    try {
      const axiosModule = await import('axios');
      const axios = axiosModule.default;
      const response = await axios.get(`/api/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  // Reprocess pipeline
  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await categorizationService.reprocess(documentId);
      setAnalysis(res.data);
      fetchDetails();
    } catch (err) {
      console.error("Reprocessing failed", err);
    } finally {
      setReprocessing(false);
    }
  };

  // Correct category
  const handleSaveCorrection = async () => {
    if (!selectedCategoryId) return;
    setSavingCategory(true);
    try {
      await categorizationService.correctCategory(documentId, selectedCategoryId);
      setIsEditingCategory(false);
      fetchDetails();
    } catch (err) {
      console.error("Saving correction failed", err);
    } finally {
      setSavingCategory(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Document Not Found</h3>
        <Link to="/organization" className="text-indigo-600 dark:text-indigo-400 underline mt-4 inline-block">Return to Organization</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Back button & Action items */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/organization" className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-2">
          <FiArrowLeft size={16} />
          <span>Back to Ingested Catalog</span>
        </Link>

        <div className="flex gap-3">
          <button 
            onClick={handleReprocess} 
            disabled={reprocessing}
            className="glass-btn glass-btn-secondary px-4 py-2 text-xs"
          >
            <FiRefreshCw size={14} className={reprocessing ? 'animate-spin' : ''} />
            <span>{reprocessing ? 'Processing...' : 'Reprocess AI'}</span>
          </button>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="glass-btn glass-btn-primary px-4 py-2 text-xs"
          >
            <FiDownload size={14} />
            <span>{downloading ? 'Downloading...' : 'Download Original'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Preview and details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* File details banner */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">{doc.title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs text-slate-450 dark:text-slate-550 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <div>
                <span className="block font-medium">Original Name</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5" title={doc.originalName}>{doc.originalName}</span>
              </div>
              <div>
                <span className="block font-medium">File Size</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{formatBytes(doc.size)}</span>
              </div>
              <div>
                <span className="block font-medium">Upload Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block font-medium">File Format</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 uppercase">{doc.fileType.split('/')[1]}</span>
              </div>
            </div>
          </div>

          {/* Iframe File Preview Frame */}
          <div className="glass-panel p-4 h-[60vh] overflow-hidden flex items-center justify-center bg-slate-900/10">
            {doc.fileType === 'application/pdf' ? (
              previewUrl ? (
                <iframe 
                  src={previewUrl} 
                  title={doc.title} 
                  className="w-full h-full border-none rounded-xl"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-xs">Loading secure preview...</p>
                </div>
              )
            ) : doc.fileType.startsWith('image/') ? (
              previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={doc.title} 
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-xs">Loading secure preview...</p>
                </div>
              )
            ) : (
              <div className="text-center p-6 text-slate-400">
                <FiEye size={48} className="mx-auto mb-3" />
                <p className="text-sm">In-browser preview is only supported for PDFs and Images.</p>
                <button onClick={handleDownload} className="inline-block mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 underline">Download to View File</button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI classification & override panel */}
        <div className="space-y-6">
          
          {/* Classification details */}
          <div className="glass-panel p-6 space-y-6">
            
            {/* Header / edit category trigger */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Classification</h3>
                <p className="text-[11px] text-slate-400">Determined primary index mapping</p>
              </div>
              
              {!isEditingCategory && (
                <button 
                  onClick={() => setIsEditingCategory(true)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400"
                  title="Correct Category"
                >
                  <FiEdit3 size={16} />
                </button>
              )}
            </div>

            {/* Category display or correction form */}
            {isEditingCategory ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correct Primary Category</span>
                <select 
                  value={selectedCategoryId} 
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs outline-none text-slate-700 dark:text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name.replace('_', ' ')}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingCategory(false)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveCorrection}
                    disabled={savingCategory}
                    className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    {savingCategory ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <FiCpu size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Category</label>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-md uppercase">{analysis?.activeCategory?.replace('_', ' ')}</h4>
                  </div>
                </div>
                {/* Confidence indicator badge */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Confidence</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-455">{Math.round((analysis?.primaryConfidence || 0.85) * 100)}%</span>
                </div>
              </div>
            )}

            {/* Display override warnings */}
            {analysis?.correctedCategory && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex gap-2 items-start">
                <FiInfo className="mt-0.5 shrink-0" />
                <p>User corrected this category. Original AI prediction was <span className="font-bold">{analysis.primaryCategory}</span>.</p>
              </div>
            )}

            {/* Secondary categories list */}
            {analysis?.secondaryCategories && analysis.secondaryCategories.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Related Categories</span>
                <div className="space-y-2">
                  {analysis.secondaryCategories.map((sc) => (
                    <div key={sc.name} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-650 dark:text-slate-350">{sc.name.replace('_', ' ')}</span>
                      <span className="font-bold text-slate-500">{Math.round(sc.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Skills */}
          <div className="glass-panel p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Detected Skills</h3>
              <p className="text-[11px] text-slate-400">Technical skills mapped in text context</p>
            </div>

            {analysis?.skills && analysis.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.skills.map((skill) => (
                  <span 
                    key={skill.name}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                    title={`Confidence: ${Math.round(skill.confidence * 100)}%`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No skills extracted from document.</p>
            )}
          </div>

          {/* Extracted Entities metadata details */}
          <div className="glass-panel p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Entities & Metadata</h3>
              <p className="text-[11px] text-slate-400">Parsed entities matching names and orgs</p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Organization */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Company / Organization</label>
                {analysis?.entities?.organization && analysis.entities.organization.length > 0 ? (
                  <div className="space-y-1">
                    {analysis.entities.organization.map(org => (
                      <span key={org} className="font-bold text-slate-700 dark:text-slate-300 block">{org}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-450 italic">None detected</span>
                )}
              </div>

              {/* Dates */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Detected Dates</label>
                {analysis?.entities?.dates && analysis.entities.dates.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.entities.dates.map(date => (
                      <span key={date} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px]">{date}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-450 italic">None detected</span>
                )}
              </div>

              {/* Keywords */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Relevant Keywords</label>
                {analysis?.entities?.keywords && analysis.entities.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {analysis.entities.keywords.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-lg text-[10px] font-medium">#{kw}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-450 italic">None detected</span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
