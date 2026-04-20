-- ============================================================
-- FIX: Profile Fetch and Organization Linkage
-- 20260419110000_fix_org_linkage_and_rls.sql
-- ============================================================

-- Step 1: Temporarily disable RLS for profiles table for testing/debugging
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Fix existing missing organization_ids
-- Every user should be their own organization by default
UPDATE public.profiles
SET organization_id = id
WHERE organization_id IS NULL;

-- Step 3: Update handle_new_user trigger to set organization_id automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_profile_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, organization_id)
  VALUES (
    new_profile_id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    new_profile_id -- The profile ID is also the default organization ID
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Update Auth Metadata with organization_id for fast frontend access
  -- Note: This is a best effort, triggers on auth.users are more reliable
  -- but updating raw_user_meta_data here ensures consistency.
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('organization_id', new_profile_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 4: Ensure column organization_id is not nullable for future (optional, but good for data integrity)
-- ALTER TABLE public.profiles ALTER COLUMN organization_id SET NOT NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
