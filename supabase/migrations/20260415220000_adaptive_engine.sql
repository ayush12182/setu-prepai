-- ============================================================
-- Infinite Adaptive Engine — DB Schema
-- 20260415220000_adaptive_engine.sql
-- ============================================================

-- ─── 1. EXAM CURRICULUM (Hierarchical) ───────────────────────
CREATE TABLE IF NOT EXISTS public.exam_curriculum (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam        TEXT NOT NULL CHECK (exam IN ('JEE_MAINS','JEE_ADVANCED','NEET','CUET','OTHER')),
  subject     TEXT NOT NULL,
  topic       TEXT NOT NULL,
  subtopic    TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  UNIQUE(exam, subject, topic, subtopic)
);

-- Fast lookup for dropdowns
CREATE INDEX IF NOT EXISTS idx_curriculum_exam_subject ON public.exam_curriculum(exam, subject);
CREATE INDEX IF NOT EXISTS idx_curriculum_topic ON public.exam_curriculum(exam, subject, topic);

ALTER TABLE public.exam_curriculum ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_curriculum" ON public.exam_curriculum;
CREATE POLICY "public_read_curriculum" ON public.exam_curriculum FOR SELECT USING (true);

-- ─── 2. STUDENT QUESTION ATTEMPTS ────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_question_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id         TEXT,                         -- references questions_bank.question_id
  exam                TEXT,
  subject             TEXT,
  topic               TEXT,
  subtopic            TEXT,
  difficulty          TEXT,
  selected_answer     TEXT,                         -- A / B / C / D
  correct_answer      TEXT,
  is_correct          BOOLEAN NOT NULL,
  time_spent_seconds  INTEGER,
  is_variant_attempt  BOOLEAN DEFAULT false,
  parent_question_id  TEXT,                         -- if variant, original q id
  attempted_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_question_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sqa_student ON public.student_question_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_sqa_topic ON public.student_question_attempts(student_id, topic);
CREATE INDEX IF NOT EXISTS idx_sqa_subject ON public.student_question_attempts(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_sqa_date ON public.student_question_attempts(attempted_at);

DROP POLICY IF EXISTS "students_own_attempts" ON public.student_question_attempts;
CREATE POLICY "students_own_attempts" ON public.student_question_attempts
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "teachers_see_linked_attempts" ON public.student_question_attempts;
CREATE POLICY "teachers_see_linked_attempts" ON public.student_question_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_teacher_links stl
      WHERE stl.student_id = student_question_attempts.student_id
        AND stl.teacher_id = auth.uid()
    )
  );

-- ─── 3. CURRICULUM SEED — CUET ───────────────────────────────
INSERT INTO public.exam_curriculum (exam, subject, topic, subtopic, order_index) VALUES
-- CUET · English
('CUET','English','Reading Comprehension','Factual Passages',1),
('CUET','English','Reading Comprehension','Literary Passages',2),
('CUET','English','Reading Comprehension','Inferential Questions',3),
('CUET','English','Grammar','Tenses & Verb Forms',4),
('CUET','English','Grammar','Subject-Verb Agreement',5),
('CUET','English','Grammar','Active & Passive Voice',6),
('CUET','English','Vocabulary','Synonyms & Antonyms',7),
('CUET','English','Vocabulary','Idioms & Phrases',8),
('CUET','English','Vocabulary','One-Word Substitution',9),
('CUET','English','Verbal Ability','Para-jumbles',10),
('CUET','English','Verbal Ability','Cloze Test',11),
('CUET','English','Verbal Ability','Sentence Completion',12),

-- CUET · General Test
('CUET','General Test','Logical Reasoning','Coding-Decoding',1),
('CUET','General Test','Logical Reasoning','Blood Relations',2),
('CUET','General Test','Logical Reasoning','Seating Arrangements',3),
('CUET','General Test','Quantitative Aptitude','Percentages & Profit-Loss',4),
('CUET','General Test','Quantitative Aptitude','Time, Speed & Distance',5),
('CUET','General Test','Quantitative Aptitude','Ratios & Proportions',6),
('CUET','General Test','Data Interpretation','Bar Graphs',7),
('CUET','General Test','Data Interpretation','Pie Charts',8),
('CUET','General Test','Data Interpretation','Tables',9),
('CUET','General Test','General Awareness','Current Affairs 2023-24',10),
('CUET','General Test','General Awareness','Static GK',11),
('CUET','General Test','General Awareness','Science & Technology',12),

