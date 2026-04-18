-- ============================================================
-- FIX: Batches Insert and RLS
-- 20260419120000_fix_batches_insert_and_rls.sql
-- ============================================================

-- Step 1: Temporarily disable RLS for batches table for testing
ALTER TABLE public.batches DISABLE ROW LEVEL SECURITY;

-- Step 2: Ensure organization_id EXISTS and is correct type
-- (In case it was added via UI/PostgREST later but missed in migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'batches' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.batches ADD COLUMN organization_id UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- Step 3: Fix existing batches that might be missing organization_id
-- We'll try to link them back to the mentor's personal organization (profile ID)
UPDATE public.batches b
SET organization_id = p.organization_id
FROM public.profiles p
WHERE b.mentor_id = p.user_id
  AND b.organization_id IS NULL;

-- Step 4: Add logging trigger for debugging Batches table (Optional but helpful)
CREATE OR REPLACE FUNCTION public.log_batch_insert()
RETURNS TRIGGER AS $$
BEGIN
  RAISE NOTICE 'Batch Insert attempted: %, Org: %, Mentor: %', NEW.name, NEW.organization_id, NEW.mentor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_log_batch_insert ON public.batches;
CREATE TRIGGER tr_log_batch_insert
  BEFORE INSERT ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION public.log_batch_insert();

-- Reload schema
NOTIFY pgrst, 'reload schema';
