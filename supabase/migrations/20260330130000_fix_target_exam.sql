-- Migration to fix target_exam enum constraint for B2B/Commerce streams
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_target_exam_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_target_exam_check 
  CHECK (target_exam IN ('JEE Main', 'JEE Advanced', 'Both', 'NEET', 'CUET', 'Foundation', 'CA Foundation', 'Commerce'));
