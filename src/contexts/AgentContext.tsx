
import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AgentApiService, MockAgentApiService, createAgentApi, createMockAgentApi } from '../api';
import { AgentConfig, ChatSession, Message } from '../api/types';

interface AgentContextProps {
  api: AgentApiService | MockAgentApiService;
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  error: string | null;
  createNewSession: () => ChatSession;
  switchSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

const AgentContext = createContext<AgentContextProps | undefined>(undefined);

interface AgentProviderProps {
  children: React.ReactNode;
  config: AgentConfig;
  useMockApi?: boolean;
}

export const AgentProvider = ({ children, config, useMockApi = false }: AgentProviderProps) => {
  const [api] = useState(() => useMockApi ? createMockAgentApi(config) : createAgentApi(config));
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with a default session
  useEffect(() => {
    if (sessions.length === 0) {
      const newSession = createDefaultSession();
      setSessions([newSession]);
      setCurrentSession(newSession);
    }
  }, []);

  // Load sessions from localStorage (in a real app, this might come from a database)
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('agentSessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
        setSessions(parsedSessions);
        
        // Set current session to the most recent one
        if (parsedSessions.length > 0) {
          const mostRecent = parsedSessions.reduce((latest, session) => 
            session.updatedAt > latest.updatedAt ? session : latest
          );
          setCurrentSession(mostRecent);
        }
      }
    } catch (err) {
      console.error('Failed to load sessions from localStorage:', err);
    }
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('agentSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createDefaultSession = (): ChatSession => {
    return {
      id: uuidv4(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      title: 'New Conversation'
    };
  };

  const createNewSession = (): ChatSession => {
    const newSession = createDefaultSession();
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    return newSession;
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
  };

  const updateSession = (updatedSession: ChatSession) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    );
    if (currentSession?.id === updatedSession.id) {
      setCurrentSession(updatedSession);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSession) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add user message to the current session
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: [{ type: 'text', text: content }],
        timestamp: Date.now()
      };
      
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage],
        updatedAt: Date.now()
      };
      
      // Update session with user message
      updateSession(updatedSession);
      
      // Send to the agent API
      const response = await api.sendMessage({
        inputText: content,
        sessionId: currentSession.id
      });
      
      // Create agent message from response
      const agentMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: response.completion,
        timestamp: Date.now()
      };
      
      // Update session with agent response
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, agentMessage],
        updatedAt: Date.now(),
        // If this is the first message, use it to generate a title
        title: updatedSession.messages.length === 1 
          ? content.substring(0, 30) + (content.length > 30 ? '...' : '') 
          : updatedSession.title
      };
      
      updateSession(finalSession);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    api,
    sessions,
    currentSession,
    isLoading,
    error,
    createNewSession,
    switchSession,
    sendMessage,
    clearError
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};