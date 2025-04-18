


// Message content types
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ChoiceContent {
  type: 'choices';
  question: string;
  options: string[];
  selectionType: 'radio' | 'checkbox';
  onSelect?: (selectedOptions: string[]) => void;
}

export interface VideoContent {
  type: 'video';
  videoId: string; // YouTube video ID
  title?: string;
}

// Union type for all content types
export type MessageContent = TextContent | ChoiceContent | VideoContent;

// Message interface
export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: MessageContent[];
  timestamp: number;
}

// Other existing interfaces
export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  title?: string;
}

export interface AgentConfig {
  agentId: string;
  agentAliasId: string;
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

  export interface ChatSession {
    id: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
    title?: string;
  }
  
  export interface AgentConfig {
    agentId: string;
    agentAliasId: string;
    region: string;
    credentials?: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  }
  
  export interface AgentRequest {
    inputText: string;
    sessionId: string;
  }
  
  export interface AgentResponse {
    completion: string;
    sessionId: string;
    requestId: string;
    promptTokens?: number;
    completionTokens?: number;
  }