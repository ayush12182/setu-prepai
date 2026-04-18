-- ============================================================
-- FINALIZE: Batches System and Permissions
-- 20260420000000_finalize_batches_system.sql
-- ============================================================

-- 1. Ensure Table Exists with Correct Structure
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT,
    target_exam TEXT DEFAULT 'JEE_MAINS',
    description TEXT,
    join_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Explicitly Grant Permissions to avoid Schema Cache hiding
GRANT ALL ON TABLE public.batches TO postgres;
GRANT ALL ON TABLE public.batches TO authenticated;
GRANT ALL ON TABLE public.batches TO anon;
GRANT ALL ON TABLE public.batches TO service_role;

-- 3. Ensure Unique Index on Join Code
DROP INDEX IF EXISTS idx_batches_join_code;
CREATE UNIQUE INDEX idx_batches_join_code ON public.batches(join_code) WHERE (join_code IS NOT NULL);

-- 4. Set RLS Policies
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Select: Mentor, Institute Members, or anyone with a valid code
DROP POLICY IF EXISTS "select_batches_v3" ON public.batches;
CREATE POLICY "select_batches_v3" ON public.batches
    FOR SELECT USING (
        auth.uid() = mentor_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = batches.organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
        OR (join_code IS NOT NULL AND is_active = true)
    );

-- Insert: Mentor or Institute Members
DROP POLICY IF EXISTS "insert_batches_v3" ON public.batches;
CREATE POLICY "insert_batches_v3" ON public.batches
    FOR INSERT WITH CHECK (
        auth.uid() = mentor_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    );

-- Update: Mentor or Institute Members
DROP POLICY IF EXISTS "update_batches_v3" ON public.batches;
CREATE POLICY "update_batches_v3" ON public.batches
    FOR UPDATE USING (
        auth.uid() = mentor_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = batches.organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    );

-- 5. Force Reload Schema Cache
NOTIFY pgrst, 'reload schema';
