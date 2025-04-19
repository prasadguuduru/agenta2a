
/**
 * Rate limiter service to prevent API abuse
 */
export class RateLimiterService {
    
    private requestTimestamps: number[] = [];
    private maxRequestsPerMinute: number = 20;
    private enabled: boolean = true;
    
    constructor() {
      // Load settings
      this.loadSettings();
      
      // Load previous requests from storage
      const savedRequests = localStorage.getItem('rate_limit_requests');
      if (savedRequests) {
        try {
          this.requestTimestamps = JSON.parse(savedRequests);
          // Filter out old requests
          this.cleanupOldRequests();
        } catch (e) {
          this.requestTimestamps = [];
        }
      }
    }
    
    /**
     * Load rate limiter settings from localStorage
     */
    private loadSettings(): void {
      try {
        const securitySettings = localStorage.getItem('securitySettings');
        
        if (securitySettings) {
          const settings = JSON.parse(securitySettings);
          this.enabled = settings.enableRateLimiting ?? true;
          this.maxRequestsPerMinute = settings.maxRequestsPerMinute ?? 20;
        }
      } catch (error) {
        console.error('Failed to load rate limiter settings:', error);
      }
    }
    
    /**
     * Check if the request should be allowed based on rate limiting rules
     */
    public checkRateLimit(): boolean {
      // If rate limiting is disabled, always allow
      if (!this.enabled) {
        return true;
      }
      
      // Clean up old requests
      this.cleanupOldRequests();
      
      // Check if we've exceeded the rate limit
      if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
        return false;
      }
      
      // Add current request
      const now = Date.now();
      this.requestTimestamps.push(now);
      
      // Save to storage
      localStorage.setItem('rate_limit_requests', JSON.stringify(this.requestTimestamps));
      
      return true;
    }
    
    /**
     * Remove requests older than 1 minute
     */
    private cleanupOldRequests(): void {
      const now = Date.now();
      const oneMinuteAgo = now - 60000; // 1 minute in milliseconds
      
      this.requestTimestamps = this.requestTimestamps.filter(
        timestamp => timestamp > oneMinuteAgo
      );
    }
    
    /**
     * Get time until rate limit reset in seconds
     */
    public getTimeUntilReset(): number {
      if (this.requestTimestamps.length === 0) {
        return 0;
      }
      
      const oldestRequest = Math.min(...this.requestTimestamps);
      const resetTime = oldestRequest + 60000; // 1 minute after oldest request
      const timeUntilReset = Math.max(0, resetTime - Date.now());
      
      return Math.ceil(timeUntilReset / 1000);
    }
    
    /**
     * Get current rate limit status
     */
    public getRateLimitStatus(): {
      enabled: boolean;
      requestsRemaining: number;
      requestsLimit: number;
      resetInSeconds: number;
    } {
      this.cleanupOldRequests();
      
      return {
        enabled: this.enabled,
        requestsRemaining: Math.max(0, this.maxRequestsPerMinute - this.requestTimestamps.length),
        requestsLimit: this.maxRequestsPerMinute,
        resetInSeconds: this.getTimeUntilReset()
      };
    }
    
    /**
     * Reload settings from localStorage (call when settings change)
     */
    public reloadSettings(): void {
      this.loadSettings();
    }
  }

const rateLimiterService = new RateLimiterService();

export default rateLimiterService;