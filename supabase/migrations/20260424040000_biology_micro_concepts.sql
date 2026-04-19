-- MICRO-CONCEPT EXPANSION: BIOLOGY (THE LIVING WORLD)
-- This migration adds a 4th level (Concept) to the Knowledge Tree

-- 1. UPGRADE SCHEMA CONSTRAINTS
ALTER TABLE public.learning_nodes DROP CONSTRAINT IF EXISTS learning_nodes_type_check;
ALTER TABLE public.learning_nodes ADD CONSTRAINT learning_nodes_type_check 
CHECK (type IN ('root', 'chapter', 'topic', 'subtopic', 'concept'));

-- 2. DATA INJECTION
DO $$
DECLARE
    chapter_id UUID;
    topic_id UUID;
BEGIN
    -- Locate parent chapter
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'The Living World' AND type = 'chapter' LIMIT 1;
    
    IF chapter_id IS NOT NULL THEN
        -- SUBTOPIC 1: What is Living?
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) 
        VALUES ('What is Living?', 'topic', 'NEET', chapter_id, 1) RETURNING id INTO topic_id;
        
        -- MICRO CONCEPTS for [What is Living?]
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Defining Properties of Life', 'subtopic', 'NEET', topic_id, 1, ARRAY['metabolism', 'consciousness', 'defining features']),
        ('Growth and Reproduction (Non-Defining)', 'subtopic', 'NEET', topic_id, 2, ARRAY['extrinsic growth', 'sterile organisms']);

        -- SUBTOPIC 2: Taxonomy & Systematics
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) 
        VALUES ('Taxonomy & Systematics', 'topic', 'NEET', chapter_id, 2) RETURNING id INTO topic_id;

        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Principles of Taxonomy', 'subtopic', 'NEET', topic_id, 1, ARRAY['identification', 'nomenclature', 'classification']),
        ('Systematics and Phylogeny', 'subtopic', 'NEET', topic_id, 2, ARRAY['evolutionary relationships', 'systema naturae']);

        -- SUBTOPIC 3: Binomial Nomenclature
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) 
        VALUES ('Binomial Nomenclature', 'topic', 'NEET', chapter_id, 3) RETURNING id INTO topic_id;

        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Rules of IUPAC/ICBN', 'subtopic', 'NEET', topic_id, 1, ARRAY['latin names', 'italicized', 'generic name']),
        ('Linnaean Naming Framework', 'subtopic', 'NEET', topic_id, 2, ARRAY['specific epithet', 'carl linnaeus']);

        -- SUBTOPIC 4: Taxonomic Categories
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) 
        VALUES ('Taxonomic Categories', 'topic', 'NEET', chapter_id, 4) RETURNING id INTO topic_id;

        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('The Taxonomic Hierarchy', 'subtopic', 'NEET', topic_id, 1, ARRAY['kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species']),
        ('Unit of Classification', 'subtopic', 'NEET', topic_id, 2, ARRAY['species basics']);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
