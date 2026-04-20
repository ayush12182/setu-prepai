import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LearningNode {
  id: string;
  parent_id: string | null;
  name: string;
  type: 'root' | 'chapter' | 'topic' | 'subtopic' | 'concept';
  exam_type: string;
  subject_node_id: string | null;
  sort_order: number;
}


const MOCK_NODES: LearningNode[] = [
  // NEET Root
  { id: 'mock-bio', name: 'Biology', type: 'root', exam_type: 'NEET', parent_id: null, subject_node_id: null, sort_order: 1 },
  { id: 'mock-phy', name: 'Physics', type: 'root', exam_type: 'NEET', parent_id: null, subject_node_id: null, sort_order: 2 },
  { id: 'mock-chy', name: 'Chemistry', type: 'root', exam_type: 'NEET', parent_id: null, subject_node_id: null, sort_order: 3 },
  // JEE Root
  { id: 'mock-jee-phy', name: 'Physics', type: 'root', exam_type: 'JEE', parent_id: null, subject_node_id: null, sort_order: 1 },
  { id: 'mock-jee-chy', name: 'Chemistry', type: 'root', exam_type: 'JEE', parent_id: null, subject_node_id: null, sort_order: 2 },
  { id: 'mock-jee-mat', name: 'Mathematics', type: 'root', exam_type: 'JEE', parent_id: null, subject_node_id: null, sort_order: 3 },
  // CUET Root
  { id: 'mock-cuet-eng', name: 'English Language', type: 'root', exam_type: 'CUET', parent_id: null, subject_node_id: null, sort_order: 1 },
  { id: 'mock-cuet-gen', name: 'General Test', type: 'root', exam_type: 'CUET', parent_id: null, subject_node_id: null, sort_order: 2 },
  { id: 'mock-cuet-bio', name: 'Biology (Domain)', type: 'root', exam_type: 'CUET', parent_id: null, subject_node_id: null, sort_order: 3 },
  // Chapters
  { id: 'mock-bio-1', name: 'The Living World', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-bio', subject_node_id: null, sort_order: 0 },
  { id: 'mock-bio-1-1', name: 'What is Living?', type: 'topic', exam_type: 'NEET', parent_id: 'mock-bio-1', subject_node_id: null, sort_order: 1 },
  { id: 'mock-bio-1-2', name: 'Taxonomic Categories', type: 'topic', exam_type: 'NEET', parent_id: 'mock-bio-1', subject_node_id: null, sort_order: 2 },
  { id: 'mock-cell', name: 'Cell: The Unit of Life', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-bio', subject_node_id: null, sort_order: 1 },
  { id: 'mock-cell-1', name: 'Cell Membrane and Wall', type: 'topic', exam_type: 'NEET', parent_id: 'mock-cell', subject_node_id: null, sort_order: 1 },
  { id: 'mock-cell-2', name: 'Cytoplasm and Nucleus', type: 'topic', exam_type: 'NEET', parent_id: 'mock-cell', subject_node_id: null, sort_order: 2 },
  { id: 'mock-gen', name: 'Genetics', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-bio', subject_node_id: null, sort_order: 2 },
  { id: 'mock-kin', name: 'Kinematics', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-phy', subject_node_id: null, sort_order: 1 },
  { id: 'mock-kin-1', name: 'Motion in 1D', type: 'topic', exam_type: 'NEET', parent_id: 'mock-kin', subject_node_id: null, sort_order: 1 },
  { id: 'mock-cal', name: 'Calculus', type: 'chapter', exam_type: 'JEE', parent_id: 'mock-jee-mat', subject_node_id: null, sort_order: 1 }
];

export const useLearningEngine = (examType: string) => {
  const [nodes, setNodes] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async (parentId: string | null = null) => {
    setLoading(true);
    try {
      // 1. Fetch the nodes
      let query = supabase
        .from('learning_nodes')
        .select('*') // Includes 'keywords' from migration
        .eq('exam_type', examType)
        .order('sort_order', { ascending: true });
      
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error: fetchErr } = await query;
      
      if (fetchErr) throw fetchErr;

      // 2. Fetch Intelligence Scores for these nodes
      const { data: { user } } = await supabase.auth.getUser();
      const nodeIds = (data || []).map(n => n.id);
      
      let scores: any[] = [];
      if (user && nodeIds.length > 0) {
        const { data: intelData } = await supabase
          .from('v_user_node_intelligence' as any)
          .select('*')
          .eq('user_id', user.id)
          .in('node_id', nodeIds);
        scores = intelData || [];
      }

      // Merge scores into nodes
      const nodesWithIntel = (data || []).map(node => {
        const intel = scores.find(s => s.node_id === node.id);
        return {
          ...node,
          weak_score: intel?.weak_score ?? null,
          total_attempts: intel?.total_attempts ?? 0,
          last_attempted_at: intel?.last_attempted_at ?? null,
        };
      });

      return nodesWithIntel as LearningNode[];
    } catch (err: any) {
      console.error("[LearningEngine] Error:", err);
      return MOCK_NODES.filter(n => n.exam_type === examType && n.parent_id === parentId);
    } finally {
      setLoading(false);
    }
  };

  // Semantic Search Helper: Returns nodes matching title OR keywords
  const searchSemantic = async (queryTerm: string) => {
    if (!queryTerm) return [];
    try {
      const { data, error } = await supabase
        .from('learning_nodes')
        .select('*')
        .eq('exam_type', examType)
        .or(`name.ilike.%${queryTerm}%,keywords.cs.{${queryTerm.toLowerCase()}}`)
        .limit(20);
      
      if (error) throw error;
      return data as LearningNode[];
    } catch (e) {
      return [];
    }
  };

  const fetchAllChildren = async (parentId: string) => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('learning_nodes')
        .select('*')
        .eq('parent_id', parentId)
        .order('sort_order', { ascending: true });
      
      if (fetchErr && fetchErr.code === '42P01') {
        return MOCK_NODES.filter(n => n.parent_id === parentId) as LearningNode[];
      }
      return data as LearningNode[];
    } catch {
      return MOCK_NODES.filter(n => n.parent_id === parentId) as LearningNode[];
    }
  };

  return {
    fetchNodes,
    fetchAllChildren,
    loading,
    error
  };
};
