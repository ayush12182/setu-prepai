-- Force schema cache reload and ensure tables exist
-- We run a simple check just to ensure Supabase recognizes a DDL change
-- and refreshes the PostgREST cache.

CREATE TABLE IF NOT EXISTS public.teacher_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT UNIQUE NOT NULL,
  label         TEXT,                                          
  exam_type     TEXT NOT NULL CHECK (exam_type IN ('JEE_MAINS','JEE_ADVANCED','NEET','CUET','OTHER')),
  subject       TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  max_students  INTEGER,
  joined_count  INTEGER DEFAULT 0
);
ALTER TABLE public.teacher_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_manage_own_codes" ON public.teacher_codes;
CREATE POLICY "teachers_manage_own_codes" ON public.teacher_codes
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "students_read_codes_for_join" ON public.teacher_codes;
CREATE POLICY "students_read_codes_for_join" ON public.teacher_codes
  FOR SELECT USING (is_active = true);

-- Force schema reload for PostgREST
NOTIFY pgrst, 'reload schema';
