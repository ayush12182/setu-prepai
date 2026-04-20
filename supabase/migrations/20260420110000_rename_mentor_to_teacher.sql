-- ============================================================
-- REFACTOR: Rename mentor_id to teacher_id for B2B Standardization
-- 20260420110000_rename_mentor_to_teacher.sql
-- ============================================================

DO $$ 
BEGIN
    -- Rename column in batches table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'mentor_id') THEN
        ALTER TABLE public.batches RENAME COLUMN mentor_id TO teacher_id;
    END IF;

    -- Update RPC function create_batch_v2 to use p_teacher_id
    DROP FUNCTION IF EXISTS public.create_batch_v2(text, uuid, text, text, text, text);
    
    CREATE OR REPLACE FUNCTION public.create_batch_v2(
      p_name TEXT,
      p_teacher_id UUID,
      p_join_code TEXT,
      p_target_exam TEXT DEFAULT 'JEE_MAINS',
      p_description TEXT DEFAULT '',
      p_subject TEXT DEFAULT 'All Subjects'
    )
    RETURNS TABLE (
      id UUID,
      name TEXT,
      teacher_id UUID,
      join_code TEXT,
      target_exam TEXT,
      description TEXT,
      subject TEXT,
      created_at TIMESTAMPTZ
    ) AS $$
    BEGIN
      RETURN QUERY
      INSERT INTO public.batches (
        name, 
        teacher_id, 
        join_code, 
        target_exam, 
        description, 
        subject
      )
      VALUES (
        p_name, 
        p_teacher_id, 
        p_join_code, 
        p_target_exam, 
        p_description, 
        p_subject
      )
      RETURNING 
        public.batches.id, 
        public.batches.name, 
        public.batches.teacher_id, 
        public.batches.join_code, 
        public.batches.target_exam, 
        public.batches.description, 
        public.batches.subject, 
        public.batches.created_at;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

END $$;
