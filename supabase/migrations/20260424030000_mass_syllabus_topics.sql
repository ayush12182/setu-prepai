-- MASS SYLLABUS TOPICS LOAD
-- Adds sub-topics for each major NEET chapter

DO $$
DECLARE
    chapter_id UUID;
BEGIN
    -- ==========================================
    -- 1. BIOLOGY TOPICS
    -- ==========================================
    
    -- THE LIVING WORLD
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'The Living World' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('What is Living?', 'topic', 'NEET', chapter_id, 1, ARRAY['growth', 'reproduction', 'metabolism']),
        ('Binomial Nomenclature', 'topic', 'NEET', chapter_id, 2, ARRAY['linnaeus', 'scientific name', 'latin']),
        ('Taxonomic Categories', 'topic', 'NEET', chapter_id, 3, ARRAY['genus', 'species', 'family', 'order']);
    END IF;

    -- BIOLOGICAL CLASSIFICATION
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'Biological Classification' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Kingdom Monera', 'topic', 'NEET', chapter_id, 1, ARRAY['bacteria', 'archaebacteria', 'cyanobacteria']),
        ('Kingdom Protista', 'topic', 'NEET', chapter_id, 2, ARRAY['chrysophytes', 'dinoflagellates', 'protozoans']),
        ('Kingdom Fungi', 'topic', 'NEET', chapter_id, 3, ARRAY['mycelium', 'ascomycetes', 'basidiomycetes']),
        ('Viruses, Viroids and Lichens', 'topic', 'NEET', chapter_id, 4, ARRAY['capsid', 'prions', 'symbiotic']);
    END IF;

    -- CELL CYCLE AND CELL DIVISION
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'Cell Cycle and Cell Division' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Interphase (G1, S, G2)', 'topic', 'NEET', chapter_id, 1, ARRAY['dna replication', 'protein synthesis']),
        ('Mitosis', 'topic', 'NEET', chapter_id, 2, ARRAY['prophase', 'metaphase', 'anaphase', 'telophase']),
        ('Meiosis', 'topic', 'NEET', chapter_id, 3, ARRAY['crossing over', 'prophase i', 'genetic variation']);
    END IF;

    -- ==========================================
    -- 2. PHYSICS TOPICS
    -- ==========================================

    -- UNITS AND MEASUREMENTS
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'Units and Measurements' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('SI Units and Measurement', 'topic', 'NEET', chapter_id, 1, ARRAY['fundamental units', 'derived units']),
        ('Significant Figures and Errors', 'topic', 'NEET', chapter_id, 2, ARRAY['error analysis', 'precision', 'accuracy']),
        ('Dimensional Analysis', 'topic', 'NEET', chapter_id, 3, ARRAY['dimensional formula', 'homogeneity']);
    END IF;

    -- WORK, ENERGY AND POWER
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'Work, Energy and Power' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('Work and Kinetic Energy', 'topic', 'NEET', chapter_id, 1, ARRAY['scalar product', 'work-energy theorem']),
        ('Potential Energy and Conservation', 'topic', 'NEET', chapter_id, 2, ARRAY['conservative forces', 'mechanical energy']),
        ('Power and Collisions', 'topic', 'NEET', chapter_id, 3, ARRAY['elastic collisions', 'coefficient of restitution']);
    END IF;

    -- ==========================================
    -- 3. CHEMISTRY TOPICS
    -- ==========================================

    -- CHEMICAL BONDING
    SELECT id INTO chapter_id FROM learning_nodes WHERE name = 'Chemical Bonding and Molecular Structure' LIMIT 1;
    IF chapter_id IS NOT NULL THEN
        INSERT INTO learning_nodes (name, type, exam_type, parent_id, sort_order, keywords) VALUES
        ('VSEPR Theory', 'topic', 'NEET', chapter_id, 1, ARRAY['geometry', 'lone pair', 'molecular shape']),
        ('Valence Bond Theory and Hybridization', 'topic', 'NEET', chapter_id, 2, ARRAY['sp3', 'sp2', 'sp', 'overlap']),
        ('Molecular Orbital Theory', 'topic', 'NEET', chapter_id, 3, ARRAY['bonding mo', 'antibonding mo', 'bond order']);
    END IF;

END $$;

NOTIFY pgrst, 'reload schema';
