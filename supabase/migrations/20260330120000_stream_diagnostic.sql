-- ============================================================
-- PrepEntrance STREAM DIAGNOSTIC + UNIFIED QUESTION BANK SCHEMA
-- Adds: stream-awareness, proctoring, scalable question bank
-- ============================================================

-- 1. EXTEND diagnostic_questions WITH stream column
ALTER TABLE public.diagnostic_questions
    ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'jee'
        CHECK (stream IN ('jee', 'neet', 'cuet', 'commerce', 'foundation'));

CREATE INDEX IF NOT EXISTS idx_diag_questions_stream ON public.diagnostic_questions(stream);

-- 2. EXTEND diagnostic_attempts WITH proctoring fields
ALTER TABLE public.diagnostic_attempts
    ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'jee',
    ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fullscreen_exit_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS copy_attempt_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS camera_inactive_seconds INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS proctoring_events JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS integrity_score INTEGER GENERATED ALWAYS AS (
        GREATEST(0, 100
            - (LEAST(tab_switch_count, 10) * 5)
            - (LEAST(fullscreen_exit_count, 5) * 4)
            - (LEAST(copy_attempt_count, 10) * 3)
            - (LEAST(camera_inactive_seconds / 30, 10) * 2)
        )
    ) STORED;

-- 3. SCALABLE UNIFIED QUESTION BANK
-- The main questions table for practice/test already exists.
-- We ADD the following columns to it for multi-stream support.
ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'jee'
        CHECK (stream IN ('jee', 'neet', 'cuet', 'commerce', 'foundation')),
    ADD COLUMN IF NOT EXISTS concept TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ai_generated'
        CHECK (source IN ('ai_generated', 'manual', 'past_paper', 'imported'));

CREATE INDEX IF NOT EXISTS idx_questions_stream    ON public.questions(stream);
CREATE INDEX IF NOT EXISTS idx_questions_concept   ON public.questions(concept);
CREATE INDEX IF NOT EXISTS idx_questions_verified  ON public.questions(verified);
CREATE INDEX IF NOT EXISTS idx_questions_stream_topic ON public.questions(stream, topic, subtopic, difficulty);

-- 4. COMMERCE STREAM subjects reference table
CREATE TABLE IF NOT EXISTS public.stream_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapters TEXT[] NOT NULL DEFAULT '{}',
    UNIQUE(stream, subject)
);

INSERT INTO public.stream_subjects(stream, subject, chapters) VALUES
('commerce', 'Accounts', ARRAY[
    'Introduction to Accounting', 'Accounting Equation', 'Journal Entries', 'Ledger',
    'Trial Balance', 'Final Accounts', 'Partnership Accounts', 'Company Accounts',
    'Ratio Analysis', 'Cash Flow Statement'
]),
('commerce', 'Economics', ARRAY[
    'Introduction to Economics', 'Consumer Behaviour', 'Demand Analysis',
    'Supply Analysis', 'Market Equilibrium', 'National Income', 'Money & Banking',
    'Government Budget', 'Balance of Payments', 'Indian Economy'
]),
('commerce', 'Business Studies', ARRAY[
    'Nature of Business', 'Forms of Organisation', 'Business Environment',
    'Planning', 'Organising', 'Staffing', 'Directing', 'Controlling',
    'Financial Management', 'Marketing Management', 'Consumer Protection'
]),
('jee', 'Physics', ARRAY[
    'Mechanics', 'Thermodynamics', 'Electrostatics', 'Magnetism',
    'Optics', 'Modern Physics', 'Waves', 'Rotational Motion'
]),
('jee', 'Chemistry', ARRAY[
    'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'
]),
('jee', 'Mathematics', ARRAY[
    'Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry', 'Vectors', 'Statistics'
]),
('neet', 'Physics', ARRAY['Mechanics', 'Thermodynamics', 'Electrostatics', 'Optics', 'Modern Physics']),
('neet', 'Chemistry', ARRAY['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry']),
('neet', 'Biology', ARRAY['Botany', 'Zoology', 'Genetics', 'Ecology', 'Human Physiology'])
ON CONFLICT (stream, subject) DO NOTHING;

-- 5. BATCH STREAM COLUMN (each batch has a target stream)
ALTER TABLE public.batches
    ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'jee'
        CHECK (stream IN ('jee', 'neet', 'cuet', 'commerce', 'foundation'));

-- 6. RLS on stream_subjects (public read)
ALTER TABLE public.stream_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read stream subjects"
    ON public.stream_subjects FOR SELECT TO authenticated USING (true);
