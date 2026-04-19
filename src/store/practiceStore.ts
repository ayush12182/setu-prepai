import { useState, useEffect } from 'react';
import { LearningNode } from '@/hooks/useLearningEngine';

// --- ULTRA-COMPATIBLE ZERO-DEPENDENCY STORE ---
// This uses the classic useState + useEffect subscription pattern
// which is more robust across different production environments.

interface PracticeTreeState {
  expandedNodeIds: Set<string>;
  selectedNode: LearningNode | null;
  searchQuery: string;
  nodeIntelligence: Record<string, any>;
  
  // Actions
  toggleNode: (nodeId: string) => void;
  expandPath: (path: string[]) => void;
  setSelectedNode: (node: LearningNode | null) => void;
  setSearchQuery: (query: string) => void;
  setNodeIntelligence: (nodeId: string, data: any) => void;
}

// Singleton state object
let globalState: PracticeTreeState = {
  expandedNodeIds: new Set<string>(),
  selectedNode: null,
  searchQuery: '',
  nodeIntelligence: {},
  
  toggleNode: (nodeId: string) => {
    const next = new Set(globalState.expandedNodeIds);
    if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
    setGlobalState({ expandedNodeIds: next });
  },
  expandPath: (path: string[]) => {
    const next = new Set(globalState.expandedNodeIds);
    path.forEach(id => next.add(id));
    setGlobalState({ expandedNodeIds: next });
  },
  setSelectedNode: (node) => {
    setGlobalState({ selectedNode: node });
  },
  setSearchQuery: (query) => {
    setGlobalState({ searchQuery: query });
  },
  setNodeIntelligence: (nodeId, data) => {
    setGlobalState({ 
      nodeIntelligence: { ...globalState.nodeIntelligence, [nodeId]: data } 
    });
  }
};

const listeners = new Set<(state: PracticeTreeState) => void>();

function setGlobalState(next: Partial<PracticeTreeState>) {
  globalState = { ...globalState, ...next };
  listeners.forEach(l => l(globalState));
}

// Public Hook (exactly mimics Zustand)
export const usePracticeStore = <T,>(selector: (s: PracticeTreeState) => T): T => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = (nextState: PracticeTreeState) => setState(nextState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return selector(state);
};
