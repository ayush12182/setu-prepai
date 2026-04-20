-- ============================================================
-- SETU Question Bank — questions_bank table
-- 20260408100000_questions_bank.sql
-- ============================================================

-- ─── Main table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions_bank (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Human-readable ID: CUET_PHY_CH03_M_TB_001
  question_id           TEXT UNIQUE,

  -- Exam metadata
  exam                  TEXT NOT NULL CHECK (exam IN ('CUET', 'JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'OTHER')),
  section               TEXT CHECK (section IN ('Domain', 'Language', 'General', 'Mixed')),
  subject               TEXT NOT NULL,

  -- NCERT provenance — every question must be traceable
  ncert_class           INTEGER CHECK (ncert_class IN (11, 12)),
  ncert_chapter         TEXT,
  ncert_chapter_number  INTEGER,
  topic                 TEXT,
  subtopic              TEXT,

  -- Classification
  difficulty            TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question_type         TEXT NOT NULL CHECK (question_type IN (
                          'TYPE_A',   -- Factual recall
                          'TYPE_B',   -- Statement-based (Only 1 / Only 2 / Both / Neither)
                          'TYPE_C',   -- Match the following
                          'TYPE_D',   -- Assertion-Reason
                          'TYPE_E',   -- Application / Calculation
                          'TYPE_F'    -- Reading comprehension
                        )),
  exam_stage            TEXT DEFAULT 'practice' CHECK (exam_stage IN (
                          'practice', 'chapter_test', 'mock_test', 'pyq_style', 'previous_year'
                        )),

  -- Question content
  question_text         TEXT NOT NULL,
  options               JSONB NOT NULL,        -- {"A": "...", "B": "...", "C": "...", "D": "..."}
  correct_option        TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),

  -- Explanation
  explanation           JSONB,
  -- {
  --   "short": "One-line explanation",
  --   "detailed_steps": ["Step 1", "Step 2", ...],
  --   "ncert_reference": "NCERT Class 11 Physics, Chapter 3, Page 47"
  -- }

  -- Distractor rationale (for AI quality gate and teacher review)
  distractor_logic      JSONB,
  -- { "B": "why B is wrong", "C": "why C is wrong", "D": "why D is wrong" }

  -- Search & filtering
  tags                  TEXT[] DEFAULT '{}',
  estimated_time_seconds INTEGER,

  -- PYQ linkage
  pyq_similar           BOOLEAN DEFAULT false,
  pyq_year_reference    TEXT,               -- "CUET 2023", "CUET 2024"

  -- Quality & verification flags
  is_verified           BOOLEAN DEFAULT false,   -- human teacher approved
  ai_quality_score      FLOAT,                   -- 0.0-1.0, set by quality gate
  quality_gate_passed   BOOLEAN DEFAULT false,   -- did it pass all 6 checks?
  quality_gate_log      JSONB,                   -- { "uniqueness": true, "answer_verified": true, ... }
  generation_model      TEXT,                    -- "claude-sonnet-4-20250514"
  generation_attempt    INTEGER DEFAULT 1,       -- which retry produced this (max 3)

  -- Live performance tracking (updated by student_activity trigger)
  times_attempted       INTEGER DEFAULT 0,
  times_correct         INTEGER DEFAULT 0,
  avg_time_seconds      FLOAT,                   -- rolling average of time_spent

  -- Timestamps
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes for fast filtering ───────────────────────────────
-- Most common query: "give me questions for exam X, subject Y"
CREATE INDEX IF NOT EXISTS idx_qb_exam_subject
  ON public.questions_bank(exam, subject);

-- Chapter-level browsing
CREATE INDEX IF NOT EXISTS idx_qb_exam_chapter
  ON public.questions_bank(exam, ncert_chapter_number);

-- Difficulty distribution queries
CREATE INDEX IF NOT EXISTS idx_qb_difficulty
  ON public.questions_bank(difficulty);

-- Student practice: avoid already-attempted questions by question_id
CREATE INDEX IF NOT EXISTS idx_qb_question_id
  ON public.questions_bank(question_id);

-- Topic/subtopic for adaptive selection
CREATE INDEX IF NOT EXISTS idx_qb_topic
  ON public.questions_bank(topic);

-- Tag search (full GIN for array containment queries like @>)
CREATE INDEX IF NOT EXISTS idx_qb_tags
  ON public.questions_bank USING GIN(tags);

-- Verification queue: unverified quality-passed questions for teachers
CREATE INDEX IF NOT EXISTS idx_qb_verification
  ON public.questions_bank(is_verified, quality_gate_passed) WHERE NOT is_verified;

-- PYQ-style questions
CREATE INDEX IF NOT EXISTS idx_qb_pyq
  ON public.questions_bank(pyq_similar) WHERE pyq_similar = true;

-- ─── Auto-update updated_at on any change ────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_qb_updated_at ON public.questions_bank;
CREATE TRIGGER trg_qb_updated_at
  BEFORE UPDATE ON public.questions_bank
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Trigger: sync performance stats from student_activity ───
-- When a student answers a question from questions_bank,
-- increment times_attempted and times_correct on the source question.
CREATE OR REPLACE FUNCTION public.update_question_performance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total   INTEGER;
  v_correct INTEGER;
  v_avg_t   FLOAT;
BEGIN
  -- Only track if question_id is set (i.e. came from questions_bank)
  IF NEW.question_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    AVG(time_spent_seconds)
  INTO v_total, v_correct, v_avg_t
  FROM public.student_activity
  WHERE question_id = NEW.question_id;

  UPDATE public.questions_bank
  SET
    times_attempted = v_total,
    times_correct   = COALESCE(v_correct, 0),
    avg_time_seconds = v_avg_t,
    updated_at       = now()
  WHERE question_id = NEW.question_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_question_perf ON public.student_activity;
CREATE TRIGGER trg_update_question_perf
  AFTER INSERT ON public.student_activity
  FOR EACH ROW EXECUTE FUNCTION public.update_question_performance();

-- ─── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.questions_bank ENABLE ROW LEVEL SECURITY;

-- Students can read any verified + quality-passed question
DROP POLICY IF EXISTS "students_read_verified_questions" ON public.questions_bank;
CREATE POLICY "students_read_verified_questions" ON public.questions_bank
  FOR SELECT
  USING (quality_gate_passed = true);
  -- Note: we intentionally do NOT restrict to is_verified here,
  -- so AI-generated + quality-passed questions can be served immediately.
  -- Teachers can mark is_verified=true to signal "human-reviewed".

-- Teachers (b2b_mentor) can read all questions including unverified ones (for review)
-- and can UPDATE the is_verified flag
DROP POLICY IF EXISTS "teachers_read_all_questions" ON public.questions_bank;
CREATE POLICY "teachers_read_all_questions" ON public.questions_bank
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND user_type IN ('b2b_mentor', 'admin')
    )
  );

