// src/components/ChatInput/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import rateLimiterService from '../../services/rateLimiterService';
import notificationService from '../../services/notificationService';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus the input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Auto-resize the textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || isRateLimited) return;
    
    // Check rate limit before sending
    const canSend = checkRateLimit();
    if (!canSend) return;
    
    onSendMessage(message.trim());
    setMessage('');
    
    // Reset height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };
  
  const checkRateLimit = (): boolean => {
    // Get rate limit status
    const rateLimitStatus = rateLimiterService.getRateLimitStatus();
    
    // If rate limiting is disabled, always allow
    if (!rateLimitStatus.enabled) {
      return true;
    }
    
    // If we've used 80% of our limit, show a warning
    if (rateLimitStatus.requestsRemaining <= Math.ceil(rateLimitStatus.requestsLimit * 0.2)) {
      notificationService.rateLimitWarning(
        rateLimitStatus.requestsRemaining,
        rateLimitStatus.resetInSeconds
      );
    }
    
    // Check if we can proceed
    const canProceed = rateLimiterService.checkRateLimit();
    
    if (!canProceed) {
      // Show rate limit exceeded notification
      notificationService.rateLimitExceeded(rateLimitStatus.resetInSeconds);
      
      // Set rate limited state
      setIsRateLimited(true);
      
      // Schedule reset based on reset time
      setTimeout(() => {
        setIsRateLimited(false);
      }, rateLimitStatus.resetInSeconds * 1000);
      
      return false;
    }
    
    return true;
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter, but allow Shift+Enter for newlines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-end border-t border-secondary-200 bg-white p-4"
      data-testid="chat-input-form"
    >
      <div className="relative flex-grow">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRateLimited ? 'Rate limit exceeded. Please wait...' : placeholder}
          disabled={isLoading || isRateLimited}
          rows={1}
          className="w-full border border-secondary-300 rounded-lg py-3 px-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          data-testid="chat-input-textarea"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading || isRateLimited}
          className={`absolute right-2 bottom-2 rounded-full p-2 ${
            !message.trim() || isLoading || isRateLimited
              ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700 transition'
          }`}
          data-testid="chat-submit-button"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isRateLimited ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};