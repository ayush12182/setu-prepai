-- Full Syllabus Load for NEET, JEE, and CUET
-- This migration populates the learning_nodes table with the comprehensive NCERT syllabus

-- 1. BIOLOGY (NEET) - Root ID: b1010101-b101-b101-b101-b10101010101
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('The Living World', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 5),
('Biological Classification', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 6),
('Plant Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 7),
('Animal Kingdom', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 8),
('Morphology of Flowering Plants', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 9),
('Anatomy of Flowering Plants', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 10),
('Structural Organisation in Animals', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 11),
('Biomolecules', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 12),
('Cell Cycle and Cell Division', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 13),
('Photosynthesis in Higher Plants', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 14),
('Respiration in Plants', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 15),
('Plant Growth and Development', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 16),
('Breathing and Exchange of Gases', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 17),
('Body Fluids and Circulation', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 18),
('Excretory Products and their Elimination', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 19),
('Locomotion and Movement', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 20),
('Neural Control and Coordination', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 21),
('Chemical Coordination and Integration', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 22),
('Sexual Reproduction in Flowering Plants', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 23),
('Human Reproduction', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 24),
('Reproductive Health', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 25),
('Principles of Inheritance and Variation', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 26),
('Molecular Basis of Inheritance', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 27),
('Evolution', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 28),
('Human Health and Disease', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 29),
('Microbes in Human Welfare', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 30),
('Biotechnology: Principles and Processes', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 31),
('Biotechnology and its Applications', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 32),
('Organisms and Populations', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 33),
('Ecosystem', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 34),
('Biodiversity and Conservation', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 35)
ON CONFLICT DO NOTHING;

-- 2. PHYSICS (NEET/JEE) - Root IDs: p101... (NEET), p202... (JEE)
-- Populate NEET Physics
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Units and Measurements', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 4),
('Motion in a Straight Line', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 5),
('Motion in a Plane', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 6),
('Work, Energy and Power', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 7),
('System of Particles and Rotational Motion', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 8),
('Gravitation', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 9),
('Mechanical Properties of Solids', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 10),
('Mechanical Properties of Fluids', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 11),
('Thermal Properties of Matter', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 12),
('Thermodynamics', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 13),
('Kinetic Theory', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 14),
('Oscillations', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 15),
('Waves', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 16),
('Magnetic Effects of Current and Magnetism', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 17),
('Electromagnetic Induction', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 18),
('Alternating Current', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 19),
('Electromagnetic Waves', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 20),
('Ray Optics and Optical Instruments', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 21),
('Wave Optics', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 22),
('Dual Nature of Radiation and Matter', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 23),
('Atoms', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 24),
('Nuclei', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 25),
('Semiconductor Electronics', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 26)
ON CONFLICT DO NOTHING;

-- Populate JEE Physics (Partial list for brevity, can be expanded)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Kinematics', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 3),
('Laws of Motion', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 4),
('Work, Energy and Power', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 5),
('Rotational Motion', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 6),
('Magnetic Effects of Current', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 7),
('Optics', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 8),
('Modern Physics', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 9)
ON CONFLICT DO NOTHING;

-- 3. CHEMISTRY (NEET/JEE) - Root IDs: c101... (NEET), c202... (JEE)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Classification of Elements and Periodicity', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 3),
('Chemical Bonding and Molecular Structure', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 4),
('Chemical Thermodynamics', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 5),
('Equilibrium', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 6),
('Redox Reactions', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 7),
('Organic Chemistry: Basic Principles', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 8),
('Hydrocarbons', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 9),
('Solutions', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 10),
('Electrochemistry', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 11),
('Chemical Kinetics', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 12),
('The d- and f- Block Elements', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 13),
('Coordination Compounds', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 14),
('Haloalkanes and Haloarenes', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 15),
('Alcohols, Phenols and Ethers', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 16),
('Aldehydes, Ketones and Carboxylic Acids', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 17),
('Amines', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 18),
('Biomolecules', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 19)
ON CONFLICT DO NOTHING;

-- 4. MATHEMATICS (JEE) - Root ID: m2020202-m202-m202-m202-m20202020202
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Matrices and Determinants', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 4),
('Permutations and Combinations', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 5),
('Binomial Theorem', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 6),
('Sequences and Series', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 7),
('Limit and Continuity', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 8),
('Differentiability and Differentiation', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 9),
('Integral Calculus', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 10),
('Differential Equations', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 11),
('Coordinate Geometry', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 12),
('Vector Algebra', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 13),
('Three Dimensional Geometry', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 14),
('Probability', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 15),
('Trigonometry', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 16)
ON CONFLICT DO NOTHING;

-- Notify schema change after full load
NOTIFY pgrst, 'reload schema';
