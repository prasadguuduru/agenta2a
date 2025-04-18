
import React, { useState } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { ChatInput } from '../ChatInput/ChatInput';
import { ChatList } from '../ChatList/ChatList';
import { SessionList } from '../SessionList/SessionList';
import { Header } from '../Header/Header';

export const AgentChat: React.FC = () => {
  const { 
    sessions,
    currentSession,
    isLoading,
    sendMessage,
    createNewSession,
    switchSession
  } = useAgent();
  
  const [showSidebar, setShowSidebar] = useState(true);
  
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header title="Agent Chat" />
      
      <div className="flex flex-grow overflow-hidden">
        {showSidebar && (
          <SessionList
            sessions={sessions}
            currentSessionId={currentSession?.id || null}
            onSelectSession={switchSession}
            onCreateSession={createNewSession}
          />
        )}
        
        <div className="flex-grow flex flex-col h-full relative">
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-10 p-2 rounded-md bg-secondary-200 hover:bg-secondary-300 transition"
            aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
            data-testid="toggle-sidebar-button"
          >
            <svg className="w-4 h-4 text-secondary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {showSidebar ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
          
          <ChatList 
            messages={currentSession?.messages || []}
            isTyping={isLoading}
          />
          
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything..."
          />
        </div>
      </div>
    </div>
  );
};