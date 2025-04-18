
//import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SessionList } from '../components/SessionList/SessionList';
import { ChatSession } from '../api/types';

const meta: Meta<typeof SessionList> = {
  title: 'Components/SessionList',
  component: SessionList,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectSession: { action: 'session selected' },
    onCreateSession: { action: 'new session created' },
  },
};

export default meta;
type Story = StoryObj<typeof SessionList>;

const sampleSessions: ChatSession[] = [
  {
    id: '1',
    title: 'AWS Bedrock Overview',
    messages: Array(8).fill(null).map((_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? 'user' : 'agent',
      content: [{ type: 'text', text: 'Sample content' }], // Updated to array of MessageContent
      timestamp: Date.now() - (i * 100000),
    })),
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 100000,
  },
  {
    id: '2',
    title: 'Fine-tuning Models',
    messages: Array(4).fill(null).map((_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? 'user' : 'agent',
      content: [{ type: 'text', text: 'Sample content'}],
      timestamp: Date.now() - (i * 100000),
    })),
    createdAt: Date.now() - 500000,
    updatedAt: Date.now() - 300000,
  },
  {
    id: '3',
    title: 'Integration with Lambda',
    messages: Array(12).fill(null).map((_, i) => ({
      id: `msg-${i}`,
      role: i % 2 === 0 ? 'user' : 'agent',
      content:  [{ type: 'text', text:'Sample content'}],
      timestamp: Date.now() - (i * 100000),
    })),
    createdAt: Date.now() - 2000000,
    updatedAt: Date.now() - 150000,
  },
  {
    id: '4',
    title: 'New Conversation',
    messages: [],
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000,
  }
];

export const WithSessions: Story = {
  args: {
    sessions: sampleSessions,
    currentSessionId: '1',
    onSelectSession: (id) => console.log(`Selected session ${id}`),
    onCreateSession: () => console.log('Create new session'),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const EmptySessions: Story = {
  args: {
    sessions: [],
    currentSessionId: null,
    onSelectSession: (id) => console.log(`Selected session ${id}`),
    onCreateSession: () => console.log('Create new session'),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const WithActiveSession: Story = {
  args: {
    sessions: sampleSessions,
    currentSessionId: '2',
    onSelectSession: (id) => console.log(`Selected session ${id}`),
    onCreateSession: () => console.log('Create new session'),
  },
  parameters: {
    layout: 'fullscreen',
  },
};