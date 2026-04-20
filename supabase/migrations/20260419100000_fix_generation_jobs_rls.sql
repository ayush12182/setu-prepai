-- ============================================================
-- Update RLS for bulk_generation_jobs
-- 20260419100000_fix_generation_jobs_rls.sql
-- ============================================================

-- Allow authenticated users to create their own generation jobs
DROP POLICY IF EXISTS "Anyone can create generation jobs" ON public.bulk_generation_jobs;
CREATE POLICY "Anyone can create generation jobs" ON public.bulk_generation_jobs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own jobs
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.bulk_generation_jobs;
CREATE POLICY "Users can view their own jobs" ON public.bulk_generation_jobs
  FOR SELECT
  USING (auth.uid() = created_by OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type IN ('admin', 'b2b_mentor')
  ));

-- Allow users to update their own jobs (needed for status updates)
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.bulk_generation_jobs;
CREATE POLICY "Users can update their own jobs" ON public.bulk_generation_jobs
  FOR UPDATE
  USING (auth.uid() = created_by OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type IN ('admin', 'b2b_mentor')
  ));

-- Force schema reload
NOTIFY pgrst, 'reload schema';
