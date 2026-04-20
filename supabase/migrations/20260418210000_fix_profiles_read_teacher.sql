-- ============================================================
-- Fix profiles RLS: allow students to read their teacher's profile
-- 20260418210000_fix_profiles_read_teacher.sql
-- ============================================================
-- Problem: The existing RLS policy only allows users to read their OWN
-- profile. Students querying their teacher's profile get empty results,
-- causing the teacher name to fall back to "Your Teacher".
--
-- Fix: Add a SELECT policy that allows a user to read profiles belonging
-- to people they are linked to (teacher → student via student_teacher_links,
-- or batch mentor → student via batch_members).

-- Policy: students can read profiles of their linked teachers
DROP POLICY IF EXISTS "students_can_read_teacher_profiles" ON public.profiles;
CREATE POLICY "students_can_read_teacher_profiles" ON public.profiles
  FOR SELECT
  USING (
    -- The profile owner is viewing their own profile (existing rule)
    auth.uid() = user_id
    OR
    -- A student can read profiles of teachers they are linked to
    EXISTS (
      SELECT 1 FROM public.student_teacher_links stl
      WHERE stl.teacher_id = profiles.user_id
        AND stl.student_id = auth.uid()
        AND stl.is_active = true
    )
    OR
    -- A student can read profiles of batch mentors they belong to
    EXISTS (
      SELECT 1 
      FROM public.batch_members bm
      JOIN public.batches b ON b.id = bm.batch_id
      WHERE b.mentor_id = profiles.user_id
        AND bm.student_id = auth.uid()
    )
    OR
    -- A teacher can read profiles of their linked students
    EXISTS (
      SELECT 1 FROM public.student_teacher_links stl
      WHERE stl.student_id = profiles.user_id
        AND stl.teacher_id = auth.uid()
        AND stl.is_active = true
    )
  );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
