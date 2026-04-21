-- ============================================================
-- FIX: Join Code Validation + Student Join Flow
-- 20260426000000_fix_join_code_flow.sql
-- ============================================================

-- ── 1. Allow any authenticated user to read batches by join_code ──────────
--    Needed so students can look up a batch before they have a profile link.
DROP POLICY IF EXISTS "anyone_lookup_by_join_code" ON public.batches;
CREATE POLICY "anyone_lookup_by_join_code" ON public.batches
  FOR SELECT
  USING (join_code IS NOT NULL);

-- ── 2. Allow authenticated students to INSERT into student_batch_map ──────
DROP POLICY IF EXISTS "authenticated_students_can_join" ON public.student_batch_map;
CREATE POLICY "authenticated_students_can_join" ON public.student_batch_map
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- ── 3. SECURITY DEFINER RPC: validate a join code (bypasses RLS) ─────────
--    Returns 1 row if valid, 0 rows if not found / inactive.
CREATE OR REPLACE FUNCTION public.validate_batch_code(p_code TEXT)
RETURNS TABLE (
  batch_id      UUID,
  batch_name    TEXT,
  teacher_name  TEXT,
  exam_type     TEXT,
  total_students BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch   RECORD;
  v_teacher RECORD;
  v_count   BIGINT;
BEGIN
  SELECT id, name, teacher_id, target_exam, is_active
  INTO   v_batch
  FROM   public.batches
  WHERE  join_code = UPPER(TRIM(p_code))
  LIMIT  1;

  -- Not found or inactive → return empty (caller treats as invalid)
  IF v_batch.id IS NULL THEN RETURN; END IF;
  IF v_batch.is_active = FALSE THEN RETURN; END IF;

  -- Teacher display name
  SELECT institution_name, full_name
  INTO   v_teacher
  FROM   public.profiles
  WHERE  user_id = v_batch.teacher_id
  LIMIT  1;

  -- Current student count
  SELECT COUNT(*) INTO v_count
  FROM   public.student_batch_map
  WHERE  batch_id = v_batch.id;

  RETURN QUERY SELECT
    v_batch.id,
    v_batch.name::TEXT,
    COALESCE(v_teacher.institution_name, v_teacher.full_name, 'Your Teacher')::TEXT,
    COALESCE(v_batch.target_exam, 'JEE')::TEXT,
    v_count;
END;
$$;

-- ── 4. SECURITY DEFINER RPC: student joins a batch ────────────────────────
--    Inserts into student_batch_map and updates profile, bypassing RLS.
CREATE OR REPLACE FUNCTION public.student_join_batch(
  p_code       TEXT,
  p_student_id UUID
)
RETURNS TABLE (
  batch_id     UUID,
  batch_name   TEXT,
  teacher_name TEXT,
  exam_type    TEXT,
  total_students BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch   RECORD;
  v_teacher RECORD;
  v_count   BIGINT;
BEGIN
  SELECT id, name, teacher_id, target_exam, is_active
  INTO   v_batch
  FROM   public.batches
  WHERE  join_code = UPPER(TRIM(p_code))
  LIMIT  1;

  IF v_batch.id IS NULL THEN RETURN; END IF;
  IF v_batch.is_active = FALSE THEN RETURN; END IF;

  -- Idempotent join
  INSERT INTO public.student_batch_map (student_id, batch_id)
  VALUES (p_student_id, v_batch.id)
  ON CONFLICT (student_id, batch_id) DO NOTHING;

  -- Link student → teacher
  UPDATE public.profiles
  SET    teacher_id = v_batch.teacher_id
  WHERE  user_id = p_student_id;

  -- Seed leaderboard row
  INSERT INTO public.batch_leaderboard (student_id, batch_id, score, accuracy, questions_attempted, consistency_score)
  VALUES (p_student_id, v_batch.id, 0, 0, 0, 0)
  ON CONFLICT (student_id, batch_id) DO NOTHING;

  -- Refresh ranks (non-fatal)
  BEGIN
    PERFORM public.refresh_batch_ranks(v_batch.id);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Final count
  SELECT COUNT(*) INTO v_count
  FROM   public.student_batch_map
  WHERE  batch_id = v_batch.id;

  SELECT institution_name, full_name
  INTO   v_teacher
  FROM   public.profiles
  WHERE  user_id = v_batch.teacher_id
  LIMIT  1;

  RETURN QUERY SELECT
    v_batch.id,
    v_batch.name::TEXT,
    COALESCE(v_teacher.institution_name, v_teacher.full_name, 'Your Teacher')::TEXT,
    COALESCE(v_batch.target_exam, 'JEE')::TEXT,
    v_count;
END;
$$;

-- ── 5. Grant execute rights to authenticated users ────────────────────────
GRANT EXECUTE ON FUNCTION public.validate_batch_code(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.student_join_batch(TEXT, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
