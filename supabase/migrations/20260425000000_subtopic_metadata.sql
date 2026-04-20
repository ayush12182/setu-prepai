-- SUBTOPIC AI METADATA EXPANSION
-- Adds intelligence metadata for AI-generated curriculum trees

ALTER TABLE public.learning_nodes
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS weightage_estimate TEXT CHECK (weightage_estimate IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS concept_type TEXT CHECK (concept_type IN ('theoretical', 'numerical', 'mixed', 'memory-based')),
  ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS prerequisites UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS common_mistakes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expected_question_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS microtopic_tags TEXT[] DEFAULT '{}';

-- Indices for mode filtering
CREATE INDEX IF NOT EXISTS idx_ln_weightage ON public.learning_nodes(weightage_estimate, exam_type);
CREATE INDEX IF NOT EXISTS idx_ln_difficulty ON public.learning_nodes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_ln_ai_generated ON public.learning_nodes(ai_generated, parent_id);

-- RPC: Survival mode — high-weightage nodes + user's weak areas
CREATE OR REPLACE FUNCTION get_survival_nodes(
  p_user_id UUID,
  p_exam_type TEXT,
  p_subject TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID, parent_id UUID, name TEXT, type TEXT, exam_type TEXT,
  difficulty_level TEXT, weightage_estimate TEXT, concept_type TEXT,
  weak_score FLOAT, total_attempts BIGINT, last_attempted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id, n.parent_id, n.name, n.type, n.exam_type,
    n.difficulty_level, n.weightage_estimate, n.concept_type,
    COALESCE(i.weak_score, 0.5)::FLOAT        AS weak_score,
    COALESCE(i.total_attempts, 0)::BIGINT      AS total_attempts,
    i.last_attempted_at
  FROM public.learning_nodes n
  LEFT JOIN public.v_user_node_intelligence i
    ON i.node_id = n.id AND i.user_id = p_user_id
  WHERE
    n.exam_type = p_exam_type
    AND n.type IN ('topic', 'subtopic')
    AND (
      n.weightage_estimate = 'high'
      OR COALESCE(i.weak_score, 1.0) < 0.6
    )
    AND (p_subject = '' OR n.name ILIKE '%' || p_subject || '%')
  ORDER BY
    COALESCE(i.weak_score, 1.0) ASC,
    n.weightage_estimate DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Continue Mission — next unvisited prerequisite node
CREATE OR REPLACE FUNCTION get_next_mission_node(
  p_user_id UUID,
  p_exam_type TEXT
)
RETURNS TABLE (
  id UUID, name TEXT, type TEXT, difficulty_level TEXT,
  weightage_estimate TEXT, parent_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id, n.name, n.type, n.difficulty_level,
    n.weightage_estimate, n.parent_id
  FROM public.learning_nodes n
  LEFT JOIN public.v_user_node_intelligence i
    ON i.node_id = n.id AND i.user_id = p_user_id
  WHERE
    n.exam_type = p_exam_type
    AND n.type = 'topic'
    AND i.node_id IS NULL  -- never attempted
  ORDER BY n.sort_order ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
