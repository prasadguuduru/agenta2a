// src/services/notificationService.ts
import { NotificationType } from '../components/Notification/Notification';

export interface NotificationOptions {
  type?: NotificationType;
  message: string;
  duration?: number;
}

export type NotificationCallback = (options: NotificationOptions) => void;

/**
 * Service for managing security notifications
 */
class NotificationService {
  private subscribers: NotificationCallback[] = [];
  
  /**
   * Subscribe to notifications
   */
  subscribe(callback: NotificationCallback): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Show a notification
   */
  notify(options: NotificationOptions): void {
    // Notify all subscribers
    this.subscribers.forEach(callback => callback(options));
  }
  
  /**
   * Show a success notification
   */
  success(message: string, duration?: number): void {
    this.notify({
      type: 'success',
      message,
      duration
    });
  }
  
  /**
   * Show an error notification
   */
  error(message: string, duration?: number): void {
    this.notify({
      type: 'error',
      message,
      duration
    });
  }
  
  /**
   * Show a warning notification
   */
  warning(message: string, duration?: number): void {
    this.notify({
      type: 'warning',
      message,
      duration
    });
  }
  
  /**
   * Show an info notification
   */
  info(message: string, duration?: number): void {
    this.notify({
      type: 'info',
      message,
      duration
    });
  }
  
  /**
   * Show a security alert notification
   */
  securityAlert(message: string): void {
    this.notify({
      type: 'error',
      message: `⚠️ Security Alert: ${message}`,
      duration: 10000 // 10 seconds for security alerts
    });
  }
  
  /**
   * Show a rate limit warning notification
   */
  rateLimitWarning(remaining: number, resetInSeconds: number): void {
    this.notify({
      type: 'warning',
      message: `Rate limit warning: ${remaining} requests remaining. Limit resets in ${Math.ceil(resetInSeconds / 60)} minutes.`,
      duration: 5000
    });
  }
  
  /**
   * Show a rate limit exceeded notification
   */
  rateLimitExceeded(resetInSeconds: number): void {
    this.notify({
      type: 'error',
      message: `Rate limit exceeded. Please try again in ${Math.ceil(resetInSeconds / 60)} minutes.`,
      duration: 10000
    });
  }
  
  /**
   * Show a session timeout warning notification
   */
  sessionTimeoutWarning(remainingMinutes: number): void {
    this.notify({
      type: 'warning',
      message: `Your session will expire in ${remainingMinutes} minutes due to inactivity. Please continue working to keep your session active.`,
      duration: 10000
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;