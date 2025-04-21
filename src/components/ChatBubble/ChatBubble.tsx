// src/components/ChatBubble/ChatBubble.tsx
import React, { useState, useEffect } from 'react';
import { Message, MessageContent, Option, PaymentContent } from '../../api/types';
import { formatTimestamp } from '../../utils/agentUtils';
import { useAgent } from '../../hooks/useAgent';
import notificationService from '../../services/notificationService';

export interface ChatBubbleProps {
  message: Message;
  isConsecutive?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message,
  isConsecutive = false
}) => {
  const isUser = message.role === 'user';
  const { sendMessage, currentSession } = useAgent();
  const messages = currentSession?.messages || [];
  
  // State for form values
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // Track the latest message to detect responses after payment submission
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  
  // This effect monitors for new messages and resets the payment processing state
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // If we have a new message and we're in processing state, reset the processing state
      if (latestMessage.id !== lastMessageId && isProcessing) {
        setIsProcessing(false);
        setSelectedPaymentMethod(null);
      }
      
      // Update the last message ID
      setLastMessageId(latestMessage.id);
    }
  }, [messages, isProcessing, lastMessageId]);
  
  // Safety timeout to prevent UI from getting stuck
  useEffect(() => {
    // Safety mechanism: reset processing state after a timeout
    // This prevents the UI from being stuck if something goes wrong
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isProcessing) {
      timeoutId = setTimeout(() => {
        setIsProcessing(false);
        setSelectedPaymentMethod(null);
        console.log('Payment processing timeout - resetting state');
        notificationService.warning('Payment processing is taking longer than expected. Please try again.');
      }, 6000); // 6-second timeout (the mock API has a 2-second delay)
    }
    
    // Cleanup timeout on unmount or when isProcessing changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isProcessing]);
  
  // Handle form input changes
  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  // Handle radio button selection
  const handleRadioSelection = (contentIndex: number, option: Option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [`content-${contentIndex}`]: option
    }));
  };
  
  // Handle checkbox selection
  const handleCheckboxSelection = (contentIndex: number, option: Option, isChecked: boolean) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[`content-${contentIndex}`] || [];
      
      if (isChecked) {
        // Add option if checked and not already in the array
        return {
          ...prev,
          [`content-${contentIndex}`]: [...currentSelections, option]
        };
      } else {
        // Remove option if unchecked
        return {
          ...prev,
          [`content-${contentIndex}`]: currentSelections.filter(
            (opt: Option) => opt.value !== option.value
          )
        };
      }
    });
  };
  
  // Handle button click
  const handleButtonClick = (action: string, data?: any): void => {
    // Format as a special submission message
    const submissionData = {
      action: action,
      formData: data || {}
    };
    
    // Send as a special message format that the mock API will recognize
    sendMessage(`__SUBMIT__:${JSON.stringify(submissionData)}`);
  };
  
  // Handle form submission
  const handleFormSubmit = (action: string) => {
    // Get form data from state
    const data = formValues;
    
    // Send submission
    handleButtonClick(action, data);
  };
  
  // Handle choices submission
  const handleChoicesSubmit = (contentIndex: number, action: string, selectionType: 'radio' | 'checkbox') => {
    const selection = selectedOptions[`content-${contentIndex}`];
    
    // Send selected option(s)
    handleButtonClick(action, selectionType === 'radio' ? selection : selection);
  };
  
  // Payment method selection handler
  const handlePaymentMethodSelection = (type: string) => {
    setSelectedPaymentMethod(type);
  };
  
  // Handle payment submission
  const handlePaymentSubmit = (paymentContent: PaymentContent) => {
    if (!selectedPaymentMethod) {
      notificationService.warning('Please select a payment method');
      return;
    }
    
    setIsProcessing(true);
    
    // Format payment data
    const paymentData = {
      amount: paymentContent.totalAmount,
      currency: paymentContent.currency,
      paymentMethod: selectedPaymentMethod,
      items: paymentContent.items || []
    };
    
    // Send submission with payment data
    handleButtonClick(paymentContent.submitButton.onSubmit, paymentData);
    
    // Since we can't track the response, use a setTimeout to reset the state
    // This simulates waiting for the response, since our mock API has a 2-second delay
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedPaymentMethod(null);
    }, 3000);
  };

  // Function to render different content types
  const renderContent = (content: MessageContent, index: number) => {
    switch (content.type) {
      case 'text':
        return <div className="whitespace-pre-wrap">{content.text}</div>;
        
      case 'choices':
        return (
          <div className="mt-2 bg-white rounded-lg p-3 border border-secondary-200">
            <div className="font-medium mb-2">{content.question}</div>
            <div className="space-y-2 mb-4">
              {content.options.map((option: Option, optIndex: number) => (
                <div key={optIndex} className="flex items-start">
                  {content.selectionType === 'radio' ? (
                    <input 
                      type="radio" 
                      id={`option-${message.id}-${index}-${optIndex}`}
                      name={`options-${message.id}-${index}`}
                      className="mt-1 mr-2"
                      onChange={() => handleRadioSelection(index, option)}
                    />
                  ) : (
                    <input 
                      type="checkbox" 
                      id={`option-${message.id}-${index}-${optIndex}`}
                      className="mt-1 mr-2"
                      onChange={(e) => handleCheckboxSelection(index, option, e.target.checked)}
                    />
                  )}
                  <div>
                    <label 
                      htmlFor={`option-${message.id}-${index}-${optIndex}`}
                      className="font-medium"
                    >
                      {option.label}
                    </label>
                    {option.description && (
                      <p className="text-sm text-secondary-600">{option.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {content.submitButton && (
              <button
                onClick={() => handleChoicesSubmit(
                  index, 
                  content.submitButton!.onSubmit, 
                  content.selectionType
                )}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {content.submitButton.text}
              </button>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="mt-2 bg-white rounded-lg overflow-hidden border border-secondary-200">
            {content.title && <div className="font-medium p-3 border-b border-secondary-200">{content.title}</div>}
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${content.videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {(content.additionalActions || content.submitButton) && (
              <div className="p-3 bg-secondary-50 border-t border-secondary-200">
                {content.additionalActions && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {content.additionalActions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => handleButtonClick(content.submitButton!.onSubmit, action)}
                        className="px-3 py-1 bg-secondary-200 text-secondary-700 rounded text-sm hover:bg-secondary-300 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                {content.submitButton && (
                  <button
                    onClick={() => handleButtonClick(content.submitButton!.onSubmit)}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    {content.submitButton.text}
                  </button>
                )}
              </div>
            )}
          </div>
        );
        
      case 'form':
        return (
          <div className="mt-2 bg-white rounded-lg p-3 border border-secondary-200">
            {content.title && <div className="font-medium mb-3">{content.title}</div>}
            <div className="space-y-4 mb-4">
              {content.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="space-y-1">
                  <label 
                    htmlFor={`field-${message.id}-${index}-${fieldIndex}`}
                    className="block text-sm font-medium text-secondary-700"
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      placeholder={field.placeholder || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      placeholder={field.placeholder || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                      rows={4}
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      placeholder={field.placeholder || ''}
                      min={field.min}
                      max={field.max}
                      onChange={(e) => handleInputChange(field.id, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <select
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    >
                      <option value="">Select an option</option>
                      {field.options.map((option, optIndex) => (
                        <option key={optIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <div className="space-y-2">
                      {field.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-start">
                          <input
                            type="checkbox"
                            id={`field-${message.id}-${index}-${fieldIndex}-${optIndex}`}
                            defaultChecked={option.checked}
                            onChange={(e) => {
                              const newValue = formValues[field.id] || [];
                              const updated = e.target.checked
                                ? [...newValue, option.value]
                                : newValue.filter((v: string) => v !== option.value);
                              handleInputChange(field.id, updated);
                            }}
                            className="mt-1 mr-2"
                          />
                          <div>
                            <label 
                              htmlFor={`field-${message.id}-${index}-${fieldIndex}-${optIndex}`}
                              className="font-medium"
                            >
                              {option.label}
                            </label>
                            {option.description && (
                              <p className="text-sm text-secondary-600">{option.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'date' && (
                    <input
                      type="date"
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'time' && (
                    <input
                      type="time"
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'file' && (
                    <input
                      type="file"
                      id={`field-${message.id}-${index}-${fieldIndex}`}
                      accept={field.allowedTypes}
                      multiple={field.multiple}
                      onChange={(e) => {
                        const files = (e.target as HTMLInputElement).files;
                        handleInputChange(field.id, files);
                      }}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required={field.required}
                    />
                  )}
                  
                  {field.type === 'rating' && (
                    <div className="flex items-center">
                      {[...Array(field.maxRating)].map((_, ratingIndex) => (
                        <button
                          key={ratingIndex}
                          type="button"
                          onClick={() => handleInputChange(field.id, ratingIndex + 1)}
                          className={`text-2xl ${
                            (formValues[field.id] || 0) > ratingIndex 
                              ? 'text-yellow-400' 
                              : 'text-secondary-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {content.submitButton && (
              <button
              onClick={() => handleFormSubmit(content.submitButton!.onSubmit)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {content.submitButton.text}
              </button>
            )}
          </div>
        );
        
      case 'confirmation':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="font-medium mb-2">{content.title}</div>
            <p className="mb-4 text-secondary-600">{content.message}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleButtonClick(content.onSubmit, { confirmed: true })}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {content.confirmButton}
              </button>
              <button
                onClick={() => handleButtonClick(content.onSubmit, { confirmed: false })}
                className="px-4 py-2 bg-white border border-secondary-300 text-secondary-700 rounded hover:bg-secondary-50 transition-colors"
              >
                {content.cancelButton}
              </button>
            </div>
          </div>
        );
        
      case 'progress':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{content.title}</div>
              <div className="text-sm text-secondary-600">{content.percentage}%</div>
            </div>
            
            <div className="w-full bg-secondary-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${content.percentage}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 mb-4">
              {content.steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex items-center">
                  {step.status === 'completed' ? (
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.status === 'in_progress' ? (
                    <svg className="w-5 h-5 text-blue-500 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : step.status === 'failed' ? (
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-secondary-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'in_progress' ? 'text-blue-600 font-medium' :
                    step.status === 'failed' ? 'text-red-600' :
                    'text-secondary-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            
            {content.refreshButton && (
              <button
                onClick={() => handleButtonClick(content.refreshButton!.onSubmit)}
                className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition-colors"
              >
                {content.refreshButton.text}
              </button>
            )}
          </div>
        );
        
      case 'securityReport':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium">{content.title}</div>
              <div className="text-xs text-secondary-500">
                {new Date(content.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {content.findings.map((finding, findingIndex) => {
                const severityColor = 
                  finding.severity === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                  finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  finding.severity === 'low' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-green-100 text-green-800 border-green-200';
                
                return (
                  <div key={findingIndex} className={`p-3 rounded-lg border ${severityColor}`}>
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{finding.category}</div>
                      <div className="text-xs uppercase font-bold px-2 py-1 rounded bg-white">
                        {finding.severity}
                      </div>
                    </div>
                    <p className="text-sm mt-1">{finding.message}</p>
                    <p className="text-sm mt-2 font-medium">Recommendation: {finding.recommendation}</p>
                  </div>
                );
              })}
            </div>
            
            {content.downloadButton && (
              <button
                onClick={() => handleButtonClick(content.downloadButton!.onSubmit)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {content.downloadButton.text}
              </button>
            )}
          </div>
        );
        
      case 'securityDashboard':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="mb-4">
              <div className="font-medium mb-2">{content.title}</div>
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-secondary-100 border-4 border-primary-500 mr-4">
                  <span className="text-2xl font-bold text-primary-700">{content.securityScore}%</span>
                </div>
                <div>
                  <div className="font-medium mb-1">Security Score</div>
                  <div className="text-sm text-secondary-600">
                    {content.securityScore >= 80 ? 'Good' : 
                     content.securityScore >= 60 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="font-medium mb-2">Recommendations</div>
              <ul className="text-sm space-y-1">
                {content.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <div className="font-medium mb-2">Actions</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {content.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={() => handleButtonClick(content.submitButton!.onSubmit, action)}
                    className="px-3 py-2 bg-secondary-100 text-secondary-800 rounded hover:bg-secondary-200 transition-colors text-sm text-left"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            
            {content.submitButton && (
              <button
                onClick={() => handleButtonClick(content.submitButton!.onSubmit)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {content.submitButton.text}
              </button>
            )}
          </div>
        );
        
      case 'steps':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="font-medium mb-2">{content.title}</div>
            <ol className="list-decimal pl-5 space-y-1">
              {content.steps.map((step, stepIndex) => (
                <li key={stepIndex}>{step}</li>
              ))}
            </ol>
          </div>
        );

      case 'payment':
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className="font-medium text-lg mb-3">{content.title}</div>
            
            {content.description && (
              <p className="text-secondary-600 mb-4">{content.description}</p>
            )}
            
            {/* Show items if available */}
            {content.items && content.items.length > 0 && (
              <div className="mb-4 border-b border-secondary-200 pb-4">
                <div className="font-medium mb-2">Order Summary</div>
                <div className="space-y-2">
                  {content.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center">
                      <div className="flex items-center">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-10 h-10 object-cover rounded mr-2" 
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-secondary-500">{item.description}</div>
                          )}
                          <div className="text-sm">
                            Qty: {item.quantity} × {item.currency} {item.price.toFixed(2)}
                          </div>
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
                  <div>{content.currency} {content.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            )}
            
            {/* Payment Methods */}
            <div className="mb-4">
              <div className="font-medium mb-2">Payment Method</div>
              <div className="space-y-2">
              {content.paymentMethods.map((method, methodIndex) => (
                  <div 
                    key={methodIndex}
                    onClick={() => handlePaymentMethodSelection(method.type)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      selectedPaymentMethod === method.type 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-secondary-200 hover:border-secondary-300'
                    }`}
                  >
                    {method.icon && (
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
                    )}
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
            
            {/* Payment form would be shown here based on selected method */}
            {selectedPaymentMethod === 'card' && (
              <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Card Number
                    </label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Expiry Date
                      </label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Security Code
                      </label>
                      <input 
                        type="text" 
                        placeholder="CVC"
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Name on Card
                    </label>
                    <input 
                      type="text" 
                      placeholder="John Smith"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedPaymentMethod === 'bank' && (
              <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Account Holder Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="John Smith"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Account Number
                    </label>
                    <input 
                      type="text" 
                      placeholder="0123456789"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Routing Number
                    </label>
                    <input 
                      type="text" 
                      placeholder="123456789"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedPaymentMethod === 'wallet' && (
              <div className="mb-4 p-3 border border-secondary-200 rounded-lg">
                <div className="text-center py-2">
                  <div className="font-medium">Digital Wallet Selected</div>
                  <p className="text-secondary-600 text-sm">You'll be redirected to complete payment</p>
                </div>
              </div>
            )}
            
            <button
  onClick={() => handlePaymentSubmit(content)}
  disabled={isProcessing || !selectedPaymentMethod}
  className={`w-full py-2 rounded-lg ${
    isProcessing || !selectedPaymentMethod
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
    `Pay ${content.currency} ${content.totalAmount.toFixed(2)}`
  )}
</button>
          </div>
        );

      case 'paymentConfirmation':
        const statusColor = 
          content.status === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
          content.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
          'bg-red-100 text-red-800 border-red-200';
        
        return (
          <div className="mt-2 bg-white rounded-lg p-4 border border-secondary-200">
            <div className={`p-4 rounded-lg ${statusColor} mb-4 flex items-center`}>
              {content.status === 'success' && (
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {content.status === 'processing' && (
                <svg className="w-6 h-6 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {content.status === 'failed' && (
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <div>
                <div className="font-medium">
                  Payment {content.status === 'success' ? 'Successful' : 
                           content.status === 'processing' ? 'Processing' : 'Failed'}
                </div>
                <div className="text-sm">
                  {content.status === 'success' ? 'Your payment has been processed successfully.' : 
                   content.status === 'processing' ? 'Your payment is being processed.' : 
                   'There was an issue processing your payment.'}
                </div>
              </div>
            </div>
            
            <div className="font-medium text-lg mb-3">{content.title}</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                <div className="text-secondary-600">Amount</div>
                <div className="font-medium">{content.currency} {content.amount.toFixed(2)}</div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                <div className="text-secondary-600">Transaction ID</div>
                <div className="font-medium">{content.transactionId}</div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-secondary-100">
                <div className="text-secondary-600">Date</div>
                <div className="font-medium">{new Date(content.timestamp).toLocaleString()}</div>
              </div>
            </div>
            
            {content.receiptUrl && content.status === 'success' && (
              <a 
                href={content.receiptUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block px-4 py-2 bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition-colors"
              >
                View Receipt
              </a>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
      data-testid={`chat-bubble-${message.id}`}
    >
      {!isUser && !isConsecutive && (
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
      )}
      
      {!isUser && isConsecutive && <div className="w-8 mr-2" />}
      
      <div 
        className={`max-w-3xl rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-secondary-100 text-secondary-800 rounded-tl-none'
        }`}
      >
        {Array.isArray(message.content) 
          ? message.content.map((content: MessageContent, index: number) => (
              <div key={index} className={index > 0 ? 'mt-3' : ''}>
                {renderContent(content, index)}
              </div>
            ))
          : renderContent(message.content as MessageContent, 0)}
        
        {!isConsecutive && (
          <div 
            className={`text-xs mt-1 ${
              isUser ? 'text-primary-100' : 'text-secondary-500'
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
      
      {isUser && !isConsecutive && (
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-white text-sm font-bold">You</span>
        </div>
      )}
      
      {isUser && isConsecutive && <div className="w-8 ml-2" />}
    </div>
  );
};

export default ChatBubble;