-- ============================================================
-- SIMPLIFY: Remove organization_id requirement for Batches
-- 20260421000000_simplify_batch_system.sql
-- ============================================================

-- 1. Make organization_id nullable in batches
ALTER TABLE public.batches ALTER COLUMN organization_id DROP NOT NULL;

-- 2. Update RLS policies to focus primarily on mentor_id
DROP POLICY IF EXISTS "select_batches_v3" ON public.batches;
CREATE POLICY "select_batches_v4" ON public.batches
    FOR SELECT USING (
        auth.uid() = mentor_id 
        OR (join_code IS NOT NULL AND is_active = true)
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = batches.organization_id
              AND batches.organization_id IS NOT NULL
        )
    );

DROP POLICY IF EXISTS "insert_batches_v3" ON public.batches;
CREATE POLICY "insert_batches_v4" ON public.batches
    FOR INSERT WITH CHECK (
        auth.uid() = mentor_id
    );

DROP POLICY IF EXISTS "update_batches_v3" ON public.batches;
CREATE POLICY "update_batches_v4" ON public.batches
    FOR UPDATE USING (
        auth.uid() = mentor_id
    );

-- 3. Reload cache
NOTIFY pgrst, 'reload schema';