-- CUET · Accounts
('CUET','Accounts','Partnership Accounts','Admission of Partner',1),
('CUET','Accounts','Partnership Accounts','Retirement of Partner',2),
('CUET','Accounts','Partnership Accounts','Goodwill Valuation',3),
('CUET','Accounts','Company Accounts','Issue of Shares',4),
('CUET','Accounts','Company Accounts','Forfeiture & Reissue',5),
('CUET','Accounts','Company Accounts','Debentures',6),
('CUET','Accounts','Financial Statements','P&L Account',7),
('CUET','Accounts','Financial Statements','Balance Sheet',8),
('CUET','Accounts','Financial Statements','Cash Flow Statement',9),
('CUET','Accounts','Ratio Analysis','Liquidity Ratios',10),
('CUET','Accounts','Ratio Analysis','Profitability Ratios',11),
('CUET','Accounts','Ratio Analysis','Activity Ratios',12),

-- CUET · Economics
('CUET','Economics','Microeconomics','Demand Analysis',1),
('CUET','Economics','Microeconomics','Supply Analysis',2),
('CUET','Economics','Microeconomics','Market Structures',3),
('CUET','Economics','Macroeconomics','National Income',4),
('CUET','Economics','Macroeconomics','Money & Banking',5),
('CUET','Economics','Macroeconomics','Government Budget',6),
('CUET','Economics','Indian Economy','Economic Planning',7),
('CUET','Economics','Indian Economy','Poverty & Unemployment',8),
('CUET','Economics','Indian Economy','International Trade',9),

-- CUET · Business Studies
('CUET','Business Studies','Management','Nature & Significance',1),
('CUET','Business Studies','Management','Principles of Management',2),
('CUET','Business Studies','Organising','Delegation & Decentralisation',3),
('CUET','Business Studies','Organising','Organisational Structure',4),
('CUET','Business Studies','Directing','Leadership & Motivation',5),
('CUET','Business Studies','Directing','Communication',6),
('CUET','Business Studies','Financial Management','Capital Structure',7),
('CUET','Business Studies','Financial Management','Working Capital',8),
('CUET','Business Studies','Marketing','Marketing Mix',9),
('CUET','Business Studies','Marketing','Consumer Protection',10),

-- ─── JEE SEED ──────────────────────────────────────────────
-- JEE · Physics
('JEE_MAINS','Physics','Mechanics','Kinematics — 1D & 2D',1),
('JEE_MAINS','Physics','Mechanics','Laws of Motion & Friction',2),
('JEE_MAINS','Physics','Mechanics','Work, Energy & Power',3),
('JEE_MAINS','Physics','Mechanics','Rotational Motion',4),
('JEE_MAINS','Physics','Electrostatics','Coulombs Law & Electric Field',5),
('JEE_MAINS','Physics','Electrostatics','Potential & Capacitance',6),
('JEE_MAINS','Physics','Current Electricity','Ohm''s Law & Circuits',7),
('JEE_MAINS','Physics','Current Electricity','Kirchhoff''s Laws',8),
('JEE_MAINS','Physics','Optics','Ray Optics — Mirrors & Lenses',9),
('JEE_MAINS','Physics','Optics','Wave Optics — Interference',10),
('JEE_MAINS','Physics','Modern Physics','Photoelectric Effect',11),
('JEE_MAINS','Physics','Modern Physics','Atomic Models & Nuclear Physics',12),

-- JEE · Chemistry
('JEE_MAINS','Chemistry','Physical Chemistry','Mole Concept & Stoichiometry',1),
('JEE_MAINS','Chemistry','Physical Chemistry','Chemical Equilibrium',2),
('JEE_MAINS','Chemistry','Physical Chemistry','Electrochemistry',3),
('JEE_MAINS','Chemistry','Organic Chemistry','Hydrocarbons',4),
('JEE_MAINS','Chemistry','Organic Chemistry','Alcohols, Phenols & Ethers',5),
('JEE_MAINS','Chemistry','Organic Chemistry','Carbonyl Compounds',6),
('JEE_MAINS','Chemistry','Inorganic Chemistry','Periodic Table & Properties',7),
('JEE_MAINS','Chemistry','Inorganic Chemistry','Chemical Bonding',8),
('JEE_MAINS','Chemistry','Inorganic Chemistry','D-Block & Coordination Compounds',9),

