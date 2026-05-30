-- ============================================================
-- PrepEntrance B2B Full Fix Migration
-- 20260415200000_b2b_full_fix.sql
-- ============================================================

-- ─── 1. ENSURE teacher_codes exists (idempotent) ─────────────
CREATE TABLE IF NOT EXISTS public.teacher_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT UNIQUE NOT NULL,
  label         TEXT,
  exam_type     TEXT NOT NULL DEFAULT 'JEE_MAINS' CHECK (exam_type IN ('JEE_MAINS','JEE_ADVANCED','NEET','CUET','OTHER')),
  subject       TEXT NOT NULL DEFAULT 'General',
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

DROP POLICY IF EXISTS "students_read_active_codes" ON public.teacher_codes;
CREATE POLICY "students_read_active_codes" ON public.teacher_codes
  FOR SELECT USING (is_active = true);

-- ─── 2. ENSURE student_teacher_links exists (idempotent) ─────
CREATE TABLE IF NOT EXISTS public.student_teacher_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_used   TEXT NOT NULL,
  exam_type   TEXT NOT NULL DEFAULT 'OTHER',
  subject     TEXT NOT NULL DEFAULT 'General',
  joined_at   TIMESTAMPTZ DEFAULT now(),
  is_active   BOOLEAN DEFAULT true,
  UNIQUE(student_id, teacher_id, subject)
);
ALTER TABLE public.student_teacher_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_see_own_links" ON public.student_teacher_links;
CREATE POLICY "students_see_own_links" ON public.student_teacher_links
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "teachers_see_their_students_stl" ON public.student_teacher_links;
CREATE POLICY "teachers_see_their_students_stl" ON public.student_teacher_links
  FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "students_insert_links" ON public.student_teacher_links;
CREATE POLICY "students_insert_links" ON public.student_teacher_links
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ─── 3. generate_teacher_code helper ─────────────────────────
CREATE OR REPLACE FUNCTION public.generate_teacher_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

-- ─── 4. get_b2b_overview_stats RPC ───────────────────────────
-- Used by Overview.tsx
CREATE OR REPLACE FUNCTION public.get_b2b_overview_stats(p_organization_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_total_students  INTEGER := 0;
  v_active_batches  INTEGER := 0;
  v_tests_created   INTEGER := 0;
  v_avg_accuracy    FLOAT   := 0;
  v_batches         JSONB   := '[]'::JSONB;
  v_topic_accuracy  JSONB   := '[]'::JSONB;
BEGIN
  -- Total students across all batches
  SELECT COUNT(DISTINCT bm.student_id)
  INTO v_total_students
  FROM public.batch_members bm
  JOIN public.batches b ON b.id = bm.batch_id
  WHERE b.organization_id = p_organization_id
    AND b.is_active = true;

  -- Active batches
  SELECT COUNT(*)
  INTO v_active_batches
  FROM public.batches
  WHERE organization_id = p_organization_id
    AND is_active = true;

  -- Tests created
  SELECT COUNT(*)
  INTO v_tests_created
  FROM public.assessment_sessions asm
  JOIN public.batches b ON b.id = asm.batch_id
  WHERE b.organization_id = p_organization_id;

  -- Average accuracy across all submitted sessions
  SELECT COALESCE(AVG(sp.live_accuracy), 0)
  INTO v_avg_accuracy
  FROM public.session_participants sp
  JOIN public.assessment_sessions asm ON asm.id = sp.session_id
  JOIN public.batches b ON b.id = asm.batch_id
  WHERE b.organization_id = p_organization_id
    AND sp.status = 'SUBMITTED';

  -- Batch health list
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'students', (SELECT COUNT(*) FROM public.batch_members WHERE batch_id = b.id),
      'avgAccuracy', COALESCE((
        SELECT ROUND(AVG(sp.live_accuracy))
        FROM public.session_participants sp
        JOIN public.assessment_sessions asm ON asm.id = sp.session_id
        WHERE asm.batch_id = b.id AND sp.status = 'SUBMITTED'
      ), 0)
    )
  ), '[]'::JSONB)
  INTO v_batches
  FROM public.batches b
  WHERE b.organization_id = p_organization_id
    AND b.is_active = true;

  -- Topic accuracy (from student_activity if available)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'topic', topic,
      'accuracy', ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END))
    ) ORDER BY topic
  ), '[]'::JSONB)
  INTO v_topic_accuracy
  FROM public.student_activity sa
  JOIN public.batch_members bm ON bm.student_id = sa.student_id
  JOIN public.batches b ON b.id = bm.batch_id
  WHERE b.organization_id = p_organization_id
  GROUP BY topic
  HAVING COUNT(*) >= 3
  LIMIT 8;

  RETURN jsonb_build_object(
    'totalStudents', v_total_students,
    'activeBatches', v_active_batches,
    'testsCreated', v_tests_created,
    'avgAccuracy', ROUND(v_avg_accuracy),
    'batches', v_batches,
    'topicAccuracy', v_topic_accuracy
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_b2b_overview_stats(UUID) TO authenticated;

-- ─── 5. Force PostgREST schema cache reload ──────────────────
NOTIFY pgrst, 'reload schema';
