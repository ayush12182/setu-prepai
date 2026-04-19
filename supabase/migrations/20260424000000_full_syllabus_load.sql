-- Full Syllabus Load for NEET, JEE, and CUET
-- This migration populates the learning_nodes table with fixed UUIDs for roots

-- 0. INITIAL ROOTS (The anchors for everything else)
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('b1010101-b101-b101-b101-b10101010101', 'Biology', 'root', 'NEET', NULL, 1),
('p1010101-p101-p101-p101-p10101010101', 'Physics', 'root', 'NEET', NULL, 2),
('c1010101-c101-c101-c101-c10101010101', 'Chemistry', 'root', 'NEET', NULL, 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 1. BIOLOGY (NEET) - Parent: Biology Root
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('The Living World', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 5),
('Biological Classification', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 6),
('Plant Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 7),
('Animal Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 8),
('Cell Cycle and Cell Division', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 13),
('Molecular Basis of Inheritance', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 27)
ON CONFLICT DO NOTHING;

-- 2. PHYSICS (NEET) - Parent: Physics Root
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Units and Measurements', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 4),
('Motion in a Straight Line', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 5),
('Motion in a Plane', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 6),
('Work, Energy and Power', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 7)
ON CONFLICT DO NOTHING;

-- 3. CHEMISTRY (NEET) - Parent: Chemistry Root
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Chemical Bonding and Molecular Structure', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 4),
('Organic Chemistry: Basic Principles', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 8)
ON CONFLICT DO NOTHING;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
