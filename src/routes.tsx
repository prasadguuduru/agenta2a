// src/routes.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';

// Define role-based access
interface ProtectedRouteProps {
  element: React.ReactElement;
  // requiredRoles removed since it's not used yet
}

// Protected route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For now, allow access regardless of role
  // This simplifies development until the full role system is implemented
  return element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute element={<ChatPage />} />} />
      <Route 
        path="/settings" 
        element={<ProtectedRoute element={<SettingsPage />} />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;