-- ══════════════════════════════════════════════════════════════════
-- PrepEntrance — Add Subject Diagnostic Levels to student_profiles
-- Migration: 20260531000000_add_subject_levels.sql
-- ══════════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='physics_level') THEN
    ALTER TABLE public.student_profiles ADD COLUMN physics_level TEXT DEFAULT 'Intermediate' CHECK (physics_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='chemistry_level') THEN
    ALTER TABLE public.student_profiles ADD COLUMN chemistry_level TEXT DEFAULT 'Intermediate' CHECK (chemistry_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='maths_level') THEN
    ALTER TABLE public.student_profiles ADD COLUMN maths_level TEXT DEFAULT 'Intermediate' CHECK (maths_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_profiles' AND column_name='biology_level') THEN
    ALTER TABLE public.student_profiles ADD COLUMN biology_level TEXT DEFAULT 'Intermediate' CHECK (biology_level IN ('Beginner', 'Intermediate', 'Advanced'));
  END IF;
END $$;

-- Refresh postgrest schema cache
NOTIFY pgrst, 'reload schema';