DROP POLICY IF EXISTS "teachers_verify_questions" ON public.questions_bank;
CREATE POLICY "teachers_verify_questions" ON public.questions_bank
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND user_type IN ('b2b_mentor', 'admin')
    )
  )
  WITH CHECK (true);

-- Admins can insert/delete (edge function runs as service_role, bypasses RLS anyway)
-- This policy covers direct admin panel inserts
DROP POLICY IF EXISTS "admins_full_access" ON public.questions_bank;
CREATE POLICY "admins_full_access" ON public.questions_bank
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND user_type = 'admin'
    )
  );

-- ─── Helper: Adaptive question selection function ─────────────
-- Called by the frontend to get next question for a student.
-- Applies: weak-topic boost, difficulty stepping, no-repeat logic.
CREATE OR REPLACE FUNCTION public.get_adaptive_questions(
  p_student_id   UUID,
  p_exam         TEXT,
  p_subject      TEXT,
  p_chapter      TEXT DEFAULT NULL,
  p_count        INTEGER DEFAULT 10,
  p_exam_stage   TEXT DEFAULT 'practice'
)
RETURNS SETOF public.questions_bank
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_weak_topics    TEXT[];
  v_attempted_ids  TEXT[];
  v_weak_count     INTEGER;
  v_other_count    INTEGER;
BEGIN
  -- Get student's weak topics
  SELECT COALESCE(weak_topics, '{}')
  INTO v_weak_topics
  FROM public.student_profiles
  WHERE student_id = p_student_id;

  -- Get already-attempted question IDs for this student
  SELECT ARRAY(
    SELECT DISTINCT question_id
    FROM public.student_activity
    WHERE student_id = p_student_id
      AND question_id IS NOT NULL
  ) INTO v_attempted_ids;

  -- For mock tests: ignore adaptive, return fixed distribution
  IF p_exam_stage IN ('mock_test', 'previous_year') THEN
    RETURN QUERY
      SELECT * FROM public.questions_bank
      WHERE exam = p_exam
        AND subject = p_subject
        AND (p_chapter IS NULL OR ncert_chapter = p_chapter)
        AND quality_gate_passed = true
        AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
      ORDER BY random()
      LIMIT p_count;
    RETURN;
  END IF;

  -- Adaptive: 60% weak topics, 40% other topics
  v_weak_count  := GREATEST(1, ROUND(p_count * 0.6));
  v_other_count := p_count - v_weak_count;

  RETURN QUERY
    -- Weak topic questions first (60%)
    (
      SELECT * FROM public.questions_bank
      WHERE exam = p_exam
        AND subject = p_subject
        AND (p_chapter IS NULL OR ncert_chapter = p_chapter)
        AND quality_gate_passed = true
        AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
        AND (v_weak_topics IS NULL OR topic = ANY(v_weak_topics))
      ORDER BY random()
      LIMIT v_weak_count
    )
    UNION ALL
    -- Other topics (40%)
    (
      SELECT * FROM public.questions_bank
      WHERE exam = p_exam
        AND subject = p_subject
        AND (p_chapter IS NULL OR ncert_chapter = p_chapter)
        AND quality_gate_passed = true
        AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
        AND (v_weak_topics IS NULL OR topic != ALL(v_weak_topics))
      ORDER BY random()
      LIMIT v_other_count
    )
  ORDER BY random()
  LIMIT p_count;
END;
$$;

-- ─── Convenience view for Admin Question Generator panel ──────
CREATE OR REPLACE VIEW public.questions_bank_with_stats AS
SELECT
  qb.*,
  CASE
    WHEN qb.times_attempted = 0 THEN NULL
    ELSE ROUND((qb.times_correct::FLOAT / qb.times_attempted * 100)::NUMERIC, 1)
  END AS live_accuracy_pct
FROM public.questions_bank qb;
