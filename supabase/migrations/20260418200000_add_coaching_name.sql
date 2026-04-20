-- ============================================================
-- Add coaching_name to profiles
-- 20260418200000_add_coaching_name.sql
-- ============================================================
-- Allows teachers to set a coaching brand name (e.g. "Physics Wallah")
-- that is shown to students as "Teacher Name — Coaching Name"

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'coaching_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN coaching_name TEXT;
  END IF;
END $$;

-- Reload PostgREST schema cache so the column is immediately queryable
NOTIFY pgrst, 'reload schema';
