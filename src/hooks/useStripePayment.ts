// src/hooks/useStripePayment.ts

import { useState } from 'react';
import stripeService, { CreatePaymentIntentParams, PaymentResult } from '../services/stripeService';
import notificationService from '../services/notificationService';

interface UseStripePaymentResult {
  isProcessing: boolean;
  paymentError: string | null;
  paymentSuccess: boolean;
  transactionId: string | null;
  createPaymentIntent: (params: CreatePaymentIntentParams) => Promise<string | null>;
  processCardPayment: (clientSecret: string, cardDetails: any) => Promise<PaymentResult>;
  processBankPayment: (clientSecret: string, bankDetails: any) => Promise<PaymentResult>;
  processWalletPayment: (clientSecret: string, walletType: 'apple_pay' | 'google_pay' | 'paypal') => Promise<PaymentResult>;
  resetPaymentState: () => void;
}

/**
 * Custom hook for Stripe payment processing
 */
export const useStripePayment = (): UseStripePaymentResult => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  /**
   * Create a Stripe payment intent
   */
  const createPaymentIntent = async (params: CreatePaymentIntentParams): Promise<string | null> => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Check if Stripe is initialized
      if (!stripeService.isInitialized()) {
        throw new Error('Stripe has not been initialized');
      }
      
      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent(params);
      
      return paymentIntent.client_secret;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
      setPaymentError(errorMessage);
      notificationService.error(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Process a credit card payment
   */
  const processCardPayment = async (clientSecret: string, cardDetails: any): Promise<PaymentResult> => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Process card payment
      const result = await stripeService.confirmCardPayment(clientSecret, {
        card: cardDetails
      });
      
      if (result.success) {
        setPaymentSuccess(true);
        setTransactionId(result.transactionId || null);
        notificationService.success('Payment successful!');
      } else {
        setPaymentError(result.error || 'Payment failed');
        notificationService.error(result.error || 'Payment failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setPaymentError(errorMessage);
      notificationService.error(errorMessage);
      
      return {
        success: false,
        status: 'error',
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Process a bank account payment
   */
  const processBankPayment = async (clientSecret: string, bankDetails: any): Promise<PaymentResult> => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Process bank payment
      const result = await stripeService.confirmBankPayment(clientSecret, bankDetails);
      
      if (result.success) {
        setPaymentSuccess(true);
        setTransactionId(result.transactionId || null);
        notificationService.success('Payment successful!');
      } else {
        setPaymentError(result.error || 'Payment failed');
        notificationService.error(result.error || 'Payment failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setPaymentError(errorMessage);
      notificationService.error(errorMessage);
      
      return {
        success: false,
        status: 'error',
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Process a digital wallet payment
   */
  const processWalletPayment = async (clientSecret: string, walletType: 'apple_pay' | 'google_pay' | 'paypal'): Promise<PaymentResult> => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Process wallet payment
      const result = await stripeService.processWalletPayment(clientSecret, walletType);
      
      if (result.success) {
        setPaymentSuccess(true);
        setTransactionId(result.transactionId || null);
        notificationService.success('Payment successful!');
      } else {
        setPaymentError(result.error || 'Payment failed');
        notificationService.error(result.error || 'Payment failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setPaymentError(errorMessage);
      notificationService.error(errorMessage);
      
      return {
        success: false,
        status: 'error',
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Reset payment state
   */
  const resetPaymentState = () => {
    setIsProcessing(false);
    setPaymentError(null);
    setPaymentSuccess(false);
    setTransactionId(null);
  };
  
  return {
    isProcessing,
    paymentError,
    paymentSuccess,
    transactionId,
    createPaymentIntent,
    processCardPayment,
    processBankPayment,
    processWalletPayment,
    resetPaymentState
  };
};

export default useStripePayment;