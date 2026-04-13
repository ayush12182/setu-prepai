-- Migration: Add B2B context to student_activity
-- 20260413160000_unify_b2b_activity.sql

-- 1. Add columns to student_activity
ALTER TABLE public.student_activity
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 2. Update RLS policies to allow mentors/institutions to see activity via batches
DROP POLICY IF EXISTS "teachers_read_student_activity" ON public.student_activity;

CREATE POLICY "Mentors can read batch student activity"
ON public.student_activity FOR SELECT
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = student_activity.batch_id
          AND b.mentor_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.organization_id = student_activity.organization_id
          AND p.user_type IN ('b2b_institution', 'admin')
    )
);

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_student_activity_batch ON public.student_activity(batch_id);
CREATE INDEX IF NOT EXISTS idx_student_activity_org ON public.student_activity(organization_id);
