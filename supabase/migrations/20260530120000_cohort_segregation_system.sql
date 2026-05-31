-- ══════════════════════════════════════════════════════════════════
-- PrepEntrance v2 — Cohort Segregation & Onboarding System Schema
-- Migration: 20260530120000_cohort_segregation_system.sql
-- ══════════════════════════════════════════════════════════════════

-- ─── 1. COHORTS TABLE ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cohorts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL UNIQUE, -- e.g. 'JEE Class 11', 'JEE Class 12', 'JEE Dropper', 'NEET Class 11', 'NEET Class 12', 'NEET Dropper', 'CUET'
  exam         TEXT        NOT NULL CHECK (exam IN ('JEE', 'NEET', 'CUET')),
  class        TEXT        NOT NULL CHECK (class IN ('11', '12', 'dropper')),
  target_year  INTEGER     NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read cohorts" ON public.cohorts;
CREATE POLICY "public read cohorts"
  ON public.cohorts FOR SELECT USING (true);

-- ─── 2. SEED COHORTS ───────────────────────────────────────────────
INSERT INTO public.cohorts (name, exam, class, target_year) VALUES
  ('JEE Class 11',  'JEE',  '11',      2028),
  ('JEE Class 12',  'JEE',  '12',      2027),
  ('JEE Dropper',   'JEE',  'dropper', 2027),
  ('NEET Class 11', 'NEET', '11',      2028),
  ('NEET Class 12', 'NEET', '12',      2027),
  ('NEET Dropper',  'NEET', 'dropper', 2027),
  ('CUET',          'CUET', '12',      2027)
ON CONFLICT (name) DO UPDATE SET
  exam = EXCLUDED.exam,
  class = EXCLUDED.class,
  target_year = EXCLUDED.target_year;

-- ─── 3. EXTEND student_profiles TABLE ──────────────────────────────
-- Add columns safely using plpgsql block to avoid transaction breaks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='cohort_id') THEN
    ALTER TABLE public.student_profiles ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='class') THEN
    ALTER TABLE public.student_profiles ADD COLUMN class TEXT CHECK (class IN ('11', '12', 'dropper'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='target_year') THEN
    ALTER TABLE public.student_profiles ADD COLUMN target_year INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='current_level') THEN
    ALTER TABLE public.student_profiles ADD COLUMN current_level TEXT DEFAULT 'Intermediate' CHECK (current_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;
END $$;

-- ─── 4. CORE SYLLABUS TABLES ───────────────────────────────────────

-- Subjects (e.g. Physics, Chemistry, Maths, Biology)
CREATE TABLE IF NOT EXISTS public.subjects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id    UUID        NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cohort_id, name)
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read subjects" ON public.subjects;
CREATE POLICY "public read subjects"
  ON public.subjects FOR SELECT TO authenticated USING (true);

-- Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id   UUID        NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subject_id, name)
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read chapters" ON public.chapters;
CREATE POLICY "public read chapters"
  ON public.chapters FOR SELECT TO authenticated USING (true);

-- Topics
CREATE TABLE IF NOT EXISTS public.topics (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id   UUID        NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  sort_order   INTEGER     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (chapter_id, name)
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read topics" ON public.topics;
CREATE POLICY "public read topics"
  ON public.topics FOR SELECT TO authenticated USING (true);

-- ─── 5. STUDENT TOPIC PROGRESS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_topic_progress (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id          UUID        NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status            TEXT        NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  accuracy_pct      FLOAT       DEFAULT 0.0,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own topic progress" ON public.student_topic_progress;
CREATE POLICY "users manage own topic progress"
  ON public.student_topic_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 6. LINK BATCHES TO COHORTS ────────────────────────────────────
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='batches' AND column_name='cohort_id') THEN
    ALTER TABLE public.batches ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── 7. BATCH RESOURCES (COHORT-BASED ACCESS CONTROL) ──────────────
CREATE TABLE IF NOT EXISTS public.batch_resources (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     UUID        NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  resource_id  UUID        NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(batch_id, resource_id)
);

ALTER TABLE public.batch_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "batch members read batch resources" ON public.batch_resources;
CREATE POLICY "batch members read batch resources"
  ON public.batch_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_batch_map bm
      WHERE bm.batch_id = public.batch_resources.batch_id
        AND bm.student_id = auth.uid()
    )
  );

-- Refresh postgrest schema cache
NOTIFY pgrst, 'reload schema';
