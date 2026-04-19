-- Syllabus Expansion: Adding Topics to Chapters
-- This migration ensures that Chapters have child nodes of type 'topic'

-- 1. BIOLOGY TOPICS
-- Cell Cycle and Cell Division
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Cell Cycle Phases', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Cell Cycle and Cell Division' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'M Phase (Mitosis)', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Cell Cycle and Cell Division' LIMIT 1
ON CONFLICT DO NOTHING;

-- Biological Classification
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kingdom Monera', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Biological Classification' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kingdom Protista', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Biological Classification' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kingdom Fungi', 'topic', 'NEET', id, 3 FROM learning_nodes WHERE name = 'Biological Classification' LIMIT 1
ON CONFLICT DO NOTHING;

-- 2. PHYSICS TOPICS
-- Units and Measurements
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'SI Units', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Units and Measurements' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Significant Figures', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Units and Measurements' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Errors in Measurement', 'topic', 'NEET', id, 3 FROM learning_nodes WHERE name = 'Units and Measurements' LIMIT 1
ON CONFLICT DO NOTHING;

-- Motion in a Straight Line
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Instantaneous Velocity', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Motion in a Straight Line' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Kinematic Equations', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Motion in a Straight Line' LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. CHEMISTRY TOPICS
-- Chemical Bonding
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Ionic Bonding', 'topic', 'NEET', id, 1 FROM learning_nodes WHERE name = 'Chemical Bonding and Molecular Structure' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'VSEPR Theory', 'topic', 'NEET', id, 2 FROM learning_nodes WHERE name = 'Chemical Bonding and Molecular Structure' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order)
SELECT 'Hybridization', 'topic', 'NEET', id, 3 FROM learning_nodes WHERE name = 'Chemical Bonding and Molecular Structure' LIMIT 1
ON CONFLICT DO NOTHING;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
