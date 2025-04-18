// Hook for using A2A protocol to communicate with agents

import { useState, useCallback } from 'react';
import axios from 'axios';

// Import shared A2A types
interface AgentCard {
  name: string;
  description: string;
  version: string;
  endpoint: string;
  skills?: string[];
}

/*
interface Message {
  role: 'user' | 'agent';
  parts: {
    type: 'text';
    text: string;
  }[];
}*/

/*interface Task {
  id: string;
  state: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed' | 'canceled';
  messages: Message[];
}*/

interface UseA2AClientOptions {
  agentEndpoint: string;
  onError?: (error: Error) => void;
}

export function useA2AClient({ agentEndpoint, onError }: UseA2AClientOptions) {
  const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Discover agent capabilities
  const discoverAgent = useCallback(async () => {
    try {
      setIsLoading(true);
      // In A2A protocol, the agent card is typically at this well-known URL
      const response = await axios.get(`${agentEndpoint}/.well-known/agent.json`);
      
      setAgentCard(response.data);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      const err = error instanceof Error 
        ? error 
        : new Error('Failed to discover agent');
      
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [agentEndpoint, onError]);
  
  // Send a message to the agent
  const sendMessage = useCallback(async (message: string) => {
    if (!agentCard && !agentEndpoint) {
      throw new Error('Agent not discovered. Call discoverAgent() first or provide agentEndpoint.');
    }
    
    const endpoint = agentCard?.endpoint || agentEndpoint;
    
    try {
      setIsLoading(true);
      
      // Generate a unique task ID
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Using the A2A protocol's tasks/send method
      const response = await axios.post(
        `${endpoint}/v1/tasks/send`,
        {
          task: {
            id: taskId,
            messages: [
              {
                role: 'user',
                parts: [{ type: 'text', text: message }]
              }
            ]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setIsLoading(false);
      return response.data.task;
    } catch (error) {
      setIsLoading(false);
      const err = error instanceof Error 
        ? error 
        : new Error('Failed to send message');
      
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [agentCard, agentEndpoint, onError]);
  
  // Continue an existing task with a follow-up message
  const continueTask = useCallback(async (taskId: string, message: string) => {
    if (!agentCard && !agentEndpoint) {
      throw new Error('Agent not discovered. Call discoverAgent() first or provide agentEndpoint.');
    }
    
    const endpoint = agentCard?.endpoint || agentEndpoint;
    
    try {
      setIsLoading(true);
      
      const response = await axios.post(
        `${endpoint}/v1/tasks/send`,
        {
          task: {
            id: taskId,
            messages: [
              {
                role: 'user',
                parts: [{ type: 'text', text: message }]
              }
            ]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setIsLoading(false);
      return response.data.task;
    } catch (error) {
      setIsLoading(false);
      const err = error instanceof Error 
        ? error 
        : new Error('Failed to continue task');
      
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [agentCard, agentEndpoint, onError]);
  
  return {
    agentCard,
    isLoading,
    discoverAgent,
    sendMessage,
    continueTask
  };
}