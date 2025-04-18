
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { AgentConfig } from '../api/types';

interface SettingsFormData {
  agentId: string;
  agentAliasId: string;
  region: string;
  useMockApi: boolean;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SettingsFormData>({
    agentId: '',
    agentAliasId: '',
    region: 'us-east-1',
    useMockApi: true
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load existing settings from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('agentConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig) as AgentConfig;
        setFormData({
          agentId: config.agentId || '',
          agentAliasId: config.agentAliasId || '',
          region: config.region || 'us-east-1',
          useMockApi: localStorage.getItem('useMockApi') === 'true'
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Save settings to localStorage
      const config: AgentConfig = {
        agentId: formData.agentId,
        agentAliasId: formData.agentAliasId,
        region: formData.region
      };
      
      localStorage.setItem('agentConfig', JSON.stringify(config));
      localStorage.setItem('useMockApi', String(formData.useMockApi));
      
      // Redirect back to chat
      setTimeout(() => {
        navigate('/');
        // In a real app, you'd want to reload the application to apply the new settings
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header title="Agent Settings" showSettings={false} />
      
      <div className="flex-grow overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h2 className="text-2xl font-bold mb-6">Agent Configuration</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="flex items-center justify-between mt-8">
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