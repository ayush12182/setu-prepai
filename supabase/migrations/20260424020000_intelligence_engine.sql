-- SETU Intelligence Layer: Database Foundation
-- This migration implements semantic search and weighted intelligence scoring

-- 1. EXTEND LEARNING NODES FOR SEMANTIC SEARCH
ALTER TABLE public.learning_nodes 
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS related_concepts TEXT[] DEFAULT '{}';

-- 2. ENSURE ATTEMPTS TABLE HAS NODE CONTEXT (FOR AGGREGATION)
-- Note: Re-using user_mcq_attempts if it exists, otherwise creating it
CREATE TABLE IF NOT EXISTS public.user_mcq_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    question_id UUID,
    node_id UUID REFERENCES public.learning_nodes(id),
    is_correct BOOLEAN NOT NULL,
    time_taken_ms INTEGER,
    confidence_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. THE "INTELLIGENCE" FUNCTION: Weighted Recency Accuracy
-- This function calculates a score where recent attempts matter more.
-- Latest attempt = 1.0 weight, Decreases for older ones.
CREATE OR REPLACE FUNCTION calculate_weighted_accuracy(p_user_id UUID, p_node_id UUID)
RETURNS FLOAT AS $$
DECLARE
    score FLOAT := 0.0;
    total_weight FLOAT := 0.0;
    current_weight FLOAT := 1.0;
    attempt RECORD;
    count INTEGER := 0;
BEGIN
    -- Fetch last 10 attempts for this node (topic/chapter)
    FOR attempt IN (
        SELECT is_correct 
        FROM user_mcq_attempts 
        WHERE user_id = p_user_id AND node_id = p_node_id
        ORDER BY created_at DESC 
        LIMIT 10
    ) LOOP
        score := score + (CASE WHEN attempt.is_correct THEN 1.0 ELSE 0.0 END * current_weight);
        total_weight := total_weight + current_weight;
        
        -- Decay weight for older attempts
        current_weight := current_weight * 0.7;
        count := count + 1;
    END LOOP;

    IF total_weight = 0 THEN RETURN NULL; END IF;
    RETURN score / total_weight;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. REAL-TIME INTELLIGENCE VIEW
CREATE OR REPLACE VIEW v_user_node_intelligence AS
SELECT 
    user_id,
    node_id,
    calculate_weighted_accuracy(user_id, node_id) as weak_score,
    COUNT(*) as total_attempts,
    MAX(created_at) as last_attempted_at
FROM 
    user_mcq_attempts
GROUP BY 
    user_id, node_id;

-- 5. SEEDING SOME KEYWORDS FOR DEMO
UPDATE learning_nodes SET keywords = ARRAY['mitochondria', 'cell powerhouse', 'respiration', 'atp'] WHERE name ILIKE '%Cell%';
UPDATE learning_nodes SET keywords = ARRAY['taxonomic', 'linnaeus', 'nomenclature', 'classification'] WHERE name ILIKE '%Living World%';
UPDATE learning_nodes SET keywords = ARRAY['differentiation', 'calculus', 'derivatives', 'rate of change'] WHERE name ILIKE '%Differentiation%';

-- Notify schema change
NOTIFY pgrst, 'reload schema';
