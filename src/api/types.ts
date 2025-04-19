// src/api/types.ts
// Message content types

// Basic text content
export interface TextContent {
  type: 'text';
  text: string;
}

// Option for selections
export interface Option {
  label: string;
  value: string;
  description?: string;
  checked?: boolean;
}

// Button definition
export interface Button {
  text: string;
  onSubmit: string;
}

// Enhanced choices content with submit button
export interface ChoiceContent {
  type: 'choices';
  question: string;
  options: Option[];
  selectionType: 'radio' | 'checkbox';
  submitButton?: Button;
}

// Video content with actions
export interface VideoContent {
  type: 'video';
  videoId: string; // YouTube video ID
  title?: string;
  description?: string;
  additionalActions?: Option[];
  submitButton?: Button;
}

// Form field base
interface FormFieldBase {
  id: string;
  label: string;
  required: boolean;
}

// Text input field
interface TextInputField extends FormFieldBase {
  type: 'text';
  placeholder?: string;
  value?: string;
}

// Text area field
interface TextAreaField extends FormFieldBase {
  type: 'textarea';
  placeholder?: string;
  value?: string;
}

// Number input field
interface NumberField extends FormFieldBase {
  type: 'number';
  placeholder?: string;
  min?: number;
  max?: number;
  value?: number;
}

// Select dropdown field
interface SelectField extends FormFieldBase {
  type: 'select';
  options: Option[];
  value?: string;
}

// Checkbox group field
interface CheckboxField extends FormFieldBase {
  type: 'checkbox';
  options: Option[];
  value?: string[];
}

// Date picker field
interface DateField extends FormFieldBase {
  type: 'date';
  value?: string;
}

// Time picker field
interface TimeField extends FormFieldBase {
  type: 'time';
  value?: string;
}

// File upload field
interface FileField extends FormFieldBase {
  type: 'file';
  allowedTypes?: string;
  multiple?: boolean;
}

// Rating field
interface RatingField extends FormFieldBase {
  type: 'rating';
  maxRating: number;
  value?: number;
}

// Union type for all form field types
type FormField = TextInputField | TextAreaField | NumberField | SelectField | CheckboxField | 
                 DateField | TimeField | FileField | RatingField;

// Form content
export interface FormContent {
  type: 'form';
  title: string;
  fields: FormField[];
  submitButton: Button;
}

// Confirmation dialog
export interface ConfirmationContent {
  type: 'confirmation';
  title: string;
  message: string;
  confirmButton: string;
  cancelButton: string;
  onSubmit: string;
}

// Step in a progress indicator
interface ProgressStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// Progress indicator
export interface ProgressContent {
  type: 'progress';
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  percentage: number;
  steps: ProgressStep[];
  refreshButton?: Button;
}

// Security finding
interface SecurityFinding {
  severity: 'high' | 'medium' | 'low' | 'info';
  category: string;
  message: string;
  recommendation: string;
}

// Security report
export interface SecurityReportContent {
  type: 'securityReport';
  title: string;
  timestamp: string;
  findings: SecurityFinding[];
  downloadButton?: Button;
}

// Security dashboard
export interface SecurityDashboardContent {
  type: 'securityDashboard';
  title: string;
  securityScore: number;
  recommendations: string[];
  actions: Option[];
  submitButton?: Button;
}

// Steps list
export interface StepsContent {
  type: 'steps';
  title: string;
  steps: string[];
}

// Union type for all content types
export type MessageContent = TextContent | ChoiceContent | VideoContent | FormContent |
                            ConfirmationContent | ProgressContent | SecurityReportContent |
                            SecurityDashboardContent | StepsContent;

// Message interface
export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: MessageContent[];
  timestamp: number;
}

// Chat session interface
export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

// Agent configuration
export interface AgentConfig {
  agentId: string;
  agentAliasId: string;
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

// Agent request
export interface AgentRequest {
  inputText: string;
  sessionId: string;
}

// Agent response
export interface AgentResponse {
  completion: string;
  sessionId: string;
  requestId: string;
  promptTokens?: number;
  completionTokens?: number;
}