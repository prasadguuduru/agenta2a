
//import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AgentChat } from '../components/AgentChat/AgentChat';
import { AgentProvider } from '../contexts/AgentContext';

const meta: Meta<typeof AgentChat> = {
  title: 'Components/AgentChat',
  component: AgentChat,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AgentProvider 
        config={{
          agentId: 'demo-agent-id',
          agentAliasId: 'demo-alias-id',
          region: 'us-east-1'
        }} 
        useMockApi={true}
      >
        <Story />
      </AgentProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentChat>;

export const Default: Story = {};