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

      const { data, error } = await query;
      if (error) throw error;
      return data as LearningNode[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChildren = async (parentId: string) => {
    // This is useful for building the whole tree if needed
    const { data, error } = await supabase
      .from('learning_nodes')
      .select('*')
      .eq('parent_id', parentId)
      .order('sort_order', { ascending: true });
    return data as LearningNode[];
  };

  return {
    fetchNodes,
    fetchAllChildren,
    loading,
    error
  };
};
