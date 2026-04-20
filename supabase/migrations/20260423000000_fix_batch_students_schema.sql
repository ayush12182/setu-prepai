-- Fix batch_students schema mismatch (auth.users vs profiles)
-- This ensures the system uses internal profile UUIDs for joins

-- 1. Drop existing policies to allow schema changes
DROP POLICY IF EXISTS "students_join_flow" ON public.batch_students;
DROP POLICY IF EXISTS "coaching_students_insert_own" ON public.batch_students;

-- 2. Drop all potential legacy constraints targeting student_id
-- Ensures both new and old naming conventions are cleared
ALTER TABLE IF EXISTS public.batch_students 
    DROP CONSTRAINT IF EXISTS batch_students_student_id_fkey,
    DROP CONSTRAINT IF EXISTS batch_members_student_id_fkey;

-- 3. Dynamic Cleanup (Catch-all for any other hidden FKs on student_id)
DO $$
DECLARE
    r record;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'batch_students' AND column_name = 'student_id'
        AND constraint_name != 'batch_students_pkey'
    ) LOOP
        EXECUTE 'ALTER TABLE public.batch_students DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 4. Gracefully migrate existing students from 'user_id' mapping to 'profile_id' mapping
UPDATE public.batch_students bs
SET student_id = p.id
FROM public.profiles p
WHERE bs.student_id = p.user_id;

-- 5. REMOVE ORPHANS: Delete any records that still don't have a profile
DELETE FROM public.batch_students 
WHERE student_id NOT IN (SELECT id FROM public.profiles);

-- 6. Apply the definitive constraint targeting profiles(id)
ALTER TABLE public.batch_students 
    ADD CONSTRAINT batch_students_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. Implement the corrected RLS Policy
CREATE POLICY "students_join_flow" ON public.batch_students 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = batch_students.student_id 
            AND profiles.user_id = auth.uid()
        )
    );

ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
