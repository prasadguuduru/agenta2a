import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title?: string;
  showSettings?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Agent Chat',
  showSettings = true
}) => {
  const { currentUser, logout } = useAuth();
  
  return (
    <header className="bg-primary-700 text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.159m-9.15.634c.86.755 1.886 1.252 3 1.5v-8.5a2.25 2.25 0 011.5-2.25h4.5a2.25 2.25 0 012.25 2.25v8.5M4.5 14.5h14.25" />
        </svg>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {currentUser && (
          <div className="flex items-center">
            <span className="mr-2 text-sm hidden md:inline">
              {currentUser.name}
            </span>
            <button 
              onClick={() => logout()}
              className="text-white hover:text-primary-200 transition"
              aria-label="Log out"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
        
        {showSettings && (
          <Link 
            to="/settings" 
            className="text-white hover:text-primary-200 transition"
            aria-label="Settings"
            data-testid="settings-link"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
};