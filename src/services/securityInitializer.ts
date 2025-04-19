// src/services/securityInitializer.ts

// Import security services
import sessionManagementService from './sessionService';
import rateLimiterService from './rateLimiterService';
import authService from '../services/authService';

/**
 * Initialize all security services
 */
const initializeSecurityServices = () => {
  console.log('Initializing security services...');
  
  // Check if user is authenticated and restore session if needed
  if (authService.isAuthenticated()) {
    console.log('User authenticated, initializing session management');
    
    // Initialize session management (this happens in constructor)
    sessionManagementService.loadSecuritySettings();
    
    // Clean up history if needed
    sessionManagementService.cleanupSessionHistory();
  }
  
  // Initialize rate limiter (this happens in constructor)
  rateLimiterService.reloadSettings();
  
  console.log('Security services initialized');
};

// Initialize security services
initializeSecurityServices();

// Add listener for settings changes
window.addEventListener('storage', (event) => {
  if (event.key === 'securitySettings') {
    console.log('Security settings changed, reloading services');
    sessionManagementService.loadSecuritySettings();
    rateLimiterService.reloadSettings();
  }
});

export default { initializeSecurityServices };