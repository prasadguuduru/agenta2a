import { AgentConfig, MessageContent } from './types';
import { v4 as uuidv4 } from 'uuid';

// Simple response generator for mock purposes
const generateMockResponse = (prompt: string): MessageContent[] => {
  // Different response types based on prompt
  if (prompt.toLowerCase().includes('video')) {
    return [
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
  } else if (prompt.toLowerCase().includes('options') || prompt.toLowerCase().includes('choose')) {
    return [
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
  } else if (prompt.toLowerCase().includes('features') || prompt.toLowerCase().includes('select')) {
    return [
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
  } else {
    // Default text response
    return [
      {
        type: 'text',
        text: `I understand you're asking about "${prompt}". How can I help you with that?`
      }
    ];
  }
};

export class MockAgentApiService {
  constructor(config: AgentConfig) {
    console.log('Using mock agent API with config:', config);
  }

  async sendMessage(request: { inputText: string; sessionId: string }): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(" #####sendMessage       ");
    
    const responseContent = generateMockResponse(request.inputText);
    
    return {
      completion: JSON.stringify(responseContent),
      sessionId: request.sessionId,
      requestId: uuidv4(),
      promptTokens: request.inputText.split(' ').length,
      completionTokens: Math.floor(Math.random() * 100) + 50
    };
  }
}

// Factory function to create a new mock agent API service
export const createMockAgentApi = (config: AgentConfig): MockAgentApiService => {
  return new MockAgentApiService(config);
};