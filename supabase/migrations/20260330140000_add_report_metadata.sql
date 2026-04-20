-- Adds metadata column to learning_profiles to store advanced AI insights (Action Plan, Mistake Patterns)
ALTER TABLE public.learning_profiles 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
