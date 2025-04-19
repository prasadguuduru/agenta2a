// src/api/mockAgentApi.ts
import { AgentConfig, MessageContent } from './types';
import { v4 as uuidv4 } from 'uuid';
import notificationService from '../services/notificationService';

// Enhanced response generator for mock purposes
const generateMockResponse = (prompt: string): MessageContent[] => {
  // Convert prompt to lowercase for easier matching
  const promptLower = prompt.toLowerCase();
  
  // Security demonstration examples
  if (promptLower.includes('security') || promptLower.includes('secure')) {
    return [
      {
        type: 'text',
        text: 'AWS Bedrock Security Features:'
      },
      {
        type: 'securityDashboard',
        title: 'Security Dashboard',
        securityScore: 85,
        recommendations: [
          'Enable multi-factor authentication',
          'Use IAM roles with least privilege',
          'Implement request validation',
          'Set up rate limiting',
          'Use backend proxy for API calls'
        ],
        actions: [
          { label: 'Run Security Scan', value: 'scan' },
          { label: 'View Security Report', value: 'report' },
          { label: 'Update Security Settings', value: 'settings' }
        ],
        submitButton: {
          text: 'Take Action',
          onSubmit: 'securityAction'
        }
      }
    ];
  }
  
  // Single selection (Radio buttons)
  else if (promptLower.includes('choose') || promptLower.includes('select one')) {
    return [
      {
        type: 'text',
        text: 'Please select your preferred AWS service:'
      },
      {
        type: 'choices',
        question: 'Which AWS service are you most interested in?',
        options: [
          { label: 'AWS Bedrock', value: 'bedrock', description: 'Foundation models for generative AI' },
          { label: 'Amazon SageMaker', value: 'sagemaker', description: 'Build, train, and deploy ML models' },
          { label: 'Amazon Comprehend', value: 'comprehend', description: 'Natural language processing' },
          { label: 'Amazon Rekognition', value: 'rekognition', description: 'Image and video analysis' }
        ],
        selectionType: 'radio',
        submitButton: {
          text: 'Confirm Selection',
          onSubmit: 'serviceSelected'
        }
      }
    ];
  }
  
  // Multiple selection (Checkboxes)
  else if (promptLower.includes('features') || promptLower.includes('select multiple')) {
    return [
      {
        type: 'text',
        text: 'Please select all features you want to enable:'
      },
      {
        type: 'choices',
        question: 'AWS Bedrock Features',
        options: [
          { label: 'Knowledge Base Integration', value: 'kb', description: 'Connect to your existing data sources' },
          { label: 'Multi-agent Collaboration', value: 'multi-agent', description: 'Enable agents to work together' },
          { label: 'Custom Prompt Templates', value: 'templates', description: 'Create reusable prompt templates' },
          { label: 'API Integration', value: 'api', description: 'Connect with external services' }
        ],
        selectionType: 'checkbox',
        submitButton: {
          text: 'Enable Features',
          onSubmit: 'featuresEnabled'
        }
      }
    ];
  }
  
  // Text input field
  else if (promptLower.includes('input') || promptLower.includes('text field')) {
    return [
      {
        type: 'text',
        text: 'Please provide the following information:'
      },
      {
        type: 'form',
        title: 'Configuration Form',
        fields: [
          {
            type: 'text',
            label: 'Project Name',
            placeholder: 'Enter project name',
            required: true,
            id: 'projectName'
          }
        ],
        submitButton: {
          text: 'Save Configuration',
          onSubmit: 'configSaved'
        }
      }
    ];
  }
  
  // Multiple input fields
  else if (promptLower.includes('form') || promptLower.includes('multiple fields')) {
    return [
      {
        type: 'text',
        text: 'Please fill out the agent configuration form:'
      },
      {
        type: 'form',
        title: 'Agent Configuration',
        fields: [
          {
            type: 'text',
            label: 'Agent Name',
            placeholder: 'Enter agent name',
            required: true,
            id: 'agentName'
          },
          {
            type: 'select',
            label: 'Foundation Model',
            options: [
              { label: 'Claude 3 Opus', value: 'claude-3-opus' },
              { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
              { label: 'Claude 3 Haiku', value: 'claude-3-haiku' }
            ],
            required: true,
            id: 'model'
          },
          {
            type: 'number',
            label: 'Max Tokens',
            placeholder: 'Enter max tokens',
            required: false,
            id: 'maxTokens'
          },
          {
            type: 'textarea',
            label: 'System Prompt',
            placeholder: 'Enter system prompt',
            required: false,
            id: 'systemPrompt'
          }
        ],
        submitButton: {
          text: 'Create Agent',
          onSubmit: 'agentCreated'
        }
      }
    ];
  }
  
  // Date and time selection
  else if (promptLower.includes('date') || promptLower.includes('schedule')) {
    return [
      {
        type: 'text',
        text: 'Please schedule your AWS Bedrock demo:'
      },
      {
        type: 'form',
        title: 'Demo Scheduling',
        fields: [
          {
            type: 'date',
            label: 'Demo Date',
            required: true,
            id: 'demoDate'
          },
          {
            type: 'time',
            label: 'Demo Time',
            required: true,
            id: 'demoTime'
          },
          {
            type: 'select',
            label: 'Time Zone',
            options: [
              { label: 'Pacific Time (PT)', value: 'PT' },
              { label: 'Eastern Time (ET)', value: 'ET' },
              { label: 'Coordinated Universal Time (UTC)', value: 'UTC' }
            ],
            required: true,
            id: 'timeZone'
          }
        ],
        submitButton: {
          text: 'Schedule Demo',
          onSubmit: 'demoScheduled'
        }
      }
    ];
  }
  
  // File upload
  else if (promptLower.includes('upload') || promptLower.includes('file')) {
    return [
      {
        type: 'text',
        text: 'Please upload the necessary files for your knowledge base:'
      },
      {
        type: 'form',
        title: 'Knowledge Base Configuration',
        fields: [
          {
            type: 'text',
            label: 'Knowledge Base Name',
            placeholder: 'Enter KB name',
            required: true,
            id: 'kbName'
          },
          {
            type: 'file',
            label: 'Upload Documents',
            allowedTypes: '.pdf,.docx,.txt',
            multiple: true,
            required: true,
            id: 'documents'
          }
        ],
        submitButton: {
          text: 'Create Knowledge Base',
          onSubmit: 'knowledgeBaseCreated'
        }
      }
    ];
  }
  
  // Rating and feedback
  else if (promptLower.includes('feedback') || promptLower.includes('rate')) {
    return [
      {
        type: 'text',
        text: 'Please provide your feedback on the AWS Bedrock service:'
      },
      {
        type: 'form',
        title: 'Service Feedback',
        fields: [
          {
            type: 'rating',
            label: 'Overall Satisfaction',
            maxRating: 5,
            required: true,
            id: 'satisfaction'
          },
          {
            type: 'checkbox',
            label: 'Areas that met your expectations',
            options: [
              { label: 'Ease of use', value: 'ease' },
              { label: 'Performance', value: 'performance' },
              { label: 'Features', value: 'features' },
              { label: 'Documentation', value: 'documentation' },
              { label: 'Support', value: 'support' }
            ],
            required: false,
            id: 'metExpectations'
          },
          {
            type: 'textarea',
            label: 'Additional Comments',
            placeholder: 'Please share any additional feedback',
            required: false,
            id: 'comments'
          }
        ],
        submitButton: {
          text: 'Submit Feedback',
          onSubmit: 'feedbackSubmitted'
        }
      }
    ];
  }
  
  // Video response
  else if (promptLower.includes('video') || promptLower.includes('demo')) {
    return [
      {
        type: 'text',
        text: 'Here\'s a demo video about AWS Bedrock agents:'
      },
      {
        type: 'video',
        videoId: 'dQw4w9WgXcQ', // Replace with actual AWS Bedrock video ID
        title: 'AWS Bedrock Agents Demo',
        additionalActions: [
          { label: 'View Documentation', value: 'docs' },
          { label: 'Try It Now', value: 'try' }
        ],
        submitButton: {
          text: 'Take Action',
          onSubmit: 'videoAction'
        }
      }
    ];
  }
  
  // Confirmation dialog
  else if (promptLower.includes('confirm') || promptLower.includes('verify')) {
    return [
      {
        type: 'text',
        text: 'Please confirm your action:'
      },
      {
        type: 'confirmation',
        title: 'Confirm Action',
        message: 'Are you sure you want to deploy this agent to production? This action cannot be undone.',
        confirmButton: 'Yes, Deploy to Production',
        cancelButton: 'Cancel',
        onSubmit: 'deploymentConfirmed'
      }
    ];
  }
  
  // Progress indicator
  else if (promptLower.includes('status') || promptLower.includes('progress')) {
    return [
      {
        type: 'text',
        text: 'Here\'s the current status of your deployment:'
      },
      {
        type: 'progress',
        title: 'Deployment Progress',
        status: 'in_progress',
        percentage: 65,
        steps: [
          { label: 'Resource validation', status: 'completed' },
          { label: 'Model deployment', status: 'completed' },
          { label: 'Knowledge base indexing', status: 'in_progress' },
          { label: 'API configuration', status: 'pending' },
          { label: 'Final validation', status: 'pending' }
        ],
        refreshButton: {
          text: 'Refresh Status',
          onSubmit: 'refreshStatus'
        }
      }
    ];
  }
  
  // Default text response
  else {
    return [
      {
        type: 'text',
        text: `I understand you're asking about "${prompt}". I can demonstrate various interactive elements. Try asking about:

1. "security" - View security dashboard
2. "select one" - Radio button selection
3. "select multiple" - Checkbox selection
4. "text field" - Single input field
5. "multiple fields" - Complex form
6. "schedule" - Date and time inputs
7. "upload" - File upload interface
8. "feedback" - Rating and feedback form
9. "video" - Video player with actions
10. "confirm" - Confirmation dialog
11. "progress" - Progress indicator

Which would you like to explore?`
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
    
    // Handle form submissions and interactions
    if (request.inputText.startsWith('__SUBMIT__:')) {
      const submitData = JSON.parse(request.inputText.substring(10));
      return this.handleSubmission(submitData);
    }
    
    // Generate standard response based on prompt
    const responseContent = generateMockResponse(request.inputText);
    
    return {
      completion: JSON.stringify(responseContent),
      sessionId: request.sessionId,
      requestId: uuidv4(),
      promptTokens: request.inputText.split(' ').length,
      completionTokens: Math.floor(Math.random() * 100) + 50
    };
  }
  
  // Handler for form and button submissions
  private async handleSubmission(submitData: { action: string, formData?: any }): Promise<any> {
    const { action, formData } = submitData;
    let responseContent: MessageContent[] = [];
    
    // Show notification to demonstrate interaction
    notificationService.success(`Action performed: ${action}`);
    
    switch (action) {
      case 'securityAction':
        if (formData.value === 'scan') {
          responseContent = [
            {
              type: 'text',
              text: 'Running security scan...'
            },
            {
              type: 'progress',
              title: 'Security Scan',
              status: 'in_progress',
              percentage: 0,
              steps: [
                { label: 'Scanning IAM roles', status: 'in_progress' },
                { label: 'Analyzing network config', status: 'pending' },
                { label: 'Checking encryption', status: 'pending' },
                { label: 'Validating access controls', status: 'pending' }
              ],
              refreshButton: {
                text: 'Refresh Scan Status',
                onSubmit: 'refreshScan'
              }
            }
          ];
        } else if (formData.value === 'report') {
          responseContent = [
            {
              type: 'text',
              text: 'Here\'s your security report:'
            },
            {
              type: 'securityReport',
              title: 'Security Audit Report',
              timestamp: new Date().toISOString(),
              findings: [
                { severity: 'high', category: 'Authentication', message: 'MFA not enabled for all users', recommendation: 'Enable MFA for all IAM users' },
                { severity: 'medium', category: 'Access Control', message: 'Overly permissive IAM roles', recommendation: 'Apply principle of least privilege' },
                { severity: 'low', category: 'Encryption', message: 'Some data not encrypted at rest', recommendation: 'Enable encryption for all S3 buckets' }
              ],
              downloadButton: {
                text: 'Download PDF Report',
                onSubmit: 'downloadReport'
              }
            }
          ];
        } else {
          responseContent = [
            {
              type: 'text',
              text: 'Opening security settings...'
            },
            {
              type: 'form',
              title: 'Security Settings',
              fields: [
                {
                  type: 'checkbox',
                  label: 'Security Features',
                  options: [
                    { label: 'Enable MFA', value: 'mfa', checked: false },
                    { label: 'API request validation', value: 'validation', checked: true },
                    { label: 'Rate limiting', value: 'rateLimit', checked: true },
                    { label: 'Automatic session timeout', value: 'sessionTimeout', checked: true }
                  ],
                  required: false,
                  id: 'securityFeatures'
                },
                {
                  type: 'select',
                  label: 'Session Timeout',
                  options: [
                    { label: '15 minutes', value: '15' },
                    { label: '30 minutes', value: '30' },
                    { label: '1 hour', value: '60' },
                    { label: '4 hours', value: '240' }
                  ],
                  required: true,
                  id: 'timeout'
                }
              ],
              submitButton: {
                text: 'Save Security Settings',
                onSubmit: 'saveSecuritySettings'
              }
            }
          ];
        }
        break;
        
      case 'serviceSelected':
        responseContent = [
          {
            type: 'text',
            text: `You've selected ${formData.label} (${formData.value}).`
          },
          {
            type: 'text',
            text: `Here's how to get started with ${formData.label}:`
          },
          {
            type: 'steps',
            title: `Getting Started with ${formData.label}`,
            steps: [
              'Create an AWS account if you don\'t have one',
              'Navigate to the AWS console',
              `Find ${formData.label} in the services menu`,
              'Click "Get Started" to begin setting up your service'
            ]
          }
        ];
        break;
        
      case 'featuresEnabled':
        const selectedFeatures = Array.isArray(formData) ? formData : [formData];
        const featuresList = selectedFeatures.map(f => f.label).join(', ');
        
        responseContent = [
          {
            type: 'text',
            text: `You've enabled the following features: ${featuresList}`
          },
          {
            type: 'text',
            text: 'Would you like to configure these features now?'
          },
          {
            type: 'choices',
            question: 'Configure Features Now?',
            options: [
              { label: 'Yes, configure now', value: 'configure' },
              { label: 'No, I\'ll do it later', value: 'later' }
            ],
            selectionType: 'radio',
            submitButton: {
              text: 'Proceed',
              onSubmit: 'configureFeatures'
            }
          }
        ];
        break;
        
      // Additional submission handlers for other actions...
      
      default:
        responseContent = [
          {
            type: 'text',
            text: `Action '${action}' performed successfully.`
          },
          {
            type: 'text',
            text: 'What would you like to do next?'
          }
        ];
    }
    
    return {
      completion: JSON.stringify(responseContent),
      sessionId: 'session-' + uuidv4(),
      requestId: uuidv4(),
      promptTokens: 10,
      completionTokens: 50
    };
  }
}

// Factory function to create a new mock agent API service
export const createMockAgentApi = (config: AgentConfig): MockAgentApiService => {
  return new MockAgentApiService(config);
};