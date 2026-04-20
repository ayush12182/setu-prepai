-- ============================================================
-- DEFINITIVE: Batch + Student Join System (FOLLOWING SPEC)
-- 20260421000000_definitive_batch_spec.sql
-- ============================================================

DO $$ 
BEGIN
    -- 1. Ensure 'batches' table follows the spec exactly
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batches') THEN
        CREATE TABLE public.batches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            target_exam TEXT DEFAULT 'JEE_MAINS',
            description TEXT,
            mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- references auth.users for top-level join
            join_code TEXT UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    ELSE
        -- Rename column back to mentor_id if it was renamed to teacher_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'teacher_id') THEN
            ALTER TABLE public.batches RENAME COLUMN teacher_id TO mentor_id;
        END IF;
    END IF;

    -- 2. Create 'batch_students' table per spec
    -- Rename legacy 'batch_members' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_members') THEN
        ALTER TABLE public.batch_members RENAME TO batch_students;
        
        -- Ensure columns match spec
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batch_students' AND column_name = 'created_at') THEN
            ALTER TABLE public.batch_students RENAME COLUMN created_at TO joined_at;
        END IF;
    ELSE
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batch_students') THEN
            CREATE TABLE public.batch_students (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
                student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                UNIQUE(batch_id, student_id)
            );
        END IF;
    END IF;

    -- 3. Update create_batch_v2 to follow mentor_id spec
    DROP FUNCTION IF EXISTS public.create_batch_v2(text, uuid, text, text, text, text);
    CREATE OR REPLACE FUNCTION public.create_batch_v2(
      p_name TEXT,
      p_mentor_id UUID,
      p_join_code TEXT,
      p_target_exam TEXT DEFAULT 'JEE_MAINS',
      p_description TEXT DEFAULT '',
      p_subject TEXT DEFAULT 'All Subjects'
    )
    RETURNS TABLE (
      id UUID,
      name TEXT,
      mentor_id UUID,
      join_code TEXT,
      target_exam TEXT,
      description TEXT,
      created_at TIMESTAMPTZ
    ) AS $$
    BEGIN
      RETURN QUERY
      INSERT INTO public.batches (name, mentor_id, join_code, target_exam, description)
      VALUES (p_name, p_mentor_id, p_join_code, p_target_exam, p_description)
      RETURNING public.batches.id, public.batches.name, public.batches.mentor_id, public.batches.join_code, public.batches.target_exam, public.batches.description, public.batches.created_at;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Force reload schema
    EXECUTE 'NOTIFY pgrst, ''reload schema''';

END $$;
