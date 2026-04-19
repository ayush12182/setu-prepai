-- Syllabus Expansion: Comprehensive Topic Load
-- This migration ensures major chapters have children of type 'topic'

-- 1. THE LIVING WORLD (First Chapter)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'What is Living?', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'The Living World' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Diversity in the Living World', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'The Living World' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Taxonomic Categories', 'topic', 'NEET', id, 3 FROM learning_nodes WHERE name = 'The Living World' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Taxonomical Aids (Herbarium, Museum)', 'topic', 'NEET', id, 4 FROM learning_nodes WHERE name = 'The Living World' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

-- 2. BIOLOGICAL CLASSIFICATION
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kingdom Monera & Protista', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Biological Classification' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kingdom Fungi', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Biological Classification' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. CELL CYCLE AND CELL DIVISION
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Interphase & Mitosis', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Cell Cycle and Cell Division' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Meiosis I & II', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Cell Cycle and Cell Division' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. UNITS AND MEASUREMENTS
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Dimensions & Dimensional Analysis', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Units and Measurements' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Errors & Significant Figures', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Units and Measurements' AND exam_type = 'NEET' LIMIT 1
ON CONFLICT DO NOTHING;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
