// src/components/ChatBubble/ChatBubble.tsx
import React, { useState } from 'react';
import { Message, MessageContent, Option } from '../../api/types';
import { formatTimestamp } from '../../utils/agentUtils';
import { useAgent } from '../../hooks/useAgent';

export interface ChatBubbleProps {
  message: Message;
  isConsecutive?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message,
  isConsecutive = false
}) => {
  const isUser = message.role === 'user';
  const { sendMessage } = useAgent();
  
  // State for form values
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  
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
  const handleButtonClick = (action: string, data?: any) => {
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