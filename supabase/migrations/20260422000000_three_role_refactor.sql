-- 3-Role System Refactor: Admin, Teacher, Student
-- 1. Standardization of Roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('admin', 'teacher', 'student'));

-- 2. Rename mentor_id to teacher_id for SPEC compliance
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'mentor_id') THEN
    ALTER TABLE public.batches RENAME COLUMN mentor_id TO teacher_id;
  END IF;
END $$;

-- 3. Locking down Batch Creation for Admin only
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all_access" ON public.batches;
CREATE POLICY "admins_all_access" ON public.batches 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

DROP POLICY IF EXISTS "teachers_view_own" ON public.batches;
CREATE POLICY "teachers_view_own" ON public.batches 
    FOR SELECT USING (teacher_id = auth.uid());

-- 4. Unified Batch Students Join Permission
ALTER TABLE public.batch_students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_join_flow" ON public.batch_students;
CREATE POLICY "students_join_flow" ON public.batch_students 
    FOR INSERT WITH CHECK (auth.uid() = student_id);

NOTIFY pgrst, 'reload schema';
