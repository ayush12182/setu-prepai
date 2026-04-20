-- ============================================================
-- SETU Analytics Bridge — Full Schema Migration
-- 20260408_analytics_bridge.sql
-- ============================================================

-- ─── 1. TEACHER CODES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teacher_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT UNIQUE NOT NULL,
  label         TEXT,                                          -- "Morning Batch JEE" etc.
  exam_type     TEXT NOT NULL CHECK (exam_type IN ('JEE_MAINS','JEE_ADVANCED','NEET','CUET','OTHER')),
  subject       TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  max_students  INTEGER,
  joined_count  INTEGER DEFAULT 0
);
ALTER TABLE public.teacher_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_codes" ON public.teacher_codes;
CREATE POLICY "teachers_manage_own_codes" ON public.teacher_codes
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "students_read_codes_for_join" ON public.teacher_codes;
CREATE POLICY "students_read_codes_for_join" ON public.teacher_codes
  FOR SELECT USING (is_active = true);

-- ─── 2. STUDENT-TEACHER LINKS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_teacher_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_used   TEXT NOT NULL,
  exam_type   TEXT NOT NULL,
  subject     TEXT NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  is_active   BOOLEAN DEFAULT true,
  UNIQUE(student_id, teacher_id, subject)
);
ALTER TABLE public.student_teacher_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_see_own_links" ON public.student_teacher_links;
CREATE POLICY "students_see_own_links" ON public.student_teacher_links
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "teachers_see_their_students" ON public.student_teacher_links;
CREATE POLICY "teachers_see_their_students" ON public.student_teacher_links
  FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "students_insert_links" ON public.student_teacher_links;
CREATE POLICY "students_insert_links" ON public.student_teacher_links
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ─── 3. STUDENT ACTIVITY ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_activity (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id          UUID REFERENCES auth.users(id),
  question_id         TEXT,
  exam_type           TEXT CHECK (exam_type IN ('JEE_MAINS','JEE_ADVANCED','NEET','CUET','OTHER')),
  subject             TEXT NOT NULL,
  topic               TEXT NOT NULL,
  subtopic            TEXT,
  question_type       TEXT CHECK (question_type IN ('MCQ','Numerical','Assertion-Reason','Multi-correct','True-False','Match-Following')),
  difficulty          TEXT CHECK (difficulty IN ('Easy','Medium','Hard')),
  exam_stage          TEXT DEFAULT 'practice' CHECK (exam_stage IN ('practice','mock_test','chapter_test','previous_year')),
  is_correct          BOOLEAN NOT NULL,
  time_spent_seconds  INTEGER,
  attempted_at        TIMESTAMPTZ DEFAULT now(),
  marks_obtained      FLOAT DEFAULT 0,
  marks_possible      FLOAT DEFAULT 4,
  negative_marking    BOOLEAN DEFAULT false
);
ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_log_own_activity" ON public.student_activity;
CREATE POLICY "students_log_own_activity" ON public.student_activity
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "students_read_own_activity" ON public.student_activity;
CREATE POLICY "students_read_own_activity" ON public.student_activity
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "teachers_read_student_activity" ON public.student_activity;
CREATE POLICY "teachers_read_student_activity" ON public.student_activity
  FOR SELECT USING (auth.uid() = teacher_id);

-- Enable realtime
ALTER TABLE public.student_activity REPLICA IDENTITY FULL;

