-- Adds institution_name to profiles to allow B2B students to specify their coaching center
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS institution_name text;

-- Ensure user_type is also clearly enabled if not already explicitly in migration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'b2c_student';
