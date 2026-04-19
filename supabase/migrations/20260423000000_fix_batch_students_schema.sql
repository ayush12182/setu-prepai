-- Fix batch_students schema mismatch (auth.users vs profiles)
-- This ensures the system uses internal profile UUIDs for joins

-- 1. Drop existing policies to allow schema changes
DROP POLICY IF EXISTS "students_join_flow" ON public.batch_students;
DROP POLICY IF EXISTS "coaching_students_insert_own" ON public.batch_students;

-- 2. Drop existing FK constraint targeting auth.users
ALTER TABLE public.batch_students DROP CONSTRAINT IF EXISTS batch_students_student_id_fkey;

-- 3. Update the column to reference public.profiles(id)
-- Note: If data exists, this will fail if existing IDs are auth.users.id
-- We attempt a graceful migration of existing data if possible
DO $$ 
BEGIN
    -- Check if student_id currently contains IDs that don't exist in profiles.id but do exist in profiles.user_id
    UPDATE public.batch_students bs
    SET student_id = p.id
    FROM public.profiles p
    WHERE bs.student_id = p.user_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = bs.student_id);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping data migration: %', SQLERRM;
END $$;

-- 4. Re-add the constraint targeting profiles(id)
ALTER TABLE public.batch_students 
    ADD CONSTRAINT batch_students_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Implement the corrected RLS Policy
-- This policy allows a user to insert into batch_students IF the student_id provided
-- belongs to a profile that is owned by their auth.uid().
CREATE POLICY "students_join_flow" ON public.batch_students 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = batch_students.student_id 
            AND profiles.user_id = auth.uid()
        )
    );

-- 6. Grant access to authenticated users
ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
