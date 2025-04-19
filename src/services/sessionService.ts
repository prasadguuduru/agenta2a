// src/services/sessionService.ts
import authService from '../services/authService';

/**
 * Session management service for handling security settings and session timeouts
 */
export class SessionManagementService {
  private inactivityTimeout: NodeJS.Timeout | null = null;
  private activityListenerAdded: boolean = false;
  private lastActivityTime: number = Date.now();
  
  constructor() {
    // Load security settings
    this.loadSecuritySettings();
    
    // Initialize session tracking
    this.initSessionTracking();
  }
  
  /**
   * Initialize session tracking based on security settings
   */
  private initSessionTracking(): void {
    // Load security settings
    const securitySettings = this.getSecuritySettings();
    
    // Set up activity tracking if timeout is enabled
    if (securitySettings.enableSessionTimeout) {
      this.setupActivityTracking();
      this.setupInactivityTimeout(securitySettings.sessionTimeoutMinutes);
    }
  }
  
  /**
   * Set up tracking for user activity
   */
  private setupActivityTracking(): void {
    if (this.activityListenerAdded) return;
    
    // Track user activity
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      this.recordUserActivity();
    };
    
    activityEvents.forEach(eventType => {
      window.addEventListener(eventType, activityHandler, { passive: true });
    });
    
    this.activityListenerAdded = true;
    
    // Record initial activity
    this.recordUserActivity();
  }
  
  /**
   * Record user activity and reset the inactivity timeout
   */
  private recordUserActivity(): void {
    this.lastActivityTime = Date.now();
    localStorage.setItem('last_activity', this.lastActivityTime.toString());
    
    // Reset the inactivity timeout
    this.resetInactivityTimeout();
  }
  
  /**
   * Set up timeout for user inactivity
   */
  private setupInactivityTimeout(timeoutMinutes: number): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    this.inactivityTimeout = setTimeout(() => {
      // Check if the user has been inactive for the timeout period
      const currentTime = Date.now();
      const lastActivity = this.lastActivityTime;
      
      if (currentTime - lastActivity >= timeoutMs) {
        this.handleSessionTimeout();
      } else {
        // If not, set another timeout for the remaining time
        const remainingTime = timeoutMs - (currentTime - lastActivity);
        this.inactivityTimeout = setTimeout(() => {
          this.handleSessionTimeout();
        }, remainingTime);
      }
    }, timeoutMs);
  }
  
  /**
   * Reset the inactivity timeout based on current security settings
   */
  private resetInactivityTimeout(): void {
    const securitySettings = this.getSecuritySettings();
    
    if (securitySettings.enableSessionTimeout) {
      this.setupInactivityTimeout(securitySettings.sessionTimeoutMinutes);
    }
  }
  
  /**
   * Handle session timeout by logging the user out
   */
  private async handleSessionTimeout(): Promise<void> {
    console.log('Session timed out due to inactivity');
    
    // Show timeout notification
    this.showTimeoutNotification();
    
    // Log the user out
    await authService.logout();
    
    // Redirect to login page
    window.location.href = '/login?timeout=true';
  }
  
  /**
   * Show notification about session timeout
   */
  private showTimeoutNotification(): void {
    // This could be enhanced with a proper notification system
    alert('Your session has timed out due to inactivity. Please log in again.');
  }
  
  /**
   * Get security settings from localStorage
   */
  private getSecuritySettings(): {
    enableSessionTimeout: boolean;
    sessionTimeoutMinutes: number;
    storeSessionHistory: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
  } {
    try {
      const savedSettings = localStorage.getItem('securitySettings');
      
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
    
    // Default security settings
    return {
      enableSessionTimeout: true,
      sessionTimeoutMinutes: 30,
      storeSessionHistory: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 20
    };
  }
  
  /**
   * Load security settings and apply them
   */
  public loadSecuritySettings(): void {
    const securitySettings = this.getSecuritySettings();
    
    // Apply session timeout settings
    if (securitySettings.enableSessionTimeout) {
      this.setupActivityTracking();
      this.setupInactivityTimeout(securitySettings.sessionTimeoutMinutes);
    } else if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    
    // Apply other security settings as needed
    // ...
  }
  
  /**
   * Get the time remaining before session timeout (in seconds)
   */
  public getTimeUntilTimeout(): number {
    const securitySettings = this.getSecuritySettings();
    
    if (!securitySettings.enableSessionTimeout) {
      return -1; // No timeout
    }
    
    const timeoutMs = securitySettings.sessionTimeoutMinutes * 60 * 1000;
    const elapsedMs = Date.now() - this.lastActivityTime;
    const remainingMs = Math.max(0, timeoutMs - elapsedMs);
    
    return Math.floor(remainingMs / 1000);
  }
  
  /**
   * Clear stored session history if disabled in settings
   */
  public cleanupSessionHistory(): void {
    const securitySettings = this.getSecuritySettings();
    
    if (!securitySettings.storeSessionHistory) {
      localStorage.removeItem('agentSessions');
    }
  }
}

// Create singleton instance
const sessionManagementService = new SessionManagementService();

export default sessionManagementService;