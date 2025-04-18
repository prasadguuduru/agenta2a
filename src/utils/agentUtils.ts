
import { Message } from '../api/types';

/**
 * Groups consecutive messages from the same role
 */
export const groupConsecutiveMessages = (messages: Message[]): Message[] => {
  if (messages.length <= 1) return messages;
  
  return messages.reduce<Message[]>((acc, current, index) => {
    // First message or different role from previous message
    if (index === 0 || current.role !== messages[index - 1].role) {
      return [...acc, current];
    }
    
    // Same role as previous message, combine content
    const previous = acc[acc.length - 1];
    const combinedContent = [
      ...previous.content,
      ...current.content
    ];
    
    return [
      ...acc.slice(0, -1),
      {
        ...previous,
        content: combinedContent
      }
    ];
  }, []);
};
/**
 * Formats a timestamp into a readable format
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

/**
 * Extracts a session title from the first message
 */
export const extractSessionTitle = (content: string): string => {
  // Take the first line or first 30 characters
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length <= 30) return firstLine;
  return firstLine.substring(0, 27) + '...';
};