
import React, { useEffect, useRef } from 'react';
import { Message } from '../../api/types';
import { ChatBubble } from '../ChatBubble/ChatBubble';
import { groupConsecutiveMessages } from '../../utils/agentUtils';

interface ChatListProps {
  messages: Message[];
  isTyping?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  messages,
  isTyping = false
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or when typing starts/stops
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);
  
  // Group consecutive messages from the same sender
  const groupedMessages = groupConsecutiveMessages(messages);
  console.log("##############HELOO");
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4" data-testid="chat-message-list">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-secondary-500">
          <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start a conversation with the agent</p>
        </div>
      ) : (
        groupedMessages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message}
            isConsecutive={
              index > 0 && 
              groupedMessages[index - 1].role === message.role
            }
          />
        ))
      )}
      
      {isTyping && (
        <div className="flex items-center mt-2">
          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center mr-2">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="bg-secondary-200 rounded-lg px-4 py-2 text-secondary-800 inline-flex">
            <span className="typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          </div>
        </div>
      )}
      
      <div ref={endOfMessagesRef} />
    </div>
  );
};
