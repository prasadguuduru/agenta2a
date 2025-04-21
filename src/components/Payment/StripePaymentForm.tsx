// src/components/Payment/StripePaymentForm.tsx

import React, { useState, useEffect } from 'react';
import useStripePayment from '../../hooks/useStripePayment';
import notificationService from '../../services/notificationService';
import { PaymentMethodOption, ProductItem } from '../../api/types';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  items?: ProductItem[];
  paymentMethods: PaymentMethodOption[];
  onPaymentComplete: (result: { 
    success: boolean; 
    transactionId?: string;
    receiptUrl?: string;
  }) => void;
  onCancel?: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  items,
  paymentMethods,
  onPaymentComplete,
  onCancel
}) => {
  // Get Stripe payment hook
  const {
    isProcessing,
    paymentError,
    // Remove unused variables
    // paymentSuccess,
    // transactionId,
    createPaymentIntent,
    processCardPayment,
    processBankPayment,
    processWalletPayment
  } = useStripePayment();
  
  // Form state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Bank details state
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  
  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      try {
        const clientSecret = await createPaymentIntent({
          amount: amount * 100, // Convert to cents for Stripe
          currency: currency.toLowerCase()
        });
        
        if (clientSecret) {
          setClientSecret(clientSecret);
        }
      } catch (error) {
        console.error('Failed to initialize payment:', error);
        notificationService.error('Could not initialize payment');
      }
    };
    
    initializePayment();
  }, [amount, currency, createPaymentIntent]);
  
  // Handle payment method selection
  const handlePaymentMethodSelection = (type: string) => {
    setSelectedPaymentMethod(type);
  };
  
  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientSecret) {
      notificationService.error('Payment not initialized. Please try again.');
      return;
    }
    
    if (!selectedPaymentMethod) {
      notificationService.warning('Please select a payment method');
      return;
    }
    
    try {
      let result;
      
      switch (selectedPaymentMethod) {
        case 'card':
          // Validate card details
          if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
            notificationService.warning('Please fill in all card details');
            return;
          }
          
          // Process card payment
          result = await processCardPayment(clientSecret, {
            number: cardNumber.replace(/\s+/g, ''),
            exp_month: parseInt(cardExpiry.split('/')[0], 10),
            exp_year: parseInt(cardExpiry.split('/')[1], 10),
            cvc: cardCvc,
            name: cardName
          });
          break;
          
        case 'bank':
          // Validate bank details
          if (!accountName || !accountNumber || !routingNumber) {
            notificationService.warning('Please fill in all bank account details');
            return;
          }
          
          // Process bank payment
          result = await processBankPayment(clientSecret, {
            account_holder_name: accountName,
            account_number: accountNumber,
            routing_number: routingNumber
          });
          break;
          
        case 'wallet':
          // Process wallet payment (in real app, would determine which wallet to use)
          result = await processWalletPayment(clientSecret, 'paypal');
          break;
          
        default:
          notificationService.error('Invalid payment method');
          return;
      }
      
      // Handle payment result
      if (result.success) {
        onPaymentComplete({
          success: true,
          transactionId: result.transactionId,
          receiptUrl: result.receiptUrl
        });
      } else {
        onPaymentComplete({
          success: false
        });
      }
    } catch (error) {
      console.error('Payment failed:', error);
      onPaymentComplete({ success: false });
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substring(i, i + 4));
    }
    
    return groups.join(' ').substring(0, 19); // Max 16 digits + 3 spaces
  };
  
  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    }
    
    const month = cleaned.substring(0, 2);
    const year = cleaned.substring(2, 4);
    
    return `${month}/${year}`;
  };
  
  return (
    <div className="bg-white rounded-lg p-4 border border-secondary-200">
      {/* Payment header */}
      <div className="font-medium text-lg mb-3">Complete Your Purchase</div>
      
      {/* Order summary */}
      {items && items.length > 0 && (
        <div className="mb-4 border-b border-secondary-200 pb-4">
          <div className="font-medium mb-2">Order Summary</div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-secondary-500">{item.description}</div>
                  )}
                  <div className="text-sm">
                    Qty: {item.quantity} × {item.currency} {item.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-medium">
                  {item.currency} {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center font-medium mt-4 pt-2 border-t border-secondary-100">
            <div>Total</div>
            <div>{currency} {amount.toFixed(2)}</div>
          </div>
        </div>
      )}
      
      {/* Payment error message */}
      {paymentError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {paymentError}
        </div>
      )}
      
      {/* Payment method selection */}
      <div className="mb-4">
        <div className="font-medium mb-2">Select Payment Method</div>
        <div className="space-y-2">
          {paymentMethods.map((method, index) => (
            <div 
              key={index}
              onClick={() => handlePaymentMethodSelection(method.type)}
              className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                selectedPaymentMethod === method.type 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="mr-3">
                {method.type === 'card' && (
                  <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                )}
                {method.type === 'bank' && (
                  <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"/>
                  </svg>
                )}
                {method.type === 'wallet' && (
                  <svg className="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{method.label}</div>
                {method.description && (
                  <div className="text-sm text-secondary-500">{method.description}</div>
                )}
              </div>
              <div className="ml-2">
                <div className={`w-5 h-5 rounded-full border ${
                  selectedPaymentMethod === method.type 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-secondary-300'
                }`}>
                  {selectedPaymentMethod === method.type && (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment details form */}
      <form onSubmit={handleSubmit}>
        {/* Credit Card Form */}
        {selectedPaymentMethod === 'card' && (
          <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Card Number
                </label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Expiry Date
                  </label>
                  <input 
                    type="text" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Security Code
                  </label>
                  <input 
                    type="text" 
                    value={cardCvc}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '');
                      setCardCvc(cleaned.substring(0, 4));
                    }}
                    placeholder="CVC"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Name on Card
                </label>
                <input 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Bank Account Form */}
        {selectedPaymentMethod === 'bank' && (
          <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Account Holder Name
                </label>
                <input 
                  type="text" 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Account Number
                </label>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setAccountNumber(cleaned);
                  }}
                  placeholder="0123456789"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Routing Number
                </label>
                <input 
                  type="text" 
                  value={routingNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    setRoutingNumber(cleaned);
                  }}
                  placeholder="123456789"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Wallet Payment */}
        {selectedPaymentMethod === 'wallet' && (
          <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
            <div className="text-center py-2">
              <div className="font-medium">Digital Wallet Selected</div>
              <p className="text-secondary-600 text-sm">You'll be redirected to complete payment</p>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isProcessing || !selectedPaymentMethod || !clientSecret}
            className={`flex-1 py-2 rounded-lg ${
              isProcessing || !selectedPaymentMethod || !clientSecret
                ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              `Pay ${currency} ${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;