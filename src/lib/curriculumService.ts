import { supabase } from '@/integrations/supabase/client';
import type { LearningNode } from '@/hooks/useLearningEngine';

export interface SubtopicTree {
  cached: boolean;
  topics: LearningNode[];
  microtopics: LearningNode[];
}

export interface SurvivalNode extends LearningNode {
  weak_score: number;
  total_attempts: number;
  last_attempted_at: string | null;
}

export const generateSubtopics = async (
  subject: string,
  chapter: string,
  exam: string,
  chapterNodeId: string
): Promise<SubtopicTree> => {
  const { data, error } = await supabase.functions.invoke('generate-subtopics', {
    body: { subject, chapter, exam, chapter_node_id: chapterNodeId },
  });
  if (error) throw new Error(error.message);
  return data as SubtopicTree;
};

export const getWeakNodes = async (userId: string, examType: string): Promise<LearningNode[]> => {
  const { data, error } = await (supabase as any)
    .from('v_user_node_intelligence')
    .select('node_id, weak_score, total_attempts, last_attempted_at')
    .eq('user_id', userId)
    .lt('weak_score', 0.6)
    .order('weak_score', { ascending: true })
    .limit(10);

  if (error || !data) return [];

  const nodeIds = data.map((r: any) => r.node_id);
  if (!nodeIds.length) return [];

  const { data: nodes } = await supabase
    .from('learning_nodes')
    .select('*')
    .in('id', nodeIds);

  if (!nodes) return [];

  return nodes.map((n) => {
    const intel = data.find((r: any) => r.node_id === n.id);
    return { ...n, weak_score: intel?.weak_score, total_attempts: intel?.total_attempts, last_attempted_at: intel?.last_attempted_at } as LearningNode;
  });
};

export const getSurvivalNodes = async (
  userId: string,
  examType: string,
  subject = ''
): Promise<SurvivalNode[]> => {
  const { data, error } = await (supabase as any).rpc('get_survival_nodes', {
    p_user_id: userId,
    p_exam_type: examType,
    p_subject: subject,
  });
  if (error || !data) return [];
  return data as SurvivalNode[];
};

export const getNextMissionNode = async (
  userId: string,
  examType: string
): Promise<LearningNode | null> => {
  const { data, error } = await (supabase as any).rpc('get_next_mission_node', {
    p_user_id: userId,
    p_exam_type: examType,
  });
  if (error || !data?.length) return null;
  return data[0] as LearningNode;
};
