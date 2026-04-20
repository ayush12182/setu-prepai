-- DETERMINISTIC SYLLABUS REBUILD
-- This migration uses fixed UUIDs to guarantee parent-child linkage across all environments

-- 1. CLEANUP (Keep roots, wipe children to prevent duplicates/ghost nodes)
DELETE FROM public.learning_nodes WHERE type != 'root';

-- 2. BIOLOGY (NEET)
-- Root: b1010101-b101-b101-b101-b10101010101

-- Chapters
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('b101-chap-001', 'The Living World', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 1),
('b101-chap-002', 'Biological Classification', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 2),
('b101-chap-003', 'Plant Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 3),
('b101-chap-004', 'Animal Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 4);

-- The Living World -> Topics (Level 3)
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('b101-top-001-001', 'What is Living?', 'topic', 'NEET', 'b101-chap-001', 1),
('b101-top-001-002', 'Taxonomy & Systematics', 'topic', 'NEET', 'b101-chap-001', 2),
('b101-top-001-003', 'Binomial Nomenclature', 'topic', 'NEET', 'b101-chap-001', 3),
('b101-top-001-004', 'Taxonomic Categories', 'topic', 'NEET', 'b101-chap-001', 4);

-- What is Living? -> Sub-topics (Level 4: Micro-concepts)
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order, keywords) VALUES
('b101-sub-001-001-001', 'Defining Features of Life', 'subtopic', 'NEET', 'b101-top-001-001', 1, ARRAY['metabolism', 'consciousness']),
('b101-sub-001-001-002', 'Growth & Reproduction', 'subtopic', 'NEET', 'b101-top-001-001', 2, ARRAY['extrinsic growth', 'sterile']);

-- Taxonomic Categories -> Sub-topics (Level 4)
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order, keywords) VALUES
('b101-sub-001-004-001', 'Hierarchy (Kingdom to Species)', 'subtopic', 'NEET', 'b101-top-001-004', 1, ARRAY['classification hierarchy']),
('b101-sub-001-004-002', 'Taxonomical Aids', 'subtopic', 'NEET', 'b101-top-001-004', 2, ARRAY['herbarium', 'museum', 'zoological parks']);

-- Biological Classification -> Topics (Level 3)
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('b101-top-002-001', 'Kingdom Monera', 'topic', 'NEET', 'b101-chap-002', 1),
('b101-top-002-002', 'Kingdom Protista', 'topic', 'NEET', 'b101-chap-002', 2),
('b101-top-002-003', 'Kingdom Fungi', 'topic', 'NEET', 'b101-chap-002', 3),
('b101-top-002-004', 'Viruses and Lichens', 'topic', 'NEET', 'b101-chap-002', 4);


-- 3. PHYSICS (NEET)
-- Root: p1010101-p101-p101-p101-p10101010101
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('p101-chap-001', 'Units and Measurements', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 1),
('p101-chap-002', 'Motion in a Straight Line', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 2);

-- Units -> Topics
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('p101-top-001-001', 'Errors in Measurement', 'topic', 'NEET', 'p101-chap-001', 1),
('p101-top-001-002', 'Significant Figures', 'topic', 'NEET', 'p101-chap-001', 2),
('p101-top-001-003', 'Dimensional Analysis', 'topic', 'NEET', 'p101-chap-001', 3);


-- 4. CHEMISTRY (NEET)
-- Root: c1010101-c101-c101-c101-c10101010101
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('c101-chap-001', 'Chemical Bonding', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 1),
('c101-chap-002', 'Organic Chemistry Basics', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 2);

-- Chemical Bonding -> Topics
INSERT INTO public.learning_nodes (id, name, type, exam_type, parent_id, sort_order) VALUES
('c101-top-001-001', 'VSEPR Theory', 'topic', 'NEET', 'c101-chap-001', 1),
('c101-top-001-002', 'Hybridization', 'topic', 'NEET', 'c101-chap-001', 2),
('c101-top-001-003', 'Molecular Orbital Theory', 'topic', 'NEET', 'c101-chap-001', 3);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
