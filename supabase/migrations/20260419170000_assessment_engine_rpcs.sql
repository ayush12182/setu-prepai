-- Assessment Engine RPCs
-- Supports recursive question lookup based on the node hierarchy

CREATE OR REPLACE FUNCTION get_assessment_questions(
    p_node_id UUID,
    p_difficulty TEXT,
    p_count INTEGER,
    p_exam TEXT
)
RETURNS TABLE (
    id UUID,
    topic_id UUID,
    question_type TEXT,
    content JSONB,
    answer JSONB,
    metadata JSONB,
    difficulty TEXT,
    exam_type TEXT
) AS $$
DECLARE
    node_ids UUID[];
BEGIN
    -- 1. Get all child nodes recursively
    WITH RECURSIVE node_tree AS (
        SELECT id FROM learning_nodes WHERE id = p_node_id
        UNION ALL
        SELECT ln.id FROM learning_nodes ln
        JOIN node_tree nt ON ln.parent_id = nt.id
    )
    SELECT ARRAY_AGG(id) INTO node_ids FROM node_tree;

    -- 2. Fetch questions mapped to any of these nodes
    RETURN QUERY
    SELECT 
        q.id,
        q.topic_id,
        q.question_type,
        q.content,
        q.answer,
        q.metadata,
        q.difficulty,
        q.exam_type
    FROM questions q
    WHERE 
        q.topic_id = ANY(node_ids)
        AND (p_difficulty = 'mixed' OR q.difficulty = p_difficulty)
        AND q.exam_type = p_exam
    ORDER BY RANDOM()
    LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
