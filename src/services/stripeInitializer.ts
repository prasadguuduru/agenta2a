// src/services/stripeInitializer.ts

import stripeService from './stripeService';
import notificationService from './notificationService';

/**
 * Initialize Stripe with API key from environment variables
 */
export const initializeStripe = async (): Promise<boolean> => {
  try {
    // In a real app, this would typically come from environment variables
    // const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    
    // Mock initialization for development
    const stripePublicKey = 'pk_test_mockStripeApiKey';
    
    if (!stripePublicKey) {
      console.error('Stripe public key not found');
      return false;
    }
    
    // Initialize Stripe service
    stripeService.initialize(stripePublicKey);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    notificationService.error('Payment system initialization failed');
    return false;
  }
}