//import { initializeApp } from 'firebase/app';
/*import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';*/
/*
// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Sign in methods
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithTwitter = () => signInWithPopup(auth, twitterProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);

// Sign out
export const logOut = () => signOut(auth);

// Auth state observer
export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

*/

const signInWithGoogle = async () => {
    console.log('Sign in with Google');
    return Promise.resolve({ user: { uid: '1', email: 'user@example.com', displayName: 'Test User' } });
  };
  
  const signInWithTwitter = async () => {
    console.log('Sign in with Twitter');
    return Promise.resolve({ user: { uid: '1', email: 'user@example.com', displayName: 'Test User' } });
  };
  
  const signInWithFacebook = async () => {
    console.log('Sign in with Facebook');
    return Promise.resolve({ user: { uid: '1', email: 'user@example.com', displayName: 'Test User' } });
  };
  
  const logOut = async () => {
    console.log('Log out');
    return Promise.resolve();
  };
  
  const observeAuthState = (callback: (user: any | null) => void) => {
    // Simulate a logged-out state
    callback(null);
    
    // Return a function to unsubscribe
    return () => {};
  };
  
  export { 
    signInWithGoogle, 
    signInWithTwitter, 
    signInWithFacebook, 
    logOut, 
    observeAuthState 
  };

  export interface User {
    id: string;
    name: string;
    email: string;
    roles?: string[];
  }
  
  // Auth token interface
  interface AuthToken {
    token: string;
    expiresAt: number;
  }
  
  // Auth service class for handling authentication
  class AuthService {
    private user: User | null = null;
    private token: AuthToken | null = null;
    private refreshTimeout: NodeJS.Timeout | null = null;
    private authEndpoint: string = '/api/auth'; // This would point to your actual backend
    
    constructor() {
      // Try to restore session from localStorage
      this.restoreSession();
      
      // Set up token refresh if we have a valid token
      if (this.token && !this.isTokenExpired()) {
        this.scheduleTokenRefresh();
      }
    }
    
    // Get current user
    getCurrentUser(): User | null {
      return this.user;
    }
    
    // Check if user is authenticated
    isAuthenticated(): boolean {
      return !!this.user && !!this.token && !this.isTokenExpired();
    }
    
    // Check if token is expired
    isTokenExpired(): boolean {
      if (!this.token) return true;
      
      // Add a 10-second buffer to account for network delays
      return Date.now() >= (this.token.expiresAt - 10000);
    }
    
    // Get auth token
    async getToken(): Promise<string> {
      if (!this.token || this.isTokenExpired()) {
        await this.refreshToken();
      }
      
      return this.token?.token || '';
    }
    
    // Mock login function for development
    async login(email: string = '', password: string = ''): Promise<User> {
      try {
        // For development, create a mock user and token
        if (process.env.NODE_ENV === 'development' || !this.authEndpoint) {
          return this.mockLogin();
        }
        
        // In production, call your authentication backend
        const response = await fetch(`${this.authEndpoint}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        const { user, token, expiresIn } = data;
        
        // Calculate token expiration time
        const expiresAt = Date.now() + (expiresIn * 1000);
        
        // Store user and token
        this.user = user;
        this.token = {
          token,
          expiresAt
        };
        
        // Save to localStorage
        this.saveSession();
        
        // Schedule token refresh
        this.scheduleTokenRefresh();
        
        return user;
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Authentication failed. Please check your credentials and try again.');
      }
    }
    
    // Mock login implementation for development
    private async mockLogin(): Promise<User> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substring(2, 11)}`,
        name: 'Demo User',
        email: 'demo@example.com',
        roles: ['user']
      };
      
      // Create mock token valid for 1 hour
      const expiresAt = Date.now() + (60 * 60 * 1000);
      const mockToken: AuthToken = {
        token: `mock_token_${Math.random().toString(36).substring(2, 11)}`,
        expiresAt
      };
      
      this.user = mockUser;
      this.token = mockToken;
      
      // Save to localStorage
      this.saveSession();
      
      // Schedule token refresh
      this.scheduleTokenRefresh();
      
      return mockUser;
    }
    
    // Refresh auth token
    async refreshToken(): Promise<string> {
      try {
        // For development, create a new mock token
        if (process.env.NODE_ENV === 'development' || !this.authEndpoint) {
          return this.mockRefreshToken();
        }
        
        // In production, call your authentication backend
        const response = await fetch(
          `${this.authEndpoint}/refresh-token`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token?.token || ''}`
            }
          }
        );
        
        const data = await response.json();
        const { token, expiresIn } = data;
        
        // Calculate token expiration time
        const expiresAt = Date.now() + (expiresIn * 1000);
        
        // Update token
        this.token = {
          token,
          expiresAt
        };
        
        // Save to localStorage
        this.saveSession();
        
        // Schedule token refresh
        this.scheduleTokenRefresh();
        
        return token;
      } catch (error) {
        console.error('Token refresh failed:', error);
        
        // If refresh fails, log out the user
        this.logout();
        
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    // Mock refresh token implementation for development
    private async mockRefreshToken(): Promise<string> {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new mock token valid for 1 hour
      const expiresAt = Date.now() + (60 * 60 * 1000);
      const newToken = `mock_token_${Math.random().toString(36).substring(2, 11)}`;
      
      this.token = {
        token: newToken,
        expiresAt
      };
      
      // Save to localStorage
      this.saveSession();
      
      // Schedule token refresh
      this.scheduleTokenRefresh();
      
      return newToken;
    }
    
    // Schedule token refresh
    private scheduleTokenRefresh(): void {
      // Clear any existing refresh timeout
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }
      
      if (!this.token) return;
      
      // Calculate time until token needs refresh (refresh when 90% of the time has elapsed)
      const currentTime = Date.now();
      const tokenLifetime = this.token.expiresAt - currentTime;
      const refreshTime = tokenLifetime * 0.9;
      
      // Schedule refresh
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken().catch(error => {
          console.error('Scheduled token refresh failed:', error);
        });
      }, refreshTime);
    }
    
    // Logout
    async logout(): Promise<void> {
      try {
        // For development, skip API call
        if (process.env.NODE_ENV !== 'development' && this.authEndpoint) {
          // In production, call your authentication backend
          await fetch(
            `${this.authEndpoint}/logout`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.token?.token || ''}`
              }
            }
          );
        }
      } catch (error) {
        console.error('Logout API call failed:', error);
      } finally {
        // Clear user and token regardless of API success
        this.user = null;
        this.token = null;
        
        // Clear any scheduled refresh
        if (this.refreshTimeout) {
          clearTimeout(this.refreshTimeout);
          this.refreshTimeout = null;
        }
        
        // Remove from localStorage
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }
    
    // Save session to localStorage
    private saveSession(): void {
      if (this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      if (this.token) {
        localStorage.setItem('auth_token', JSON.stringify(this.token));
      }
    }
    
    // Restore session from localStorage
    private restoreSession(): void {
      try {
        const savedUser = localStorage.getItem('auth_user');
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedUser) {
          this.user = JSON.parse(savedUser);
        }
        
        if (savedToken) {
          this.token = JSON.parse(savedToken);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        
        // Clear corrupted data
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        
        this.user = null;
        this.token = null;
      }
    }
    
    // Get user roles
    getUserRoles(): string[] {
      return this.user?.roles || [];
    }
    
    // Check if user has a specific role
    hasRole(role: string): boolean {
      return this.getUserRoles().includes(role);
    }
    
    // Social login methods
    async loginWithGoogle(): Promise<User> {
      // In a real implementation, this would open a popup for Google OAuth
      // For now, we'll use the mock login
      return this.mockLogin();
    }
    
    async loginWithFacebook(): Promise<User> {
      // In a real implementation, this would open a popup for Facebook OAuth
      // For now, we'll use the mock login
      return this.mockLogin();
    }
    
    async loginWithTwitter(): Promise<User> {
      // In a real implementation, this would open a popup for Twitter OAuth
      // For now, we'll use the mock login
      return this.mockLogin();
    }
  }
  
  // Create singleton instance
  const authServiceInstance = new AuthService();
  
  // Export both the instance and the class
  export { AuthService };
  export default authServiceInstance;