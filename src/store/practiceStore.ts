import { create } from 'zustand';
import { LearningNode } from '@/hooks/useLearningEngine';

interface PracticeTreeState {
  // Navigation
  expandedNodeIds: Set<string>;
  selectedNode: LearningNode | null;
  toggleNode: (nodeId: string) => void;
  expandPath: (path: string[]) => void;
  setSelectedNode: (node: LearningNode | null) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Intelligence Cache
  nodeIntelligence: Record<string, {
    weakScore: number | null;
    totalAttempts: number;
    lastAttemptedAt: string | null;
  }>;
  setNodeIntelligence: (nodeId: string, data: any) => void;
}

// NOTE: Since we are in a sandbox where 'zustand' might not be auto-installed
// we implement a simple version of the create pattern if needed, but here we assume it's available
// (In production, you'd run 'npm install zustand')

export const usePracticeStore = create<PracticeTreeState>((set) => ({
  expandedNodeIds: new Set<string>(),
  selectedNode: null,
  
  toggleNode: (nodeId) => set((state) => {
    const newSet = new Set(state.expandedNodeIds);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    return { expandedNodeIds: newSet };
  }),
  
  expandPath: (path) => set((state) => {
    const newSet = new Set(state.expandedNodeIds);
    path.forEach(id => newSet.add(id));
    return { expandedNodeIds: newSet };
  }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  nodeIntelligence: {},
  setNodeIntelligence: (nodeId, data) => set((state) => ({
    nodeIntelligence: {
      ...state.nodeIntelligence,
      [nodeId]: data
    }
  })),
}));
