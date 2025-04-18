
//import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatList } from '../components/ChatList/ChatList';
import { Message } from '../api/types';

const meta: Meta<typeof ChatList> = {
  title: 'Components/ChatList',
  component: ChatList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatList>;

const sampleConversation: Message[] = [
  {
    id: '1',
    role: 'user',
    content: [{ type: 'text', text: 'Hello! Can you tell me about AWS Bedrock?'}],
    timestamp: Date.now() - 600000,
  },
  {
    id: '2',
    role: 'agent',
    content: [{ type: 'text', text: 'AWS Bedrock is a fully managed service that offers a choice of high-performing foundation models from leading AI companies like Anthropic, Meta, and Amazon. It allows you to build and scale generative AI applications using these models without having to manage the underlying infrastructure.'}],
    timestamp: Date.now() - 590000,
  },
  {
    id: '3',
    role: 'user',
    content: [{ type: 'text', text: 'How does it integrate with other AWS services?'}],
    timestamp: Date.now() - 300000,
  },
  {
    id: '4',
    role: 'agent',
    content: [{ type: 'text', text: 'AWS Bedrock integrates well with various AWS services. You can use it with Amazon S3 for data storage, Amazon SageMaker for machine learning workflows, AWS Lambda for serverless functions, and Amazon CloudWatch for monitoring. It also works with security services like IAM for access control and AWS KMS for encryption.'}],
    timestamp: Date.now() - 290000,
  },
  {
    id: '5',
    role: 'user',
    content: [{ type: 'text', text: 'Can I fine-tune models in Bedrock?'}],
    timestamp: Date.now() - 120000,
  },
  {
    id: '6',
    role: 'agent',
    content: [{ type: 'text', text: 'Yes, AWS Bedrock supports custom model fine-tuning. This allows you to adapt foundation models to your specific use cases by training them on your own data. Fine-tuning can help improve model performance on domain-specific tasks and make the outputs more aligned with your organization\'s style and requirements.'}],
    timestamp: Date.now() - 100000,
  },
];

export const EmptyConversation: Story = {
  args: {
    messages: [],
    isTyping: false,
  },
};

export const WithMessages: Story = {
  args: {
    messages: sampleConversation,
    isTyping: false,
  },
};

export const AgentTyping: Story = {
  args: {
    messages: sampleConversation,
    isTyping: true,
  },
};