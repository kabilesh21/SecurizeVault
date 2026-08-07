import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import UploadCenter from '../pages/UploadCenter';
import UserProfile from '../pages/UserProfile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import ComingSoon from '../pages/ComingSoon';
import AIOrganization from '../pages/AIOrganization';
import DocumentDetails from '../pages/DocumentDetails';
import KnowledgeGraphPage from '../pages/KnowledgeGraphPage';
import RelationshipExplorer from '../pages/RelationshipExplorer';
import DigitalJourneyTimeline from '../pages/DigitalJourneyTimeline';
import SmartSearch from '../pages/SmartSearch';
import AIAssistant from '../pages/AIAssistant';
import Analytics from '../pages/Analytics';
import CareerInsights from '../pages/CareerInsights';
import ResetPassword from '../pages/ResetPassword';

// Sidebar and Navbar Layout Component
import MainLayout from '../components/common/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Public Routes */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Main App Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><MainLayout><UploadCenter /></MainLayout></ProtectedRoute>} />
      <Route path="/organization" element={<ProtectedRoute><MainLayout><AIOrganization /></MainLayout></ProtectedRoute>} />
      <Route path="/documents/:documentId" element={<ProtectedRoute><MainLayout><DocumentDetails /></MainLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />

      {/* Future modules - Integration Placeholders */}
      <Route path="/search" element={<ProtectedRoute><MainLayout><SmartSearch /></MainLayout></ProtectedRoute>} />
      <Route path="/timeline" element={<ProtectedRoute><MainLayout><DigitalJourneyTimeline /></MainLayout></ProtectedRoute>} />
      <Route path="/graph" element={<ProtectedRoute><MainLayout><KnowledgeGraphPage /></MainLayout></ProtectedRoute>} />
      <Route path="/relationships" element={<ProtectedRoute><MainLayout><RelationshipExplorer /></MainLayout></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><MainLayout><AIAssistant /></MainLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><MainLayout><Analytics /></MainLayout></ProtectedRoute>} />
      <Route path="/career" element={<ProtectedRoute><MainLayout><CareerInsights /></MainLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><MainLayout><ComingSoon title="Admin Portal" description="Manage all platform settings, user categories, and system logs." /></MainLayout></ProtectedRoute>} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
