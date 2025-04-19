import React from 'react';
import { Message, MessageContent } from '../../api/types';
import { formatTimestamp } from '../../utils/agentUtils';

export interface ChatBubbleProps {
  message: Message;
  isConsecutive?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message,
  isConsecutive = false
}) => {
  const isUser = message.role === 'user';
  
  // Function to render different content types
  const renderContent = (content: MessageContent) => {
    console.log("##############HELOO"+JSON.stringify(content));
    switch (content.type) {
      case 'text':
        return <div className="whitespace-pre-wrap">{content.text}</div>;
        
      case 'choices':
        return (
          <div className="mt-2">
            <div className="font-medium mb-2">{content.question}</div>
            <div className="space-y-2">
              {content.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center">
                  {content.selectionType === 'radio' ? (
                    <input 
                      type="radio" 
                      id={`option-${message.id}-${index}`}
                      name={`options-${message.id}`}
                      className="mr-2"
                      onChange={() => content.onSelect?.([option])}
                    />
                  ) : (
                    <input 
                      type="checkbox" 
                      id={`option-${message.id}-${index}`}
                      className="mr-2"
                      onChange={() => {
                        // Handle checkbox selection
                        // Implementation needed
                      }}
                    />
                  )}
                  <label htmlFor={`option-${message.id}-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'video':
        return (
          <div className="mt-2">
            {content.title && <div className="font-medium mb-2">{content.title}</div>}
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${content.videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
      data-testid={`chat-bubble-${message.id}`}
    >
      {!isUser && !isConsecutive && (
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
      )}
      
      {!isUser && isConsecutive && <div className="w-8 mr-2" />}
      
      <div 
        className={`max-w-3xl rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-secondary-200 text-secondary-800 rounded-tl-none'
        }`}
      >
        {Array.isArray(message.content) 
          ? message.content.map((content: MessageContent, index: number) => (
              <div key={index}>{renderContent(content)}</div>
            ))
          : renderContent(message.content as MessageContent)}
        
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
};