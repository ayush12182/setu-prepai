-- ============================================================
-- PrepEntrance Student Practice & Feedback Architecture
-- 20260408110000_practice_feedback.sql
-- ============================================================

-- ─── 1. PRACTICE REPORTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  exam                TEXT NOT NULL,
  subject             TEXT NOT NULL,
  chapter             TEXT NOT NULL,
  subtopic            TEXT,
  total_questions     INTEGER NOT NULL,
  score               FLOAT NOT NULL,
  accuracy_pct        FLOAT NOT NULL,
  time_spent_seconds  INTEGER NOT NULL,
  weak_topics         TEXT[] DEFAULT '{}',
  strong_topics       TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_practice_reports_student ON public.practice_reports(student_id);
CREATE INDEX idx_practice_reports_teacher ON public.practice_reports(teacher_id);
ALTER TABLE public.practice_reports ENABLE ROW LEVEL SECURITY;

-- Students can read their own reports
DROP POLICY IF EXISTS "students_read_own_reports" ON public.practice_reports;
CREATE POLICY "students_read_own_reports" ON public.practice_reports
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can read reports of their linked students
DROP POLICY IF EXISTS "teachers_read_reports" ON public.practice_reports;
CREATE POLICY "teachers_read_reports" ON public.practice_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_teacher_links
      WHERE student_id = practice_reports.student_id
        AND teacher_id = auth.uid()
        AND is_active = true
    )
  );

-- Service role inserts (from edge function)
DROP POLICY IF EXISTS "service_role_insert" ON public.practice_reports;
CREATE POLICY "service_role_insert" ON public.practice_reports
  FOR INSERT WITH CHECK (true);

-- ─── 2. TEACHER NOTIFICATIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teacher_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('low_accuracy', 'weak_topic_repeated', 'needs_review', 'general')),
  link_url    TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_teacher ON public.teacher_notifications(teacher_id, is_read);
ALTER TABLE public.teacher_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_notifications" ON public.teacher_notifications;
CREATE POLICY "teachers_manage_own_notifications" ON public.teacher_notifications
  USING (auth.uid() = teacher_id);

-- ─── 3. QUESTIONS BANK UPDATES ────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions_bank' AND column_name='confidence_score') THEN
    ALTER TABLE public.questions_bank ADD COLUMN confidence_score FLOAT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions_bank' AND column_name='needs_review') THEN
    ALTER TABLE public.questions_bank ADD COLUMN needs_review BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions_bank' AND column_name='micro_concept') THEN
    ALTER TABLE public.questions_bank ADD COLUMN micro_concept TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_qb_needs_review ON public.questions_bank(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_qb_micro_concept ON public.questions_bank(micro_concept);

-- ─── 4. TRIGGER: AUTO-FLAG QUESTIONS ─────────────────────────
-- Updates needs_review if accuracy drops below 30% or goes above 95% (after 10 attempts to be safe)
CREATE OR REPLACE FUNCTION public.flag_anomalous_questions()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_accuracy FLOAT;
BEGIN
  -- We already trigger update_question_performance on INSERT to student_activity.
  -- This runs AFTER the questions_bank times_correct is updated.
  IF NEW.times_attempted >= 10 THEN
    v_accuracy := (NEW.times_correct::FLOAT / NEW.times_attempted * 100);
    IF v_accuracy < 30.0 OR v_accuracy > 95.0 THEN
      NEW.needs_review := true;
    ELSE
      NEW.needs_review := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_flag_question ON public.questions_bank;
CREATE TRIGGER trg_flag_question
  BEFORE UPDATE OF times_attempted, times_correct ON public.questions_bank
  FOR EACH ROW EXECUTE FUNCTION public.flag_anomalous_questions();

-- ─── 5. RPC: QUALITY-FIRST QUESTION SERVING ──────────────────
-- Priority 1: Verified same subtopic
-- Priority 2: Verified related subtopic (same chapter)
-- Priority 3: AI-validated high-confidence (>= 85) same chapter
CREATE OR REPLACE FUNCTION public.serve_practice_questions(
  p_student_id UUID,
  p_exam       TEXT,
  p_subject    TEXT,
  p_chapter    TEXT,
  p_subtopic   TEXT,
  p_count      INTEGER DEFAULT 10,
  p_difficulty TEXT DEFAULT 'Medium'
)
RETURNS SETOF public.questions_bank
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_attempted_ids TEXT[];
  v_return_count INTEGER := 0;
  v_cursor UUID;
BEGIN
  -- Get already attempted questions to avoid repeats
  SELECT ARRAY(
    SELECT DISTINCT question_id
    FROM public.student_activity
    WHERE student_id = p_student_id
      AND question_id IS NOT NULL
  ) INTO v_attempted_ids;

  -- Create a temporary table to hold results
  CREATE TEMP TABLE temp_questions ON COMMIT DROP AS 
  SELECT * FROM public.questions_bank LIMIT 0;

  -- 1. VERIFIED SAME SUBTOPIC
  INSERT INTO temp_questions
  SELECT * FROM public.questions_bank
  WHERE exam = p_exam
    AND subject = p_subject
    AND ncert_chapter = p_chapter
    AND subtopic = p_subtopic
    AND is_verified = true
    AND difficulty = p_difficulty
    AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
  ORDER BY random()
  LIMIT p_count;

  GET DIAGNOSTICS v_return_count = ROW_COUNT;

  -- 2. VERIFIED RELATED SUBTOPICS (Same Chapter)
  IF v_return_count < p_count THEN
    INSERT INTO temp_questions
    SELECT * FROM public.questions_bank
    WHERE exam = p_exam
      AND subject = p_subject
      AND ncert_chapter = p_chapter
      AND subtopic != p_subtopic -- other subtopics in same chapter
      AND is_verified = true
      AND difficulty = p_difficulty
      AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
      AND question_id NOT IN (SELECT question_id FROM temp_questions)
    ORDER BY random()
    LIMIT (p_count - v_return_count);
    
    SELECT COUNT(*) INTO v_return_count FROM temp_questions;
  END IF;

  -- 3. AI-VALIDATED HIGH CONFIDENCE (>= 85)
  IF v_return_count < p_count THEN
    INSERT INTO temp_questions
    SELECT * FROM public.questions_bank
    WHERE exam = p_exam
      AND subject = p_subject
      AND ncert_chapter = p_chapter
      AND quality_gate_passed = true
      AND confidence_score >= 85
      AND is_verified = false -- we already grabbed verified
      AND difficulty = p_difficulty
      AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
      AND question_id NOT IN (SELECT question_id FROM temp_questions)
    ORDER BY random()
    LIMIT (p_count - v_return_count);
  END IF;

  -- 4. If we STILL don't have enough and user selected 'Mixed' difficulty, grab any difficulty verified
  SELECT COUNT(*) INTO v_return_count FROM temp_questions;
  IF v_return_count < p_count THEN
    INSERT INTO temp_questions
    SELECT * FROM public.questions_bank
    WHERE exam = p_exam
      AND subject = p_subject
      AND ncert_chapter = p_chapter
      AND (is_verified = true OR (quality_gate_passed = true AND confidence_score >= 85))
      AND (v_attempted_ids IS NULL OR question_id != ALL(v_attempted_ids))
      AND question_id NOT IN (SELECT question_id FROM temp_questions)
    ORDER BY random()
    LIMIT (p_count - v_return_count);
  END IF;

  RETURN QUERY SELECT * FROM temp_questions;
END;
$$;
