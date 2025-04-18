
//import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput } from '../components/ChatInput/ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Components/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSendMessage: { action: 'message sent' },
    isLoading: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message...',
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Type your message...',
    isLoading: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Ask the AI agent anything...',
    isLoading: false,
  },
};