
import React from 'react';
import { ChatSession } from '../../api/types';
import { formatTimestamp } from '../../utils/agentUtils';

interface SessionListProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession
}) => {
  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <div className="w-64 border-r border-secondary-200 h-full bg-secondary-50 overflow-y-auto">
      <div className="p-4 border-b border-secondary-200">
        <button
          onClick={onCreateSession}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center"
          data-testid="new-chat-button"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="p-2">
        <h2 className="text-xs uppercase font-bold text-secondary-500 px-2 mb-2">Recent Conversations</h2>
        <ul className="space-y-1">
          {sortedSessions.map(session => (
            <li key={session.id}>
              <button
                onClick={() => onSelectSession(session.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  session.id === currentSessionId
                    ? 'bg-primary-100 text-primary-900'
                    : 'hover:bg-secondary-200 text-secondary-800'
                }`}
                data-testid={`session-item-${session.id}`}
              >
                <div className="font-medium truncate">{session.title || 'New Conversation'}</div>
                <div className="text-xs text-secondary-500 truncate">
                  {session.messages.length === 0 
                    ? 'No messages' 
                    : `${formatTimestamp(session.updatedAt)} · ${session.messages.length} messages`}
                </div>
              </button>
            </li>
          ))}
          
          {sessions.length === 0 && (
            <li className="px-3 py-2 text-secondary-500 text-sm">
              No conversations yet
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};