import { useSyncExternalStore } from 'react';
import { LearningNode } from '@/hooks/useLearningEngine';

// --- ROBUST ZERO-DEPENDENCY STORE (Zustand Compatibility) ---

interface PracticeTreeState {
  // State
  expandedNodeIds: Set<string>;
  selectedNode: LearningNode | null;
  searchQuery: string;
  nodeIntelligence: Record<string, any>;
  
  // Actions (Included in the state object to match usePracticeStore() call pattern)
  toggleNode: (nodeId: string) => void;
  expandPath: (path: string[]) => void;
  setSelectedNode: (node: LearningNode | null) => void;
  setSearchQuery: (query: string) => void;
  setNodeIntelligence: (nodeId: string, data: any) => void;
}

const internalStore = {
  state: {
    expandedNodeIds: new Set<string>(),
    selectedNode: null,
    searchQuery: '',
    nodeIntelligence: {},
    
    // Action Implementations
    toggleNode: (nodeId: string) => {
      const { expandedNodeIds } = internalStore.getState();
      const next = new Set(expandedNodeIds);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      internalStore.setState({ expandedNodeIds: next });
    },
    expandPath: (path: string[]) => {
      const { expandedNodeIds } = internalStore.getState();
      const next = new Set(expandedNodeIds);
      path.forEach(id => next.add(id));
      internalStore.setState({ expandedNodeIds: next });
    },
    setSelectedNode: (node: LearningNode | null) => {
      internalStore.setState({ selectedNode: node });
    },
    setSearchQuery: (query: string) => {
      internalStore.setState({ searchQuery: query });
    },
    setNodeIntelligence: (nodeId: string, data: any) => {
      const { nodeIntelligence } = internalStore.getState();
      internalStore.setState({ 
        nodeIntelligence: { ...nodeIntelligence, [nodeId]: data } 
      });
    }
  } as PracticeTreeState,

  listeners: new Set<() => void>(),

  getState() { return this.state; },

  setState(next: Partial<PracticeTreeState> | ((s: PracticeTreeState) => Partial<PracticeTreeState>)) {
    const nextState = typeof next === 'function' ? next(this.state) : next;
    this.state = { ...this.state, ...nextState };
    this.listeners.forEach(l => l());
  },

  subscribe(l: () => void) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
};

// Public Hook (exactly mimics Zustand)
export const usePracticeStore = <T,>(selector: (s: PracticeTreeState) => T): T => {
  return useSyncExternalStore(
    internalStore.subscribe.bind(internalStore),
    () => selector(internalStore.getState())
  );
};
