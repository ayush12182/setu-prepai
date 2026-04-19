import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/hooks/usePracticeQuestions';

export const generateQuestionsForNode = async (
  nodeId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10,
  exam: string = 'JEE'
) => {
  console.log(`[AssessmentEngine] Generating questions for node: ${nodeId}, difficulty: ${difficulty}`);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // NEW ASSESSMENT-DRIVEN RPC
    // This RPC will look for questions tagged with this nodeId (or its children)
    const { data: rawQuestions, error } = await supabase.rpc('get_assessment_questions', {
      p_node_id: nodeId,
      p_difficulty: difficulty,
      p_count: count,
      p_exam: exam
    });

    if (error) throw error;

    if (!rawQuestions || rawQuestions.length === 0) {
      console.warn("No questions found in assessment bank, falling back to legacy bank");
      // Fallback logic could go here
      return [];
    }

    return rawQuestions;
  } catch (err) {
    console.error("Question generation failed:", err);
    throw err;
  }
};
