// src/api/secureAgentApi.ts
import axios, { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AgentConfig, AgentRequest, AgentResponse } from './types';
import notificationService from '../services/notificationService';
import rateLimiterService from '../services/rateLimiterService';
import authService from '../services/authService';

/**
 * Secure Agent API Service with enhanced security features
 */
export class SecureAgentApiService {
  private config: AgentConfig;
  private baseUrl: string;
  private mockMode: boolean;
  
  constructor(config: AgentConfig, useMockApi: boolean = false) {
    this.config = config;
    this.mockMode = useMockApi;
    
    // Configure base URL based on mode
    this.baseUrl = useMockApi 
      ? '/api/mock/bedrock' // In a real app, this would point to your backend proxy
      : `https://bedrock-agent-runtime.${config.region}.amazonaws.com`;
  }
  
  /**
   * Send a message to the agent
   */
  async sendMessage(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Validate the request
      this.validateRequest(request);
      
      // Check rate limit before sending
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      // Send the message based on mode
      if (this.mockMode) {
        return this.sendMockMessage(request);
      } else {
        return this.sendSecureMessage(request);
      }
    } catch (error) {
      console.error('Error sending message to agent:', error);
      
      // Show notification for errors
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      notificationService.error(errorMessage);
      
      throw error;
    }
  }
  
  /**
   * Validate the request parameters
   */
  private validateRequest(request: AgentRequest): void {
    // Ensure sessionId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.sessionId)) {
      throw new Error('Invalid session ID format');
    }
    
    // Validate input text
    if (!request.inputText || request.inputText.trim() === '') {
      throw new Error('Input text cannot be empty');
    }
    
    // Add character limit to prevent abuse
    if (request.inputText.length > 4000) {
      throw new Error('Input text exceeds maximum length of 4000 characters');
    }
  }
  
  /**
   * Check if the request should be allowed based on rate limiting rules
   */
  private checkRateLimit(): boolean {
    // Get rate limit status
    const rateLimitStatus = rateLimiterService.getRateLimitStatus();
    
    // If rate limiting is disabled, always allow
    if (!rateLimitStatus.enabled) {
      return true;
    }
    
    // Check if we can proceed
    const canProceed = rateLimiterService.checkRateLimit();
    
    if (!canProceed) {
      // Show rate limit exceeded notification
      notificationService.rateLimitExceeded(rateLimitStatus.resetInSeconds);
      return false;
    }
    
    return true;
  }
  
  /**
   * Send a secure message to the real AWS Bedrock API
   */
  private async sendSecureMessage(request: AgentRequest): Promise<AgentResponse> {
    // Get authentication token
    const token = await authService.getToken();
    
    // Create request config with authorization
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // In production, this should go through your backend proxy
    // to avoid exposing AWS credentials in the frontend
    const response = await axios.post(
      `${this.baseUrl}/agents/${this.config.agentId}/agent-aliases/${this.config.agentAliasId}/sessions/${request.sessionId}/text`,
      {
        inputText: request.inputText,
        enableTrace: false
      },
      config
    );
    
    return {
      completion: response.data.completion || '',
      sessionId: request.sessionId,
      requestId: response.data.requestId || uuidv4(),
      promptTokens: response.data.metrics?.promptTokens,
      completionTokens: response.data.metrics?.completionTokens
    };
  }
  
  /**
   * Send a mock message for development/testing
   */
  private async sendMockMessage(request: AgentRequest): Promise<AgentResponse> {
    // Simulate network delay (reduced for testing)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate different response types based on the input
    let responseContent;
    
    if (request.inputText.toLowerCase().includes('video')) {
      responseContent = [
        {
          type: 'text',
          text: 'Here\'s a demo video about AWS Bedrock agents:'
        },
        {
          type: 'video',
          videoId: 'dQw4w9WgXcQ', // Replace with actual AWS Bedrock video ID
          title: 'AWS Bedrock Agents Demo'
        }
      ];
    } else if (request.inputText.toLowerCase().includes('options') || request.inputText.toLowerCase().includes('choose')) {
      responseContent = [
        {
          type: 'text',
          text: 'Please select your preference:'
        },
        {
          type: 'choices',
          question: 'Which AWS service are you most interested in?',
          options: ['AWS Bedrock', 'Amazon SageMaker', 'Amazon Comprehend', 'Amazon Rekognition'],
          selectionType: 'radio'
        }
      ];
    } else if (request.inputText.toLowerCase().includes('features') || request.inputText.toLowerCase().includes('select')) {
      responseContent = [
        {
          type: 'text',
          text: 'Please select all features you want to enable:'
        },
        {
          type: 'choices',
          question: 'AWS Bedrock Features',
          options: ['Knowledge Base Integration', 'Multi-agent Collaboration', 'Custom Prompt Templates', 'API Integration'],
          selectionType: 'checkbox'
        }
      ];
    } else if (request.inputText.toLowerCase().includes('security')) {
      responseContent = [
        {
          type: 'text',
          text: 'Here are some security best practices for AWS Bedrock:'
        },
        {
          type: 'text',
          text: '1. Use IAM roles with least privilege\n2. Implement proper authentication\n3. Enable request validation\n4. Set up rate limiting\n5. Use a backend proxy for API calls'
        }
      ];
    } else {
      // Default text response
      responseContent = [
        {
          type: 'text',
          text: `I understand you're asking about "${request.inputText}". How can I help you with that?`
        }
      ];
    }
    
    return {
      completion: JSON.stringify(responseContent),
      sessionId: request.sessionId,
      requestId: uuidv4(),
      promptTokens: request.inputText.split(' ').length,
      completionTokens: Math.floor(Math.random() * 100) + 50
    };
  }
}

// Factory function to create a new secure agent API service
export const createSecureAgentApi = (config: AgentConfig, useMockApi: boolean = false): SecureAgentApiService => {
  return new SecureAgentApiService(config, useMockApi);
};