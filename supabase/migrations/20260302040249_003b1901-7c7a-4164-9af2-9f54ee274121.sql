
-- Add diagnostic_completed and exam_goal to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS diagnostic_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exam_goal text;
