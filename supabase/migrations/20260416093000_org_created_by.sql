-- Fix org creation for teachers without organization_id
-- Adds created_by column + INSERT policy to organizations table

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow teachers to insert their own organization
DROP POLICY IF EXISTS "teachers_create_org" ON public.organizations;
CREATE POLICY "teachers_create_org" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow creators to update their own org
DROP POLICY IF EXISTS "teachers_update_own_org" ON public.organizations;
CREATE POLICY "teachers_update_own_org" ON public.organizations
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Backfill: link existing orgs to their creator via profiles.organization_id
UPDATE public.organizations o
SET created_by = p.user_id
FROM public.profiles p
WHERE p.organization_id = o.id
  AND o.created_by IS NULL;

NOTIFY pgrst, 'reload schema';
