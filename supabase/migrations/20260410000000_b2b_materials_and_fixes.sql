-- ============================================================
-- PrepEntrance B2B Fixes & Batch Materials Table
-- 20260410000000_b2b_materials_and_fixes.sql
-- ============================================================

-- 1. Add join_code and invite_link to batches if missing
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS join_code TEXT,
  ADD COLUMN IF NOT EXISTS invite_link TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_batches_join_code ON public.batches(join_code) WHERE join_code IS NOT NULL;

-- 2. Batch Materials Table
CREATE TABLE IF NOT EXISTS public.batch_materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  batch_id      UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  subject       TEXT NOT NULL,
  chapter       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf', 'link', 'video')),
  url           TEXT,
  pages         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.batch_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors manage materials"
  ON public.batch_materials FOR ALL
  USING (auth.uid() = uploaded_by OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.organization_id = batch_materials.organization_id
      AND p.user_type IN ('b2b_institution', 'admin')
  ))
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Students read materials of their batch"
  ON public.batch_materials FOR SELECT
  USING (
    batch_id IS NULL -- distributed to all
    OR EXISTS (
      SELECT 1 FROM public.batch_members bm
      WHERE bm.batch_id = batch_materials.batch_id
        AND bm.student_id = auth.uid()
    )
  );

-- 3. Fix assessment_sessions: add ACTIVE to allowed statuses (B2BTests.tsx uses ACTIVE)
ALTER TABLE public.assessment_sessions
  DROP CONSTRAINT IF EXISTS assessment_sessions_status_check;

ALTER TABLE public.assessment_sessions
  ADD CONSTRAINT assessment_sessions_status_check
    CHECK (status IN ('PENDING', 'ACTIVE', 'LIVE', 'COMPLETED'));

-- 4. Add metadata column to assessment_sessions if missing
ALTER TABLE public.assessment_sessions
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 5. Allow batch_members self-insert (students joining via link)
DROP POLICY IF EXISTS "Students can join batches" ON public.batch_members;
CREATE POLICY "Students can join batches"
  ON public.batch_members FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can see their own batch memberships
DROP POLICY IF EXISTS "Students see own memberships" ON public.batch_members;
CREATE POLICY "Students see own memberships"
  ON public.batch_members FOR SELECT
  USING (auth.uid() = student_id);

-- 6. Allow batches to be selected by join_code (for anonymous/unauthenticated lookup in JoinBatchPage)
DROP POLICY IF EXISTS "Public can lookup active batches by invite" ON public.batches;
CREATE POLICY "Public can lookup active batches by invite"
  ON public.batches FOR SELECT
  USING (is_active = true);
