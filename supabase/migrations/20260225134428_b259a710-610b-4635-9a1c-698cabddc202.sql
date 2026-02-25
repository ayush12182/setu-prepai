-- Update the profiles target_exam check constraint to include CUET
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_target_exam_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_target_exam_check 
  CHECK (target_exam IN ('JEE Main', 'JEE Advanced', 'Both', 'NEET', 'CUET'));