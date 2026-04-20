-- ─── BATCH STUDENTS TABLE ───
CREATE TABLE IF NOT EXISTS public.batch_students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id uuid REFERENCES public.batches(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(batch_id, student_id)
);

-- ─── TEMPORARY RLS BYPASS ───
-- Disabling RLS temporarily as requested to verify flow stability
ALTER TABLE public.batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ─── AUTO-PROFILE TRIGGER ───
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Student'), 
    COALESCE(new.raw_user_meta_data->>'user_type', 'student')
  )
  ON CONFLICT (user_id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
