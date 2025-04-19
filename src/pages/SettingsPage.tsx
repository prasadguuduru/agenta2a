// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { AgentConfig } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

interface SettingsFormData {
  agentId: string;
  agentAliasId: string;
  region: string;
  useMockApi: boolean;
  securitySettings: {
    enableSessionTimeout: boolean;
    sessionTimeoutMinutes: number;
    storeSessionHistory: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
  };
}

const SettingsPage: React.FC = () => {
  // Use only hasRole from useAuth
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [formData, setFormData] = useState<SettingsFormData>({
    agentId: '',
    agentAliasId: '',
    region: 'us-east-1',
    useMockApi: true,
    securitySettings: {
      enableSessionTimeout: true,
      sessionTimeoutMinutes: 30,
      storeSessionHistory: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 20
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Check if user has admin role for advanced settings
  const isAdmin = hasRole('admin');
  
  // Load existing settings from localStorage
  useEffect(() => {
    try {
      // Load agent config
      const savedConfig = localStorage.getItem('agentConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig) as AgentConfig;
        setFormData(prev => ({
          ...prev,
          agentId: config.agentId || '',
          agentAliasId: config.agentAliasId || '',
          region: config.region || 'us-east-1',
          useMockApi: localStorage.getItem('useMockApi') === 'true'
        }));
      }
      
      // Load security settings
      const savedSecuritySettings = localStorage.getItem('securitySettings');
      if (savedSecuritySettings) {
        const securitySettings = JSON.parse(savedSecuritySettings);
        setFormData(prev => ({
          ...prev,
          securitySettings: {
            ...prev.securitySettings,
            ...securitySettings
          }
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (security settings)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof SettingsFormData] as Record<string, any>,
          [child]: type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : type === 'number'
              ? parseInt(value, 10)
              : value
        }
      }));
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Save agent config to localStorage
      const config: AgentConfig = {
        agentId: formData.agentId,
        agentAliasId: formData.agentAliasId,
        region: formData.region
      };
      
      localStorage.setItem('agentConfig', JSON.stringify(config));
      localStorage.setItem('useMockApi', String(formData.useMockApi));
      
      // Save security settings to localStorage
      localStorage.setItem('securitySettings', JSON.stringify(formData.securitySettings));
      
      // Show success message
      setSuccessMessage('Settings saved successfully!');
      notificationService.success('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
      notificationService.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header title="Settings" showSettings={false} />
      
      <div className="flex-grow overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-secondary-200">
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-b-2 border-primary-600 text-primary-700'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-b-2 border-primary-600 text-primary-700'
                  : 'text-secondary-500 hover:text-secondary-700'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
                <span className="font-bold">Success!</span> {successMessage}
              </div>
            )}
            
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-secondary-800">Agent Configuration</h2>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="useMockApi">
                    API Mode
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useMockApi"
                      name="useMockApi"
                      checked={formData.useMockApi}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="useMockApi" className="ml-2 block text-secondary-700">
                      Use Mock API (for development/demo purposes)
                    </label>
                  </div>
                  <p className="mt-1 text-secondary-500 text-sm">
                    When enabled, no actual API calls will be made to AWS Bedrock
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="region">
                    AWS Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="block w-full border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    disabled={formData.useMockApi}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="agentId">
                    Agent ID
                  </label>
                  <input
                    type="text"
                    id="agentId"
                    name="agentId"
                    value={formData.agentId}
                    onChange={handleInputChange}
                    className="block w-full border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your AWS Bedrock Agent ID"
                    disabled={formData.useMockApi}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="agentAliasId">
                    Agent Alias ID
                  </label>
                  <input
                    type="text"
                    id="agentAliasId"
                    name="agentAliasId"
                    value={formData.agentAliasId}
                    onChange={handleInputChange}
                    className="block w-full border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your AWS Bedrock Agent Alias ID"
                    disabled={formData.useMockApi}
                  />
                </div>
              </div>
            )}
            
            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-secondary-800">Security Settings</h2>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="securitySettings.enableSessionTimeout">
                    Session Timeout
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="securitySettings.enableSessionTimeout"
                      name="securitySettings.enableSessionTimeout"
                      checked={formData.securitySettings.enableSessionTimeout}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="securitySettings.enableSessionTimeout" className="ml-2 block text-secondary-700">
                      Enable automatic session timeout
                    </label>
                  </div>
                  <p className="mt-1 text-secondary-500 text-sm">
                    Automatically log out after a period of inactivity
                  </p>
                </div>
                
                {formData.securitySettings.enableSessionTimeout && (
                  <div className="mb-6 pl-6 border-l-2 border-secondary-200">
                    <label className="block text-secondary-700 font-medium mb-2" htmlFor="securitySettings.sessionTimeoutMinutes">
                      Timeout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="securitySettings.sessionTimeoutMinutes"
                      name="securitySettings.sessionTimeoutMinutes"
                      value={formData.securitySettings.sessionTimeoutMinutes}
                      onChange={handleInputChange}
                      min={1}
                      max={120}
                      className="block w-full border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="securitySettings.storeSessionHistory">
                    Session History
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="securitySettings.storeSessionHistory"
                      name="securitySettings.storeSessionHistory"
                      checked={formData.securitySettings.storeSessionHistory}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="securitySettings.storeSessionHistory" className="ml-2 block text-secondary-700">
                      Store chat session history
                    </label>
                  </div>
                  <p className="mt-1 text-secondary-500 text-sm">
                    Save chat sessions for future reference
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary-700 font-medium mb-2" htmlFor="securitySettings.enableRateLimiting">
                    Rate Limiting
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="securitySettings.enableRateLimiting"
                      name="securitySettings.enableRateLimiting"
                      checked={formData.securitySettings.enableRateLimiting}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="securitySettings.enableRateLimiting" className="ml-2 block text-secondary-700">
                      Enable rate limiting
                    </label>
                  </div>
                  <p className="mt-1 text-secondary-500 text-sm">
                    Limit the number of requests to prevent abuse
                  </p>
                </div>
                
                {formData.securitySettings.enableRateLimiting && (
                  <div className="mb-6 pl-6 border-l-2 border-secondary-200">
                    <label className="block text-secondary-700 font-medium mb-2" htmlFor="securitySettings.maxRequestsPerMinute">
                      Maximum Requests Per Minute
                    </label>
                    <input
                      type="number"
                      id="securitySettings.maxRequestsPerMinute"
                      name="securitySettings.maxRequestsPerMinute"
                      value={formData.securitySettings.maxRequestsPerMinute}
                      onChange={handleInputChange}
                      min={1}
                      max={100}
                      className="block w-full border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
                
                {/* Admin-only section */}
                {isAdmin && (
                  <div className="mt-8 pt-6 border-t border-secondary-200">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-4">Advanced Security Settings</h3>
                    <p className="text-secondary-500 text-sm mb-4">
                      These settings are only available to administrators.
                    </p>
                    
                    {/* Advanced security settings could go here */}
                    <div className="bg-secondary-50 p-4 rounded-md">
                      <p className="text-secondary-700">
                        Advanced security settings are currently managed through the AWS Console.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-200">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-secondary-300 text-secondary-700 bg-white rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  isSaving
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;