// src/contexts/StripeContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeStripe } from '../services/stripeInitializer';

interface StripeContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const StripeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const init = async () => {
      try {
        const success = await initializeStripe();
        setIsInitialized(success);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Stripe initialization failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  return (
    <StripeContext.Provider value={{ isInitialized, isLoading, error }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripe = (): StripeContextType => {
  const context = useContext(StripeContext);
  
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  
  return context;
};