-- Sub-Topic Expansion for NEET and JEE
-- This migration adds detailed topics under each major chapter

-- 1. PHYSICS TOPICS
DO $$
DECLARE
    kinematics_id UUID;
    lom_id UUID;
    thermo_id UUID;
BEGIN
    SELECT id INTO kinematics_id FROM learning_nodes WHERE name = 'Kinematics' AND exam_type = 'NEET' LIMIT 1;
    IF kinematics_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
        ('Frame of Reference & Straight Line', 'topic', 'NEET', kinematics_id, 1),
        ('Velocity and Acceleration', 'topic', 'NEET', kinematics_id, 2),
        ('Projectile Motion', 'topic', 'NEET', kinematics_id, 3),
        ('Relative Velocity', 'topic', 'NEET', kinematics_id, 4);
    END IF;

    SELECT id INTO lom_id FROM learning_nodes WHERE name = 'Laws of Motion' AND exam_type = 'NEET' LIMIT 1;
    IF lom_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
        ('Newton''s Three Laws', 'topic', 'NEET', lom_id, 1),
        ('Inertia and Momentum', 'topic', 'NEET', lom_id, 2),
        ('Friction & Lubrication', 'topic', 'NEET', lom_id, 3),
        ('Circular Motion Dynamics', 'topic', 'NEET', lom_id, 4);
    END IF;
END $$;

-- 2. BIOLOGY TOPICS
DO $$
DECLARE
    cell_id UUID;
    genetics_id UUID;
BEGIN
    SELECT id INTO cell_id FROM learning_nodes WHERE name = 'Cell: The Unit of Life' AND exam_type = 'NEET' LIMIT 1;
    IF cell_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
        ('Cell Overview & Theory', 'topic', 'NEET', cell_id, 1),
        ('Prokaryotic vs Eukaryotic', 'topic', 'NEET', cell_id, 2),
        ('Endomembrane System', 'topic', 'NEET', cell_id, 3),
        ('Mitochondria, Plastids & Ribosomes', 'topic', 'NEET', cell_id, 4);
    END IF;

    SELECT id INTO genetics_id FROM learning_nodes WHERE name = 'Genetics and Evolution' AND exam_type = 'NEET' LIMIT 1;
    IF genetics_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
        ('Mendel''s Laws of Inheritance', 'topic', 'NEET', genetics_id, 1),
        ('Chromosomal Theory', 'topic', 'NEET', genetics_id, 2),
        ('DNA Replication & Genetic Code', 'topic', 'NEET', genetics_id, 3),
        ('Adaptive Radiation & Evolution', 'topic', 'NEET', genetics_id, 4);
    END IF;
END $$;

-- 3. CHEMISTRY TOPICS
DO $$
DECLARE
    organic_id UUID;
BEGIN
    SELECT id INTO organic_id FROM learning_nodes WHERE name = 'Organic Chemistry: Basic Principles' AND exam_type = 'NEET' LIMIT 1;
    IF organic_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
        ('IUPAC Nomenclature', 'topic', 'NEET', organic_id, 1),
        ('Isomerism', 'topic', 'NEET', organic_id, 2),
        ('Inductive & Resonance Effects', 'topic', 'NEET', organic_id, 3),
        ('Reaction Mechanisms', 'topic', 'NEET', organic_id, 4);
    END IF;
END $$;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
