// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { User } from '../services/authService';

// Auth context type
interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email?: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: string) => boolean; // Added hasRole method
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoginStatus = () => {
      if (authService.isAuthenticated()) {
        setCurrentUser(authService.getCurrentUser());
      }
      setIsLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  // Regular login method
  const login = async (email?: string, password?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.login(email, password);
      setCurrentUser(user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Google login method
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.loginWithGoogle();
      setCurrentUser(user);
    } catch (err) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Facebook login method
  const loginWithFacebook = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.loginWithFacebook();
      setCurrentUser(user);
    } catch (err) {
      console.error('Facebook login error:', err);
      setError(err instanceof Error ? err.message : 'Facebook login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Twitter login method
  const loginWithTwitter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await authService.loginWithTwitter();
      setCurrentUser(user);
    } catch (err) {
      console.error('Twitter login error:', err);
      setError(err instanceof Error ? err.message : 'Twitter login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear the user even if the API call fails
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    // Use the authService to check roles
    return currentUser?.roles?.includes(role) || false;
  };

  // Context value
  const value = {
    currentUser,
    isLoading,
    error,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithTwitter,
    logout,
    clearError,
    hasRole
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

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};