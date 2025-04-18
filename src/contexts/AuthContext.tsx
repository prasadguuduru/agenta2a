import React, { createContext, useContext, useState, useEffect } from 'react';

// Simple user interface
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            setCurrentUser(JSON.parse(userData));
          } catch (e) {
            // Handle parse error
            setCurrentUser(null);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  // Login method
  const login = async () => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dummyUser = {
      id: 'dummy-user-id',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    
    setCurrentUser(dummyUser);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(dummyUser));
    
    setIsLoading(false);
  };

  // Logout method
  const logout = async () => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    setIsLoading(false);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};