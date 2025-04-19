// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AgentProvider } from './contexts/AgentContext';
import { AuthProvider } from './contexts/AuthContext';
import NotificationProvider from './components/Notification/NotificationProvider';
import AppRoutes from './routes';
import { AgentConfig } from './api/types';
import './styles/globals.css';

const App: React.FC = () => {
  // Load agent configuration from localStorage
  const getInitialConfig = (): { config: AgentConfig, useMockApi: boolean } => {
    try {
      const savedConfig = localStorage.getItem('agentConfig');
      const config = savedConfig 
        ? JSON.parse(savedConfig) as AgentConfig 
        : {
            agentId: '',
            agentAliasId: '',
            region: 'us-east-1'
          };
      
      const useMockApi = localStorage.getItem('useMockApi') !== 'false'; // Default to true
      
      return { config, useMockApi };
    } catch (error) {
      console.error('Failed to load agent configuration:', error);
      // Default configuration if there's an error
      return {
        config: {
          agentId: '',
          agentAliasId: '',
          region: 'us-east-1'
        },
        useMockApi: true
      };
    }
  };
  
  const { config, useMockApi } = getInitialConfig();
  
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <AgentProvider config={config} useMockApi={useMockApi}>
            <AppRoutes />
          </AgentProvider>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;