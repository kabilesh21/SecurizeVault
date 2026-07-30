import React, { useEffect, useRef, useState } from 'react';
import { relationshipService } from '../services/api';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { 
  FiRefreshCw, FiPlus, FiMaximize, FiZoomIn, 
  FiZoomOut, FiSearch, FiSliders, FiHelpCircle,
  FiFileText, FiAward, FiBookOpen, FiActivity,
  FiBriefcase, FiLink, FiCpu, FiExternalLink, FiX
} from 'react-icons/fi';
import ManualRelationshipModal from '../components/common/ManualRelationshipModal';

const KnowledgeGraphPage = () => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  // States
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  
  // Selection panels
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState('ALL');
  const [selectedRelType, setSelectedRelType] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(0.70);

  // Modal control
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Re-fetch function
  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await relationshipService.getKnowledgeGraph();
      setGraphData(res.data);
    } catch (err) {
      console.error("Failed to fetch knowledge graph", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Rebuild Graph
  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      const res = await relationshipService.rebuildGraph();
      setGraphData(res.data);
      setSelectedNode(null);
      setSelectedEdge(null);
    } catch (err) {
      console.error("Failed to rebuild graph", err);
    } finally {
      setRebuilding(false);
    }
  };

  // Node Type Stylings
  const getNodeStyle = (type, dark) => {
    const defaultColor = dark ? '#475569' : '#cbd5e1';
    
    switch (type) {
      case 'DOCUMENT': return { color: '#64748b', shape: 'box' };
      case 'CERTIFICATE': return { color: '#eab308', shape: 'ellipse' };
      case 'SKILL': return { color: '#10b981', shape: 'box' };
      case 'PROJECT': return { color: '#a855f7', shape: 'diamond' };
      case 'INTERNSHIP': return { color: '#0ea5e9', shape: 'triangle' };
      case 'CAREER_PATH': return { color: '#6366f1', shape: 'hexagon' };
      case 'TECHNOLOGY': return { color: '#14b8a6', shape: 'box' };
      case 'ORGANIZATION': return { color: '#f97316', shape: 'dot' };
      case 'RESUME': return { color: '#ec4899', shape: 'box' };
      default: return { color: defaultColor, shape: 'dot' };
    }
  };

  // Build and render graph
  useEffect(() => {
    if (!containerRef.current || loading) return;

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Apply filters
    const filteredNodes = graphData.nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedNodeType === 'ALL' || node.entityType === selectedNodeType;
      return matchesSearch && matchesType;
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredEdges = graphData.edges.filter(edge => {
      const matchesRelType = selectedRelType === 'ALL' || edge.relationshipType === selectedRelType;
      const matchesConfidence = edge.confidenceScore >= minConfidence;
      const containsNodes = nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId);
      return matchesRelType && matchesConfidence && containsNodes;
    });

    // Format for Vis.js
    const visNodes = new DataSet(
      filteredNodes.map(node => {
        const style = getNodeStyle(node.entityType, isDarkMode);
        return {
          id: node.id,
          label: node.name,
          shape: style.shape,
          color: {
            background: style.color,
            border: isDarkMode ? '#1e293b' : '#f8fafc',
            highlight: { background: style.color, border: '#6366f1' }
          },
          font: { color: isDarkMode ? '#f8fafc' : '#0f172a', face: 'Outfit', size: 12 },
          margin: 10,
          shadow: true
        };
      })
    );

    const visEdges = new DataSet(
      filteredEdges.map(edge => ({
        id: edge.id,
        from: edge.sourceNodeId,
        to: edge.targetNodeId,
        label: edge.relationshipType,
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        color: { color: isDarkMode ? '#475569' : '#94a3b8', highlight: '#6366f1' },
        font: { color: isDarkMode ? '#94a3b8' : '#475569', size: 9, face: 'Outfit', align: 'horizontal' },
        width: 1.5,
        shadow: false
      }))
    );

    const data = { nodes: visNodes, edges: visEdges };

    const options = {
      physics: {
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -1800,
          centralGravity: 0.3,
          springLength: 100,
          springConstant: 0.04
        }
      },
      interaction: {
        hover: true,
        zoomView: true,
        dragView: true
      }
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Click Handlers
    network.on('selectNode', (params) => {
      const nodeId = params.nodes[0];
      const node = filteredNodes.find(n => n.id === nodeId);
      setSelectedNode(node);
      setSelectedEdge(null);
    });

    network.on('selectEdge', (params) => {
      // If node is selected, don't show edge details
      if (params.nodes.length > 0) return;
      const edgeId = params.edges[0];
      const edge = filteredEdges.find(e => e.id === edgeId);
      setSelectedEdge(edge);
      setSelectedNode(null);
    });

    network.on('deselectNode', () => {
      setSelectedNode(null);
    });

    network.on('deselectEdge', () => {
      setSelectedEdge(null);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [graphData, loading, search, selectedNodeType, selectedRelType, minConfidence]);

  // Handle confirming edge
  const handleConfirmEdge = async (edgeId) => {
    try {
      await relationshipService.confirmRelationship(edgeId);
      fetchGraph();
      if (selectedEdge && selectedEdge.id === edgeId) {
        setSelectedEdge({ ...selectedEdge, status: 'CONFIRMED' });
      }
    } catch (err) {
      console.error("Failed to confirm connection", err);
    }
  };

  // Handle rejecting edge
  const handleRejectEdge = async (edgeId) => {
    try {
      await relationshipService.rejectRelationship(edgeId);
      fetchGraph();
      setSelectedEdge(null);
    } catch (err) {
      console.error("Failed to reject connection", err);
    }
  };

  // Node type legend mapping
  const nodeTypes = [
    { type: 'DOCUMENT', label: 'Documents', color: 'bg-[#64748b]' },
    { type: 'CERTIFICATE', label: 'Certificates', color: 'bg-[#eab308]' },
    { type: 'SKILL', label: 'Skills', color: 'bg-[#10b981]' },
    { type: 'PROJECT', label: 'Projects', color: 'bg-[#a855f7]' },
    { type: 'INTERNSHIP', label: 'Internships', color: 'bg-[#0ea5e9]' },
    { type: 'CAREER_PATH', label: 'Career Paths', color: 'bg-[#6366f1]' },
    { type: 'TECHNOLOGY', label: 'Technologies', color: 'bg-[#14b8a6]' },
    { type: 'ORGANIZATION', label: 'Organizations', color: 'bg-[#f97316]' },
    { type: 'RESUME', label: 'Resumes', color: 'bg-[#ec4899]' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 h-full flex flex-col">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Knowledge Graph</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI-inferred relationships visualizer showing credentials paths.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleRebuild}
            disabled={rebuilding}
            className="glass-btn glass-btn-secondary px-4 py-2.5 text-xs font-bold"
          >
            <FiRefreshCw className={rebuilding ? 'animate-spin' : ''} />
            <span>{rebuilding ? 'Rebuilding Graph...' : 'Rebuild Graph'}</span>
          </button>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="glass-btn glass-btn-primary px-4 py-2.5 text-xs font-bold"
          >
            <FiPlus />
            <span>Create Link</span>
          </button>
        </div>
      </div>

      {/* Filter and layout panel */}
      <div className="glass-panel p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shrink-0">
        
        {/* Search */}
        <div className="relative flex items-center">
          <FiSearch className="absolute left-4 text-slate-455" />
          <input 
            type="text" 
            placeholder="Search nodes by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl pl-11 pr-4 py-2.5 outline-none text-xs text-slate-700 dark:text-white"
          />
        </div>

        {/* Node Type filter */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold">
          <span className="mr-2">Node:</span>
          <select 
            value={selectedNodeType}
            onChange={(e) => setSelectedNodeType(e.target.value)}
            className="bg-transparent outline-none cursor-pointer w-full"
          >
            <option value="ALL">All Nodes</option>
            {nodeTypes.map(nt => (
              <option key={nt.type} value={nt.type}>{nt.label}</option>
            ))}
          </select>
        </div>

        {/* Edge / relationship type filter */}
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-650 dark:text-slate-300 font-semibold">
          <span className="mr-2">Relation:</span>
          <select 
            value={selectedRelType}
            onChange={(e) => setSelectedRelType(e.target.value)}
            className="bg-transparent outline-none cursor-pointer w-full"
          >
            <option value="ALL">All Relations</option>
            <option value="CERTIFIES">CERTIFIES</option>
            <option value="VALIDATES">VALIDATES</option>
            <option value="DEMONSTRATES">DEMONSTRATES</option>
            <option value="USES">USES</option>
            <option value="CONTRIBUTES_TO">CONTRIBUTES_TO</option>
            <option value="SUPPORTS">SUPPORTS</option>
            <option value="BUILT_DURING">BUILT_DURING</option>
            <option value="MENTIONS">MENTIONS</option>
            <option value="RELATED_TO">RELATED_TO</option>
          </select>
        </div>

        {/* Confidence slider filter */}
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
            <span>Min Confidence</span>
            <span>{Math.round(minConfidence * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.0" 
            max="1.0" 
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-full accent-indigo-650 bg-slate-200 dark:bg-slate-800 rounded-lg h-1.5 cursor-pointer outline-none"
          />
        </div>
      </div>

      {/* Main Canvas & details split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[50vh]">
        
        {/* Visual Graph container */}
        <div className="lg:col-span-3 glass-panel relative p-0 overflow-hidden flex flex-col justify-between">
          
          {/* Legend */}
          <div className="absolute top-4 left-4 z-10 p-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-sm rounded-xl space-y-2 text-[10px] shadow-md font-bold tracking-wide">
            <span className="block border-b border-slate-100 dark:border-slate-800 pb-1 uppercase text-slate-450 dark:text-slate-500 mb-2">Legend</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {nodeTypes.map(nt => (
                <div key={nt.type} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${nt.color} shrink-0`} />
                  <span className="text-slate-600 dark:text-slate-300">{nt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graph canvas */}
          <div ref={containerRef} className="w-full h-full min-h-[450px]" />
          
          {/* Instruction helper footer */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-850/80 text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1.5 justify-center">
            <FiHelpCircle />
            <span>Drag nodes to organize. Scroll/pinch to zoom. Click node or edge line to view metadata details.</span>
          </div>
        </div>

        {/* Details Sidebar panel */}
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px] lg:h-full">
          {selectedNode ? (
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{selectedNode.entityType}</span>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2 leading-tight">{selectedNode.name}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block mb-1">Description</span>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-200/40 dark:border-slate-850">{selectedNode.description || 'No description available for this entity.'}</p>
                </div>

                {selectedNode.sourceDocumentId && (
                  <div>
                    <span className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block mb-1">Origin Document</span>
                    <a 
                      href={`/documents/${selectedNode.sourceDocumentId}`} 
                      className="p-3 bg-slate-50 dark:bg-slate-955 hover:border-indigo-500/40 border border-slate-200/40 dark:border-slate-850 rounded-xl flex items-center justify-between transition-colors font-semibold"
                    >
                      <span className="text-indigo-650 dark:text-indigo-455 truncate">Review Extracted File</span>
                      <FiExternalLink size={13} className="text-indigo-550 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 uppercase tracking-wider font-mono">{selectedEdge.relationshipType}</span>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-3 leading-tight">
                    {selectedEdge.sourceNodeName} &rarr; {selectedEdge.targetNodeName}
                  </h3>
                </div>
                <button onClick={() => setSelectedEdge(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                  <FiX size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block">Confidence</span>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{Math.round(selectedEdge.confidenceScore * 100)}%</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block">Source</span>
                    <span className="px-2 py-0.5 mt-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold font-mono text-[9px] text-slate-550 tracking-wide uppercase inline-block">{selectedEdge.relationshipSource}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block mb-1">AI Evidence</span>
                  <p className="text-slate-655 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-slate-200/40 dark:border-slate-850">{selectedEdge.evidence || 'No evidence text provided.'}</p>
                </div>

                {selectedEdge.status === 'ACTIVE' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850/80 mt-4">
                    <button 
                      onClick={() => handleRejectEdge(selectedEdge.id)}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold"
                    >
                      Reject Link
                    </button>
                    <button 
                      onClick={() => handleConfirmEdge(selectedEdge.id)}
                      className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg font-bold"
                    >
                      Confirm Link
                    </button>
                  </div>
                )}

                {selectedEdge.status === 'CONFIRMED' && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-1.5 justify-center">
                    <span>Verified Connection</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-12">
              <FiSliders size={32} className="opacity-40 mb-3" />
              <p className="font-bold text-sm">Select Node or Edge</p>
              <p className="text-[10px] mt-1 pr-4 pl-4">Click on any visual connection point to reveal matching metadata and career validation paths.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual connection modal */}
      <ManualRelationshipModal 
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        nodes={graphData.nodes}
        onCreated={fetchGraph}
      />
    </div>
  );
};

export default KnowledgeGraphPage;
