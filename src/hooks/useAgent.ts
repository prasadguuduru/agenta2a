
import { useAgent as useAgentContext } from '../contexts/AgentContext';

export const useAgent = () => {
  return useAgentContext();
};

// Export a typing helper to make the hook usage more ergonomic
export type AgentHook = ReturnType<typeof useAgent>;