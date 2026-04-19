import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LearningNode {
  id: string;
  parent_id: string | null;
  name: string;
  type: 'root' | 'chapter' | 'topic' | 'subtopic';
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
  { id: 'mock-cell', name: 'Cell: The Unit of Life', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-bio', subject_node_id: null, sort_order: 1 },
  { id: 'mock-gen', name: 'Genetics', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-bio', subject_node_id: null, sort_order: 2 },
  { id: 'mock-kin', name: 'Kinematics', type: 'chapter', exam_type: 'NEET', parent_id: 'mock-phy', subject_node_id: null, sort_order: 1 },
  { id: 'mock-cal', name: 'Calculus', type: 'chapter', exam_type: 'JEE', parent_id: 'mock-jee-mat', subject_node_id: null, sort_order: 1 }
];

export const useLearningEngine = (examType: string) => {
  const [nodes, setNodes] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async (parentId: string | null = null) => {
    setLoading(true);
    try {
      let query = supabase
        .from('learning_nodes')
        .select('*')
        .eq('exam_type', examType)
        .order('sort_order', { ascending: true });
      
      if (parentId) {
        query = query.eq('parent_id', parentId);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error: fetchErr } = await query;
      
      if (fetchErr) {
        // FALLBACK: If table doesn't exist (42P01), use mock data
        if (fetchErr.code === '42P01') {
          console.warn("[LearningEngine] Table missing, using local fallback nodes.");
          return MOCK_NODES.filter(n => n.exam_type === examType && n.parent_id === parentId) as LearningNode[];
        }
        throw fetchErr;
      }
      return data as LearningNode[];
    } catch (err: any) {
      console.error("[LearningEngine] Error:", err);
      // Last-ditch local fallback
      return MOCK_NODES.filter(n => n.exam_type === examType && n.parent_id === parentId) as LearningNode[];
    } finally {
      setLoading(false);
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
