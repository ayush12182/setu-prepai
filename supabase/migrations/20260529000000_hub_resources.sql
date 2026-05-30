-- ══════════════════════════════════════════════════════════════════
-- PrepEntrance v2 — Exam Preparation Hub: Full Schema + Seed
-- Migration: 20260529000000_hub_resources.sql
-- ══════════════════════════════════════════════════════════════════

-- ─── 1. RESOURCE CATEGORIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT        NOT NULL UNIQUE,
  label        TEXT        NOT NULL,
  description  TEXT,
  icon         TEXT,
  color        TEXT,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. RESOURCE SUBJECTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_subjects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT        NOT NULL,
  label        TEXT        NOT NULL,
  exam         TEXT        NOT NULL CHECK (exam IN ('jee','neet','cuet')),
  icon         TEXT,
  color        TEXT,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (key, exam)
);

-- ─── 3. RESOURCES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  description      TEXT,
  exam             TEXT        NOT NULL CHECK (exam IN ('jee','neet','cuet')),
  class            TEXT        NOT NULL CHECK (class IN ('11','12','dropper')),
  subject          TEXT        NOT NULL,
  chapter          TEXT        NOT NULL,
  resource_type    TEXT        NOT NULL CHECK (resource_type IN ('notes','pyq','test','revision','ai')),
  sub_type         TEXT,
  difficulty       TEXT        CHECK (difficulty IN ('easy','medium','hard')),
  language         TEXT        DEFAULT 'english' CHECK (language IN ('english','hindi','hinglish')),
  content_url      TEXT,
  thumbnail_url    TEXT,
  file_size        TEXT,
  pages            INTEGER,
  is_premium       BOOLEAN     DEFAULT false,
  is_published     BOOLEAN     DEFAULT true,
  view_count       INTEGER     DEFAULT 0,
  download_count   INTEGER     DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. BOOKMARKS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id  UUID        NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

-- ─── 5. USER PROGRESS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id       UUID        NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  viewed_at         TIMESTAMPTZ DEFAULT now(),
  completed         BOOLEAN     DEFAULT false,
  progress_percent  INTEGER     DEFAULT 0,
  last_position     INTEGER     DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

-- ─── INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resources_exam        ON resources (exam);
CREATE INDEX IF NOT EXISTS idx_resources_class       ON resources (class);
CREATE INDEX IF NOT EXISTS idx_resources_type        ON resources (resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_subject     ON resources (subject);
CREATE INDEX IF NOT EXISTS idx_resources_exam_class  ON resources (exam, class);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user        ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user    ON user_progress (user_id);

-- ─── RLS ──────────────────────────────────────────────────────────

-- resource_categories: public read
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories"
  ON resource_categories FOR SELECT USING (true);

-- resource_subjects: public read
ALTER TABLE resource_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read subjects"
  ON resource_subjects FOR SELECT USING (true);

-- resources: public read (published only), service role can write
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published resources"
  ON resources FOR SELECT USING (is_published = true);
CREATE POLICY "service role full access resources"
  ON resources FOR ALL USING (auth.role() = 'service_role');

-- bookmarks: owner only
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_progress: owner only
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════════
-- SEED DATA
-- ══════════════════════════════════════════════════════════════════

-- ─── Categories ───────────────────────────────────────────────────
INSERT INTO resource_categories (key, label, description, icon, color, sort_order) VALUES
  ('notes',    'Notes',    'Chapter Notes, Short Notes, NCERT, Handwritten', '📘', '#3B82F6', 1),
  ('pyq',      'PYQs',     'Previous Year Questions — Chapterwise, Yearwise, Topicwise', '📑', '#F59E0B', 2),
  ('test',     'Tests',    'Chapter Tests, Subject Tests, Full-Length Mocks', '📝', '#EF4444', 3),
  ('revision', 'Revision', 'Formula Sheets, One-Shots, Mind Maps, Quick Revision PDFs', '⚡', '#8B5CF6', 4)
ON CONFLICT (key) DO NOTHING;

-- ─── Subjects ─────────────────────────────────────────────────────
INSERT INTO resource_subjects (key, label, exam, icon, color, sort_order) VALUES
  ('physics',     'Physics',     'jee',  '⚛️',  '#3B82F6', 1),
  ('chemistry',   'Chemistry',   'jee',  '🧪',  '#10B981', 2),
  ('maths',       'Mathematics', 'jee',  '📐',  '#8B5CF6', 3),
  ('physics',     'Physics',     'neet', '⚛️',  '#3B82F6', 1),
  ('chemistry',   'Chemistry',   'neet', '🧪',  '#10B981', 2),
  ('botany',      'Botany',      'neet', '🌿',  '#22C55E', 3),
  ('zoology',     'Zoology',     'neet', '🦁',  '#F59E0B', 4),
  ('english',     'English',     'cuet', '📖',  '#3B82F6', 1),
  ('general',     'General Test','cuet', '🧠',  '#8B5CF6', 2),
  ('domain',      'Domain Subj', 'cuet', '📚',  '#F59E0B', 3)
ON CONFLICT (key, exam) DO NOTHING;

-- ─── Resources — JEE Class 11 ─────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Kinematics — Complete Chapter Notes', 'Motion in 1D & 2D, relative motion, projectile. Kota-style derivations with all proofs.', 'jee', '11', 'physics', 'Kinematics', 'notes', 'chapter-notes', 'medium', 'english', 48, false),
  ('Laws of Motion — Short Notes', 'Newton''s 3 laws, friction, pseudo force, pulley systems condensed to 12 pages.', 'jee', '11', 'physics', 'Laws of Motion', 'notes', 'short-notes', 'medium', 'english', 12, false),
  ('Work, Energy & Power — Formula Sheet', 'All WEP formulas: work-energy theorem, conservation laws, power. Ready to paste.', 'jee', '11', 'physics', 'Work Energy Power', 'revision', 'formula-sheet', 'easy', 'english', 4, false),
  ('Thermodynamics — Chapter Notes', 'Laws of thermodynamics, Carnot cycle, PV diagrams. JEE Main + Advanced coverage.', 'jee', '11', 'physics', 'Thermodynamics', 'notes', 'chapter-notes', 'hard', 'english', 36, false),
  ('Circular Motion — Mind Map', 'Centripetal force, banking, vertical circular motion — all in one visual map.', 'jee', '11', 'physics', 'Circular Motion', 'revision', 'mind-map', 'medium', 'english', 2, false),
  ('Chemical Bonding — Chapter Notes', 'VSEPR, hybridization, MOT, ionic vs covalent. Diagrams included.', 'jee', '11', 'chemistry', 'Chemical Bonding', 'notes', 'chapter-notes', 'hard', 'english', 44, false),
  ('Mole Concept — Short Notes', 'Moles, molarity, normality, equivalent concept. All formulas with examples.', 'jee', '11', 'chemistry', 'Mole Concept', 'notes', 'short-notes', 'medium', 'english', 14, false),
  ('Organic Chemistry Basics — NCERT Notes', 'IUPAC naming, isomerism, reaction mechanisms. NCERT-aligned with JEE additions.', 'jee', '11', 'chemistry', 'Organic Chemistry Basics', 'notes', 'ncert', 'medium', 'english', 52, false),
  ('s-Block Elements — Formula Sheet', 'Group 1 & 2 trends, anomalous properties, compounds. Quick reference.', 'jee', '11', 'chemistry', 's-Block Elements', 'revision', 'formula-sheet', 'easy', 'english', 3, false),
  ('Coordinate Geometry — Chapter Notes', 'Straight lines, circles, parabola, ellipse from scratch with JEE PYQ patterns.', 'jee', '11', 'maths', 'Coordinate Geometry', 'notes', 'chapter-notes', 'hard', 'english', 60, false),
  ('Trigonometry — Short Notes', 'All formulae, inverse trig, graphs. 15-page comprehensive reference.', 'jee', '11', 'maths', 'Trigonometry', 'notes', 'short-notes', 'medium', 'english', 15, false),
  ('Permutations & Combinations — One Shot', 'P&C complete theory + 30 solved JEE problems in one shot.', 'jee', '11', 'maths', 'Permutations & Combinations', 'revision', 'one-shot', 'medium', 'english', 20, false),
  ('Kinematics PYQ 2015–2024', 'Chapter-wise previous year questions from JEE Main & Advanced with solutions.', 'jee', '11', 'physics', 'Kinematics', 'pyq', 'chapterwise', 'medium', 'english', 35, false),
  ('Chemical Bonding PYQ 2015–2024', '68 questions from JEE Main + 22 from Advanced. Fully solved.', 'jee', '11', 'chemistry', 'Chemical Bonding', 'pyq', 'chapterwise', 'hard', 'english', 40, false),
  ('JEE Class 11 Physics Chapter Test — Mechanics', '30 MCQ + 5 Integer type. Covers Newton''s Laws, Friction, Circular Motion.', 'jee', '11', 'physics', 'Mechanics', 'test', 'chapter-test', 'hard', 'english', 8, false)
ON CONFLICT DO NOTHING;

-- ─── Resources — JEE Class 12 ─────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Electrostatics — Chapter Notes', 'Coulomb''s law to Gauss law, capacitors, energy. Full Kota-style treatment.', 'jee', '12', 'physics', 'Electrostatics', 'notes', 'chapter-notes', 'hard', 'english', 56, false),
  ('Current Electricity — Short Notes', 'Ohm''s law, KCL/KVL, Wheatstone, RC circuits. Condensed for revision.', 'jee', '12', 'physics', 'Current Electricity', 'notes', 'short-notes', 'medium', 'english', 16, false),
  ('Wave Optics — Formula Sheet', 'Interference, diffraction, polarization. All formulas with condition notes.', 'jee', '12', 'physics', 'Wave Optics', 'revision', 'formula-sheet', 'hard', 'english', 4, false),
  ('Electrochemistry — Chapter Notes', 'Galvanic cells, EMF, Nernst equation, electrolysis. JEE + NEET relevant.', 'jee', '12', 'chemistry', 'Electrochemistry', 'notes', 'chapter-notes', 'hard', 'english', 40, false),
  ('Aldehydes & Ketones — Chapter Notes', 'Nucleophilic addition, named reactions, mechanism arrows. Topper notes.', 'jee', '12', 'chemistry', 'Aldehydes Ketones', 'notes', 'chapter-notes', 'hard', 'english', 48, false),
  ('Coordination Compounds — Mind Map', 'IUPAC, isomerism, VBT, CFT — all in one visual. Colour-coded.', 'jee', '12', 'chemistry', 'Coordination Compounds', 'revision', 'mind-map', 'hard', 'english', 3, false),
  ('Integration — Chapter Notes', 'Standard forms, substitution, parts, partial fractions, definite integrals.', 'jee', '12', 'maths', 'Integration', 'notes', 'chapter-notes', 'hard', 'english', 64, false),
  ('3D Geometry — Short Notes', 'Direction cosines, plane equations, skew lines, shortest distance.', 'jee', '12', 'maths', '3D Geometry', 'notes', 'short-notes', 'hard', 'english', 18, false),
  ('Probability — One Shot', 'Bayes theorem, binomial distribution, conditional probability. JEE-focused.', 'jee', '12', 'maths', 'Probability', 'revision', 'one-shot', 'medium', 'english', 22, false),
  ('Electrostatics PYQ 2015–2024', 'JEE Main 2015–2024 Electrostatics questions. Yearwise + topic tagged.', 'jee', '12', 'physics', 'Electrostatics', 'pyq', 'yearwise', 'hard', 'english', 44, false),
  ('JEE Main Mock Test — Jan 2024 Pattern', '75 questions (25 Physics + 25 Chemistry + 25 Maths). Full NTA pattern.', 'jee', '12', 'physics', 'Full Syllabus', 'test', 'mock-test', 'hard', 'english', 24, true)
ON CONFLICT DO NOTHING;

-- ─── Resources — JEE Dropper ──────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Complete Physics Formula Bible — JEE', 'All 12 chapters of Class 11 + 12 Physics formulas in one 28-page PDF.', 'jee', 'dropper', 'physics', 'Full Syllabus', 'revision', 'formula-sheet', 'hard', 'english', 28, false),
  ('JEE Advanced 2019–2024 PYQ — All Subjects', 'Topic-wise sorted JEE Advanced questions with detailed solutions.', 'jee', 'dropper', 'physics', 'Full Syllabus', 'pyq', 'topicwise', 'hard', 'english', 120, true),
  ('Dropper Strategy — Quick Revision PDF', '90-day dropper plan with daily targets, weak area drills, mock schedule.', 'jee', 'dropper', 'physics', 'Full Syllabus', 'revision', 'quick-revision', 'medium', 'hinglish', 10, false)
ON CONFLICT DO NOTHING;

-- ─── Resources — NEET Class 11 ────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Cell Structure & Function — NCERT Notes', 'Plant cell vs animal cell, organelles, cell division. Diagram-rich NCERT aligned.', 'neet', '11', 'botany', 'Cell Structure', 'notes', 'ncert', 'medium', 'english', 38, false),
  ('Plant Kingdom — Short Notes', 'Algae, bryophytes, pteridophytes, gymnosperms — classification + diagrams.', 'neet', '11', 'botany', 'Plant Kingdom', 'notes', 'short-notes', 'medium', 'english', 20, false),
  ('Animal Kingdom — Handwritten Notes', 'Phylum-wise classification with hand-drawn diagrams. Topper''s original notes.', 'neet', '11', 'zoology', 'Animal Kingdom', 'notes', 'handwritten', 'hard', 'english', 30, false),
  ('Biological Classification — Mind Map', 'Five kingdom classification, viruses, lichens — visual hierarchy map.', 'neet', '11', 'botany', 'Biological Classification', 'revision', 'mind-map', 'easy', 'english', 2, false),
  ('Laws of Motion — NEET Notes', 'Newton''s laws adapted for NEET. Simpler than JEE but all NEET PYQ patterns.', 'neet', '11', 'physics', 'Laws of Motion', 'notes', 'chapter-notes', 'medium', 'english', 24, false),
  ('s-Block Elements — NCERT Notes', 'Sodium, potassium, calcium, magnesium. NCERT line-by-line with NEET angle.', 'neet', '11', 'chemistry', 's-Block Elements', 'notes', 'ncert', 'easy', 'english', 22, false),
  ('Photosynthesis — Handwritten Notes', 'Light reactions, Calvin cycle, C3/C4 plants. Colour diagrams by AIR 42.', 'neet', '11', 'botany', 'Photosynthesis', 'notes', 'handwritten', 'hard', 'english', 18, false),
  ('Plant Kingdom PYQ 2010–2024', 'NEET chapter-wise plant kingdom questions. 96 questions, fully solved.', 'neet', '11', 'botany', 'Plant Kingdom', 'pyq', 'chapterwise', 'medium', 'english', 28, false),
  ('NEET Class 11 Biology Chapter Test', '60 MCQ covering Cell, Plant Kingdom, Animal Kingdom, Biomolecules.', 'neet', '11', 'botany', 'Class 11 Biology', 'test', 'chapter-test', 'medium', 'english', 12, false)
ON CONFLICT DO NOTHING;

-- ─── Resources — NEET Class 12 ────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Human Physiology — Chapter Notes', 'Digestion, circulation, respiration, excretion, neural control. High-yield NEET.', 'neet', '12', 'zoology', 'Human Physiology', 'notes', 'chapter-notes', 'hard', 'english', 72, false),
  ('Genetics & Evolution — Short Notes', 'Mendelian genetics, linkage, mutation, molecular basis of inheritance.', 'neet', '12', 'zoology', 'Genetics', 'notes', 'short-notes', 'hard', 'english', 26, false),
  ('Ecology — Quick Revision', 'Ecosystems, food chains, population, environmental issues. 1-day revision.', 'neet', '12', 'botany', 'Ecology', 'revision', 'quick-revision', 'medium', 'english', 8, false),
  ('Biotechnology — NCERT Notes', 'rDNA technology, PCR, ELISA, GMO. NCERT complete with NEET questions.', 'neet', '12', 'botany', 'Biotechnology', 'notes', 'ncert', 'hard', 'english', 32, false),
  ('Electrochemistry — NEET Formula Sheet', 'EMF, Nernst, Faraday''s laws adapted for NEET. Simpler than JEE version.', 'neet', '12', 'chemistry', 'Electrochemistry', 'revision', 'formula-sheet', 'medium', 'english', 4, false),
  ('Human Physiology PYQ 2010–2024', 'Highest-yield NEET chapter. 140+ questions, organ-system sorted with solutions.', 'neet', '12', 'zoology', 'Human Physiology', 'pyq', 'chapterwise', 'hard', 'english', 52, false),
  ('Genetics PYQ 2010–2024', 'All Mendelian + molecular genetics questions from NEET. Fully solved.', 'neet', '12', 'zoology', 'Genetics', 'pyq', 'chapterwise', 'hard', 'english', 44, false),
  ('NEET Mock Test 2024 Pattern', '180 questions (45 Physics + 45 Chemistry + 45 Botany + 45 Zoology). OMR ready.', 'neet', '12', 'zoology', 'Full Syllabus', 'test', 'mock-test', 'hard', 'english', 32, true)
ON CONFLICT DO NOTHING;

-- ─── Resources — CUET Class 12 ────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('Verbal Ability & Reading — Chapter Notes', 'Reading comprehension, vocabulary, grammar for CUET English section.', 'cuet', '12', 'english', 'Verbal Ability', 'notes', 'chapter-notes', 'medium', 'english', 28, false),
  ('General Awareness — Quick Revision', 'Current affairs 2023–2024 condensed. Static GK + recent events.', 'cuet', '12', 'general', 'General Awareness', 'revision', 'quick-revision', 'medium', 'english', 16, false),
  ('Logical Reasoning — Short Notes', 'Syllogisms, seating, coding-decoding, direction sense for CUET General Test.', 'cuet', '12', 'general', 'Logical Reasoning', 'notes', 'short-notes', 'medium', 'english', 20, false),
  ('Political Science Class 12 — CUET Notes', 'Federalism, parliament, judiciary — CUET domain aligned with NCERT.', 'cuet', '12', 'domain', 'Political Science', 'notes', 'ncert', 'medium', 'english', 36, false),
  ('Quantitative Aptitude — Formula Sheet', 'Percentages, ratio, profit-loss, time-speed-distance. 100 formulae.', 'cuet', '12', 'general', 'Quantitative Aptitude', 'revision', 'formula-sheet', 'medium', 'english', 6, false),
  ('CUET English PYQ 2022–2024', 'All English section questions from CUET 2022, 2023, 2024 with answers.', 'cuet', '12', 'english', 'Verbal Ability', 'pyq', 'yearwise', 'medium', 'english', 24, false),
  ('CUET General Test PYQ 2022–2024', 'Complete General Test PYQs with section-wise analysis and solutions.', 'cuet', '12', 'general', 'General Test', 'pyq', 'yearwise', 'medium', 'english', 30, false),
  ('CUET Mock Test — 2024 Pattern', '100 questions (25 English + 25 General + 50 Domain). Full CUET pattern.', 'cuet', '12', 'general', 'Full Syllabus', 'test', 'mock-test', 'medium', 'english', 20, false)
ON CONFLICT DO NOTHING;

-- ─── Resources — CUET Dropper ─────────────────────────────────────
INSERT INTO resources (title, description, exam, class, subject, chapter, resource_type, sub_type, difficulty, language, pages, is_premium) VALUES
  ('CUET 2025 Complete Strategy Guide', 'Section-wise prep plan, time allocation, mock schedule for droppers.', 'cuet', 'dropper', 'general', 'Full Syllabus', 'revision', 'quick-revision', 'medium', 'english', 12, false),
  ('Domain Subjects — Mind Map Collection', 'History, Geography, Economics, Political Science — visual summaries for CUET.', 'cuet', 'dropper', 'domain', 'Full Syllabus', 'revision', 'mind-map', 'medium', 'english', 20, false)
ON CONFLICT DO NOTHING;