-- JEE · Mathematics
('JEE_MAINS','Mathematics','Calculus','Limits & Continuity',1),
('JEE_MAINS','Mathematics','Calculus','Differentiation',2),
('JEE_MAINS','Mathematics','Calculus','Integration',3),
('JEE_MAINS','Mathematics','Calculus','Differential Equations',4),
('JEE_MAINS','Mathematics','Algebra','Complex Numbers',5),
('JEE_MAINS','Mathematics','Algebra','Matrices & Determinants',6),
('JEE_MAINS','Mathematics','Algebra','Probability',7),
('JEE_MAINS','Mathematics','Coordinate Geometry','Straight Lines & Circles',8),
('JEE_MAINS','Mathematics','Coordinate Geometry','Parabola, Ellipse & Hyperbola',9),
('JEE_MAINS','Mathematics','Vectors & 3D','Vector Algebra',10),
('JEE_MAINS','Mathematics','Vectors & 3D','3D Geometry',11),

-- ─── NEET SEED ─────────────────────────────────────────────
('NEET','Biology','Cell Biology','Cell Structure & Organelles',1),
('NEET','Biology','Cell Biology','Cell Division — Mitosis & Meiosis',2),
('NEET','Biology','Genetics','Mendel''s Laws',3),
('NEET','Biology','Genetics','Molecular Basis of Inheritance',4),
('NEET','Biology','Human Physiology','Digestion & Absorption',5),
('NEET','Biology','Human Physiology','Circulation & Respiration',6),
('NEET','Biology','Human Physiology','Excretion',7),
('NEET','Biology','Ecology','Ecosystems & Food Chains',8),
('NEET','Biology','Ecology','Biodiversity & Conservation',9),
('NEET','Biology','Reproduction','Reproduction in Flowering Plants',10),
('NEET','Biology','Reproduction','Human Reproduction',11),
('NEET','Physics','Mechanics','Laws of Motion',1),
('NEET','Physics','Optics','Ray & Wave Optics',2),
('NEET','Physics','Modern Physics','Dual Nature & Photoelectric Effect',3),
('NEET','Chemistry','Physical Chemistry','Solutions & Colligative Properties',1),
('NEET','Chemistry','Organic Chemistry','Biomolecules',2),
('NEET','Chemistry','Inorganic Chemistry','p-Block Elements',3)
ON CONFLICT (exam, subject, topic, subtopic) DO NOTHING;

-- ─── 4. Teacher analytics helper RPC ─────────────────────────
CREATE OR REPLACE FUNCTION public.get_student_analytics(
  p_teacher_id UUID,
  p_student_id UUID
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'today', (
      SELECT COUNT(*) FROM public.student_question_attempts
      WHERE student_id = p_student_id
        AND attempted_at >= CURRENT_DATE
    ),
    'week', (
      SELECT COUNT(*) FROM public.student_question_attempts
      WHERE student_id = p_student_id
        AND attempted_at >= NOW() - INTERVAL '7 days'
    ),
    'allTime', (
      SELECT COUNT(*) FROM public.student_question_attempts
      WHERE student_id = p_student_id
    ),
    'accuracy', (
      SELECT COALESCE(ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END)), 0)
      FROM public.student_question_attempts
      WHERE student_id = p_student_id
    ),
    'avgTime', (
      SELECT COALESCE(ROUND(AVG(time_spent_seconds)), 0)
      FROM public.student_question_attempts
      WHERE student_id = p_student_id
    ),
    'weakTopics', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('topic', topic, 'accuracy', acc)),'[]')
      FROM (
        SELECT topic,
               ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END)) AS acc
        FROM public.student_question_attempts
        WHERE student_id = p_student_id AND topic IS NOT NULL
        GROUP BY topic
        HAVING AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END) < 50
           AND COUNT(*) >= 2
        ORDER BY acc ASC
        LIMIT 5
      ) t
    ),
    'subjectAccuracy', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('subject', subject, 'accuracy', acc, 'attempts', cnt)),'[]')
      FROM (
        SELECT subject,
               ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0 END)) AS acc,
               COUNT(*) AS cnt
        FROM public.student_question_attempts
        WHERE student_id = p_student_id AND subject IS NOT NULL
        GROUP BY subject
      ) s
    ),
    'variantTriggers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'topic', topic,
        'subtopic', subtopic,
        'count', cnt
      )),'[]')
      FROM (
        SELECT topic, subtopic, COUNT(*) AS cnt
        FROM public.student_question_attempts
        WHERE student_id = p_student_id AND is_variant_attempt = true
        GROUP BY topic, subtopic
        ORDER BY cnt DESC
        LIMIT 6
      ) v
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_analytics(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
