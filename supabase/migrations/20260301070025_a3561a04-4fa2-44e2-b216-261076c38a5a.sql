
-- Add diagnostic_completed to learning_profiles
ALTER TABLE public.learning_profiles 
ADD COLUMN IF NOT EXISTS diagnostic_completed boolean NOT NULL DEFAULT false;

-- Update existing records that have scores to mark as completed
UPDATE public.learning_profiles 
SET diagnostic_completed = true 
WHERE concept_score > 0 OR accuracy_score > 0;
