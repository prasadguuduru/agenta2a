// src/components/FloatingChatAgent/FloatingChatAgent.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useAgent } from '../../hooks/useAgent';
import { Message, MessageContent, TextContent } from '../../api/types';
import { formatTimestamp } from '../../utils/agentUtils';

// Enum for chat window states
enum ChatWindowState {
  MINIMIZED = 'minimized',   // Just the chat icon
  DEFAULT = 'default',       // Minimized with text box
  MAXIMIZED = 'maximized'    // Full chat window
}

const FloatingChatAgent: React.FC = () => {
  // Use the agent hook to access messages and send messages
  const { currentSession, sendMessage, isLoading } = useAgent();
  
  // State for the chat window
  const [windowState, setWindowState] = useState<ChatWindowState>(ChatWindowState.DEFAULT);
  const [inputMessage, setInputMessage] = useState<string>('');
  
  // Reference to the message container for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (windowState === ChatWindowState.MAXIMIZED && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, windowState]);
  
  // Handle minimizing the chat window
  const handleMinimize = () => {
    if (windowState === ChatWindowState.MAXIMIZED) {
      setWindowState(ChatWindowState.DEFAULT);
    } else if (windowState === ChatWindowState.DEFAULT) {
      setWindowState(ChatWindowState.MINIMIZED);
    }
  };
  
  // Handle maximizing the chat window
  const handleMaximize = () => {
    setWindowState(ChatWindowState.MAXIMIZED);
  };
  
  // Handle opening the chat window from minimized state
  const handleOpenChat = () => {
    setWindowState(ChatWindowState.DEFAULT);
  };
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    sendMessage(inputMessage);
    setInputMessage('');
    
    // Switch to maximized view when sending a message
    if (windowState === ChatWindowState.DEFAULT) {
      setWindowState(ChatWindowState.MAXIMIZED);
    }
  };
  
  // Get the latest message for preview
  const getLatestMessage = (): Message | undefined => {
    if (!currentSession || !currentSession.messages || currentSession.messages.length === 0) {
      return undefined;
    }
    
    return currentSession.messages[currentSession.messages.length - 1];
  };
  
  // Helper function to extract text from message content
  const getMessageText = (content: MessageContent | MessageContent[] | any): string => {
    if (Array.isArray(content)) {
      // If it's an array, find the first text content
      const textContent = content.find(c => c.type === 'text') as TextContent | undefined;
      return textContent?.text || 'View message...';
    } else if (content && typeof content === 'object' && 'type' in content && content.type === 'text') {
      // If it's a text content object
      return (content as TextContent).text;
    } else if (content && typeof content === 'object' && 'text' in content) {
      // If it has a text property directly
      return content.text as string;
    }
    
    // Default fallback
    return 'View message...';
  };
  
  // Render based on window state
  if (windowState === ChatWindowState.MINIMIZED) {
    return (
      <div className="chat-agent-minimized">
        <button 
          onClick={handleOpenChat}
          className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }
  
  // Default state (minimized with text box)
  if (windowState === ChatWindowState.DEFAULT) {
    const latestMessage = getLatestMessage();
    
    return (
      <div className="chat-agent-default">
        {/* Header */}
        <div className="chat-agent-header">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
              <span className="text-primary-600 text-sm font-bold">AI</span>
            </div>
            <h3 className="font-medium">Need help, adf?</h3>
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={handleMaximize} 
              className="p-1 hover:bg-primary-500 rounded transition-colors"
              aria-label="Maximize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
            <button 
              onClick={handleMinimize} 
              className="p-1 hover:bg-primary-500 rounded transition-colors"
              aria-label="Minimize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Message preview - Show initial prompt if no messages yet */}
        <div className="p-3 bg-secondary-50 border-b border-secondary-200">
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="flex-grow">
              <p className="text-sm text-secondary-700 line-clamp-2">
                {latestMessage 
                  ? getMessageText(latestMessage.content)
                  : "Hi adf, ask me about products, features, and pricing, or connect to a sales rep."
                }
              </p>
              {latestMessage && (
                <p className="text-xs text-secondary-500 mt-1">
                  {formatTimestamp(latestMessage.timestamp)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Input box */}
        <form onSubmit={handleSendMessage} className="chat-agent-input">
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow border border-secondary-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 rounded-r-lg ${
                isLoading || !inputMessage.trim()
                  ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } transition-colors`}
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // Maximized chat window - Full screen overlay with centered chat window
  return (
    <div className="chat-agent-maximized">
      <div className="chat-agent-maximized-inner">
        {/* Header */}
        <div className="chat-agent-header">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
              <span className="text-primary-600 text-sm font-bold">AI</span>
            </div>
            <h3 className="font-medium">Agentforce</h3>
          </div>
          <div className="flex space-x-1">
            <button 
              onClick={handleMinimize} 
              className="p-1 hover:bg-primary-500 rounded transition-colors"
              aria-label="Minimize"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages with scroll */}
        <div className="chat-agent-messages">
          {currentSession && currentSession.messages && currentSession.messages.length > 0 ? (
            <div className="space-y-4">
              {currentSession.messages.map((message, index) => {
                const isUser = message.role === 'user';
                const isConsecutive = index > 0 && currentSession.messages[index - 1].role === message.role;
                
                return (
                  <div 
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                  >
                    {!isUser && !isConsecutive && (
                      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-white text-sm font-bold">AI</span>
                      </div>
                    )}
                    
                    {!isUser && isConsecutive && <div className="w-8 mr-2" />}
                    
                    <div 
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        isUser 
                          ? 'bg-primary-600 text-white rounded-tr-none' 
                          : 'bg-secondary-100 text-secondary-800 rounded-tl-none'
                      }`}
                    >
                      {Array.isArray(message.content) 
                        ? message.content.map((content, contentIndex) => (
                            <div key={contentIndex} className={contentIndex > 0 ? 'mt-2' : ''}>
                              {content.type === 'text' && (
                                <div className="whitespace-pre-wrap">{content.text}</div>
                              )}
                              {/* Other content types would be rendered here */}
                            </div>
                          ))
                        : <div className="whitespace-pre-wrap">{getMessageText(message.content)}</div>
                      }
                      
                      {!isConsecutive && (
                        <div 
                          className={`text-xs mt-1 ${
                            isUser ? 'text-primary-100' : 'text-secondary-500'
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </div>
                      )}
                    </div>
                    
                    {isUser && !isConsecutive && (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center ml-2 flex-shrink-0">
                        <span className="text-white text-sm font-bold">You</span>
                      </div>
                    )}
                    
                    {isUser && isConsecutive && <div className="w-8 ml-2" />}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-secondary-500">
              <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-lg font-medium">How can Agentforce help?</p>
              <p className="text-sm">Ask me about Salesforce products, features, and pricing</p>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center mt-2">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mr-2">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div className="bg-secondary-100 rounded-lg px-4 py-2 text-secondary-800 inline-flex">
                <span className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Input box */}
        <form onSubmit={handleSendMessage} className="chat-agent-input">
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow border border-secondary-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Message Agentforce"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`ml-2 p-3 rounded-lg ${
                isLoading || !inputMessage.trim()
                  ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } transition-colors`}
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloatingChatAgent;