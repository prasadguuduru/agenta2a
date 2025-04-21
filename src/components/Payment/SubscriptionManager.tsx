// src/components/Payment/SubscriptionManager.tsx

import React, { useState, useEffect } from 'react';
import { useStripe } from '../../contexts/StripeContext';
//import useStripePayment from '../../hooks/useStripePayment';
import StripePaymentForm from './StripePaymentForm';
import notificationService from '../../services/notificationService';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
}

interface SubscriptionManagerProps {
  currentPlanId?: string;
  onSubscriptionChange?: (planId: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  currentPlanId,
  onSubscriptionChange
}) => {
  const { isInitialized, isLoading: isStripeLoading } = useStripe();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Mock subscription plans
  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential features for personal use',
      price: 9.99,
      currency: 'USD',
      features: [
        '1 agent',
        '100K tokens per month',
        'Chat interface only',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'Advanced features for business use',
      price: 29.99,
      currency: 'USD',
      features: [
        '5 agents',
        '1M tokens per month',
        'All UI components',
        'Priority support',
        'API access'
      ],
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Comprehensive solution for large teams',
      price: 99.99,
      currency: 'USD',
      features: [
        'Unlimited agents',
        '10M tokens per month',
        'Custom components',
        'Dedicated support',
        'Multi-user access',
        'Advanced security features'
      ]
    }
  ];
  
  // Set the initial selected plan based on currentPlanId or default to the first plan
  useEffect(() => {
    if (currentPlanId) {
      const plan = plans.find(p => p.id === currentPlanId) || plans[0];
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(plans[0]);
    }
  }, [currentPlanId]);
  
  // Handle plan selection
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };
  
  // Handle plan change button click
  const handleChangePlan = () => {
    if (!selectedPlan) return;
    
    if (selectedPlan.id === currentPlanId) {
      notificationService.info('You are already subscribed to this plan');
      return;
    }
    
    setIsChangingPlan(true);
    setShowPaymentForm(true);
  };
  
  // Handle payment completion
  const handlePaymentComplete = (result: { success: boolean; transactionId?: string }) => {
    setShowPaymentForm(false);
    
    if (result.success && selectedPlan) {
      notificationService.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
      
      if (onSubscriptionChange) {
        onSubscriptionChange(selectedPlan.id);
      }
    } else {
      notificationService.error('Subscription change failed. Please try again.');
    }
    
    setIsChangingPlan(false);
  };
  
  // Handle payment form cancellation
  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setIsChangingPlan(false);
  };
  
  if (isStripeLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isInitialized) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Payment system is not available. Please try again later or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {showPaymentForm ? (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Subscribe to {selectedPlan?.name} Plan</h2>
          <StripePaymentForm
            amount={selectedPlan?.price || 0}
            currency={selectedPlan?.currency || 'USD'}
            items={[
              {
                id: selectedPlan?.id || '',
                name: `${selectedPlan?.name} Plan Subscription`,
                description: 'Monthly subscription',
                price: selectedPlan?.price || 0,
                currency: selectedPlan?.currency || 'USD',
                quantity: 1
              }
            ]}
            paymentMethods={[
              {
                type: 'card',
                label: 'Credit/Debit Card',
                description: 'Pay with Visa, Mastercard, or American Express'
              },
              {
                type: 'bank',
                label: 'Bank Account',
                description: 'Direct deposit from your bank account'
              }
            ]}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handlePaymentCancel}
          />
        </div>
      ) : (
        <>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Subscription Plans</h2>
            <p className="text-gray-600">Choose the plan that's right for you</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`border rounded-lg overflow-hidden ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-all`}
                >
                  {plan.isPopular && (
                    <div className="bg-primary-500 text-white text-xs font-bold uppercase tracking-wide text-center py-1">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 text-sm">/month</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      type="button"
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-2 rounded-lg transition-colors ${
                        selectedPlan?.id === plan.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleChangePlan}
                disabled={isChangingPlan || !selectedPlan || selectedPlan.id === currentPlanId}
                className={`px-6 py-2 rounded-lg ${
                  isChangingPlan || !selectedPlan || selectedPlan.id === currentPlanId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition-colors`}
              >
                {isChangingPlan
                  ? 'Processing...'
                  : selectedPlan?.id === currentPlanId
                    ? 'Current Plan'
                    : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionManager;