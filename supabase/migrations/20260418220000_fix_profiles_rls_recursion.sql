-- ============================================================
-- EMERGENCY FIX: Drop recursive RLS policy on profiles
-- 20260418220000_fix_profiles_rls_recursion.sql
-- ============================================================
-- The previous policy used EXISTS subqueries that joined back to
-- profiles (via student_teacher_links → profiles), causing Postgres
-- to detect infinite recursion.
--
-- Fix: Use SECURITY DEFINER helper functions that bypass RLS
-- when doing the existence checks, breaking the recursion cycle.

-- Step 1: Drop the broken recursive policy
DROP POLICY IF EXISTS "students_can_read_teacher_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Step 2: Create helper functions (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.can_read_profile(_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- own profile
    auth.uid() = _target_user_id
    OR
    -- student reading their teacher's profile
    EXISTS (
      SELECT 1 FROM public.student_teacher_links
      WHERE teacher_id = _target_user_id
        AND student_id = auth.uid()
        AND is_active = true
    )
    OR
    -- student reading their batch mentor's profile
    EXISTS (
      SELECT 1
      FROM public.batch_members bm
      JOIN public.batches b ON b.id = bm.batch_id
      WHERE b.mentor_id = _target_user_id
        AND bm.student_id = auth.uid()
    )
    OR
    -- teacher reading their student's profile
    EXISTS (
      SELECT 1 FROM public.student_teacher_links
      WHERE student_id = _target_user_id
        AND teacher_id = auth.uid()
        AND is_active = true
    )
  );
$$;

-- Step 3: Recreate the SELECT policy using the helper (no direct profile join)
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  USING (public.can_read_profile(user_id));

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
