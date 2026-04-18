-- ============================================================
-- SETU B2B Batches System Fix
-- 20260418100000_fix_batches_system.sql
-- ============================================================

-- ─── 1. Ensure batches has all required columns ─────────────
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS target_exam TEXT;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS join_code TEXT;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS mentor_id UUID;
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS description TEXT;

-- ─── 2. Unique constraint on join_code ───────────────────────
-- Allows NULL but enforces uniqueness on non-null values
CREATE UNIQUE INDEX IF NOT EXISTS batches_join_code_key
  ON public.batches (join_code)
  WHERE join_code IS NOT NULL;

-- ─── 3. RLS — teachers can manage their own batches ──────────
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_batches" ON public.batches;
CREATE POLICY "teachers_manage_own_batches" ON public.batches
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "org_members_view_batches" ON public.batches;
CREATE POLICY "org_members_view_batches" ON public.batches
  FOR SELECT USING (
    auth.uid() = mentor_id
    OR organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- ─── 4. Students can look up batches by join code ─────────────
DROP POLICY IF EXISTS "students_join_by_code" ON public.batches;
CREATE POLICY "students_join_by_code" ON public.batches
  FOR SELECT USING (
    join_code IS NOT NULL
    AND is_active = true
  );

-- ─── 5. batch_members RLS ────────────────────────────────────
ALTER TABLE public.batch_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_see_own_memberships" ON public.batch_members;
CREATE POLICY "students_see_own_memberships" ON public.batch_members
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "students_join_batch" ON public.batch_members;
CREATE POLICY "students_join_batch" ON public.batch_members
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "teachers_see_batch_members" ON public.batch_members;
CREATE POLICY "teachers_see_batch_members" ON public.batch_members
  FOR SELECT USING (
    batch_id IN (
      SELECT id FROM public.batches WHERE mentor_id = auth.uid()
    )
  );

-- ─── 6. Reload schema ────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
