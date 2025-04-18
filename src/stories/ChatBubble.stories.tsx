
//import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '../components/ChatBubble/ChatBubble';
import { Message } from '../api/types';

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/ChatBubble',
  component: ChatBubble,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

const userMessage: Message = {
  id: '1',
  role: 'user',
  content: [{ type: 'text', text: 'Hello, how are you today?' }],
  timestamp: Date.now() - 60000, // 1 minute ago
};

const agentMessage: Message = {
  id: '2',
  role: 'agent',
  content: [{ type: 'text', text: 'I\'m doing well, thank you for asking! How can I help you today?'}],
  timestamp: Date.now() - 30000, // 30 seconds ago
};

const longAgentMessage: Message = {
  id: '3',
  role: 'agent',
  content: [{ type: 'text', text:`I'd be happy to explain how AWS Bedrock works with agents!

AWS Bedrock is a fully managed service that offers access to foundation models (FMs) from leading AI companies. It provides a unified API for accessing these models.

AWS Bedrock Agents extends this by allowing you to build autonomous agents that can:
1. Understand natural language requests
2. Break down complex tasks
3. Call APIs to access company data and services
4. Use knowledge bases for additional context
5. Generate appropriate responses

The agents can orchestrate the interactions between foundation models, your data sources, and business logic to complete tasks.` }],
  timestamp: Date.now() - 10000, // 10 seconds ago
};

export const UserMessage: Story = {
  args: {
    message: userMessage,
    isConsecutive: false,
  },
};

export const AgentMessage: Story = {
  args: {
    message: agentMessage,
    isConsecutive: false,
  },
};

export const ConsecutiveUserMessage: Story = {
  args: {
    message: userMessage,
    isConsecutive: true,
  },
};

export const ConsecutiveAgentMessage: Story = {
  args: {
    message: agentMessage,
    isConsecutive: true,
  },
};

export const LongAgentMessage: Story = {
  args: {
    message: longAgentMessage,
    isConsecutive: false,
  },
};