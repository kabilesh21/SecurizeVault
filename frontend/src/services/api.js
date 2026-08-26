import axios from 'axios';

// Document API services
export const documentService = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  getAll: () => axios.get('/api/documents'),

  getById: (id) => axios.get(`/api/documents/${id}`),

  replace: (id, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.put(`/api/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  delete: (id) => axios.delete(`/api/documents/${id}`),

  submitPortfolioLink: (url) => axios.post('/api/documents/portfolio', { url }),

  submitGithubLink: (url) => axios.post('/api/documents/github', { url })
};

// User Stats API services
export const userService = {
  getStats: () => axios.get('/api/users/stats'),
  getProfile: () => axios.get('/api/users/profile'),
  updateProfile: (data) => axios.put('/api/users/profile', data),
  changePassword: (data) => axios.post('/api/users/change-password', data)
};

// Categorization API services
export const categorizationService = {
  analyze: (documentId) => axios.post(`/api/categorization/analyze/${documentId}`),
  analyzeAll: () => axios.post('/api/categorization/analyze-all'),
  reprocess: (documentId) => axios.post(`/api/categorization/reprocess/${documentId}`),
  getResults: (documentId) => axios.get(`/api/categorization/results/${documentId}`),
  getCategorizedDocuments: () => axios.get('/api/categorization/documents'),
  getCategories: () => axios.get('/api/categories'),
  getDocumentsByCategory: (categoryName) => axios.get(`/api/categories/${categoryName}/documents`),
  getSkills: () => axios.get('/api/skills'),
  getDocumentsBySkill: (skillName) => axios.get(`/api/skills/{skillName}/documents`),
  correctCategory: (documentId, categoryId) => axios.put(`/api/categorization/${documentId}/category`, { categoryId })
};

// Relationship and Graph API services
export const relationshipService = {
  getKnowledgeGraph: () => axios.get('/api/knowledge-graph'),
  getNodeDetails: (nodeId) => axios.get(`/api/knowledge-graph/node/${nodeId}`),
  getNeighbors: (nodeId) => axios.get(`/api/knowledge-graph/neighbors/${nodeId}`),
  findPath: (sourceId, targetId) => axios.get(`/api/knowledge-graph/path?sourceId=${sourceId}&targetId=${targetId}`),
  getCareerPaths: () => axios.get('/api/career-paths'),
  getRecommendations: () => axios.get('/api/career-paths/recommendations'),
  rebuildGraph: () => axios.post('/api/relationships/rebuild'),
  getRelationships: () => axios.get('/api/relationships'),
  getRelationshipDetails: (relationshipId) => axios.get(`/api/relationships/${relationshipId}`),
  confirmRelationship: (relationshipId) => axios.post(`/api/relationships/${relationshipId}/confirm`),
  rejectRelationship: (relationshipId) => axios.post(`/api/relationships/${relationshipId}/reject`),
  createManualRelationship: (sourceNodeId, targetNodeId, relationshipType, evidence) => 
    axios.post('/api/relationships/manual', { sourceNodeId, targetNodeId, relationshipType, evidence }),
  deleteRelationship: (relationshipId) => axios.delete(`/api/relationships/${relationshipId}`)
};

// Timeline API services
export const timelineService = {
  // Generation
  generate: () => axios.post('/api/timeline/generate'),
  rebuild: () => axios.post('/api/timeline/rebuild'),

  // Query
  getAll: (params = {}) => axios.get('/api/timeline', { params }),
  getEvents: (params = {}) => axios.get('/api/timeline/events', { params }),
  getEventById: (eventId) => axios.get(`/api/timeline/events/${eventId}`),

  // Manual event CRUD
  createManual: (data) => axios.post('/api/timeline/events/manual', data),
  updateEvent: (eventId, data) => axios.put(`/api/timeline/events/${eventId}`, data),
  deleteEvent: (eventId) => axios.delete(`/api/timeline/events/${eventId}`),

  // Status actions
  confirmEvent: (eventId) => axios.post(`/api/timeline/events/${eventId}/confirm`),
  hideEvent: (eventId) => axios.post(`/api/timeline/events/${eventId}/hide`),
  restoreEvent: (eventId) => axios.post(`/api/timeline/events/${eventId}/restore`),

  // Insights & milestones
  getInsights: () => axios.get('/api/timeline/insights'),
  getMilestones: () => axios.get('/api/timeline/milestones'),

  // Summary
  getSummary: () => axios.get('/api/timeline/summary'),
  getStatistics: () => axios.get('/api/timeline/statistics'),

  // Preferences
  getPreferences: () => axios.get('/api/timeline/preferences'),
  updatePreferences: (data) => axios.put('/api/timeline/preferences', data),
};

// Search API services
export const searchService = {
  search: (query) => axios.post('/api/search', { query }),
  getSuggestions: () => axios.get('/api/search/suggestions'),
  getHistory: () => axios.get('/api/search/history'),
  deleteHistoryItem: (historyId) => axios.delete(`/api/search/history/${historyId}`),
  clearHistory: () => axios.delete('/api/search/history'),
  reindex: () => axios.post('/api/search/reindex'),
  reindexDocument: (documentId) => axios.post(`/api/search/reindex/document/${documentId}`),
  getStatus: () => axios.get('/api/search/status')
};

// Career Path API services
export const careerService = {
  getAll: () => axios.get('/api/career-paths'),
  getRecommendations: () => axios.get('/api/career-paths/recommendations')
};