-- ─── 4. TEACHER NOTES V2 ─────────────────────────────────────
-- (named v2 to avoid conflict with existing teacher_notes table)
CREATE TABLE IF NOT EXISTS public.teacher_student_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.teacher_student_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_notes" ON public.teacher_student_notes;
CREATE POLICY "teachers_manage_own_notes" ON public.teacher_student_notes
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- ─── 5. EXTEND student_profiles ──────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='weak_topics') THEN
    ALTER TABLE public.student_profiles ADD COLUMN weak_topics TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='strong_topics') THEN
    ALTER TABLE public.student_profiles ADD COLUMN strong_topics TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='last_active') THEN
    ALTER TABLE public.student_profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='target_exam') THEN
    ALTER TABLE public.student_profiles ADD COLUMN target_exam TEXT;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- student_profiles table doesn't exist yet — create it
  CREATE TABLE public.student_profiles (
    student_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT,
    target_exam     TEXT,
    total_questions INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    accuracy_pct    FLOAT DEFAULT 0,
    weak_topics     TEXT[] DEFAULT '{}',
    strong_topics   TEXT[] DEFAULT '{}',
    last_active     TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "students_manage_own_profile" ON public.student_profiles
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);
  CREATE POLICY "teachers_read_student_profiles" ON public.student_profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.student_teacher_links
        WHERE student_id = student_profiles.student_id
          AND teacher_id = auth.uid()
          AND is_active = true
      )
    );
END $$;

-- ─── 6. TRIGGER: Auto-update student_profiles on new activity ─
CREATE OR REPLACE FUNCTION public.update_student_profile_on_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_weak   TEXT[];
  v_strong TEXT[];
  v_total  INTEGER;
  v_correct INTEGER;
  v_time   INTEGER;
BEGIN
  SELECT 
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    COALESCE(SUM(time_spent_seconds), 0)
  INTO v_total, v_correct, v_time
  FROM public.student_activity
  WHERE student_id = NEW.student_id;

  -- Weak topics: >40% error rate with min 3 attempts
  SELECT ARRAY(
    SELECT topic 
    FROM public.student_activity
    WHERE student_id = NEW.student_id
    GROUP BY topic
    HAVING COUNT(*) >= 3
      AND (SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) > 0.40
    ORDER BY (SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) DESC
    LIMIT 10
  ) INTO v_weak;

  -- Strong topics: >75% accuracy with min 5 attempts
  SELECT ARRAY(
    SELECT topic 
    FROM public.student_activity
    WHERE student_id = NEW.student_id
    GROUP BY topic
    HAVING COUNT(*) >= 5
      AND (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) > 0.75
    ORDER BY (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*)) DESC
    LIMIT 10
  ) INTO v_strong;

  INSERT INTO public.student_profiles (
    student_id, total_questions, total_time_seconds, 
    accuracy_pct, weak_topics, strong_topics, last_active
  ) VALUES (
    NEW.student_id,
    v_total,
    v_time,
    CASE WHEN v_total > 0 THEN (v_correct::FLOAT / v_total * 100) ELSE 0 END,
    COALESCE(v_weak, '{}'),
    COALESCE(v_strong, '{}'),
    now()
  )
  ON CONFLICT (student_id) DO UPDATE SET
    total_questions    = EXCLUDED.total_questions,
    total_time_seconds = EXCLUDED.total_time_seconds,
    accuracy_pct       = EXCLUDED.accuracy_pct,
    weak_topics        = EXCLUDED.weak_topics,
    strong_topics      = EXCLUDED.strong_topics,
    last_active        = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_student_profile ON public.student_activity;
CREATE TRIGGER trg_update_student_profile
  AFTER INSERT ON public.student_activity
  FOR EACH ROW EXECUTE FUNCTION public.update_student_profile_on_activity();

-- ─── 7. Enable Realtime ───────────────────────────────────────
-- Run these in Supabase dashboard > Database > Replication if the below fails
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity;
EXCEPTION WHEN OTHERS THEN
  NULL; -- already added or publication doesn't exist
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_teacher_links;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─── 8. Helper: Generate unique teacher code ──────────────────
CREATE OR REPLACE FUNCTION public.generate_teacher_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I
  code TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.teacher_codes WHERE teacher_codes.code = code);
    attempts := attempts + 1;
    IF attempts > 100 THEN RAISE EXCEPTION 'Could not generate unique code'; END IF;
  END LOOP;
  RETURN code;
END;
$$;
