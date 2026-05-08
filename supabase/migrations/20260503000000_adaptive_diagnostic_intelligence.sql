-- Add confidence tracking and adaptive phase to diagnostic system
ALTER TABLE public.diagnostic_answers 
ADD COLUMN IF NOT EXISTS confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS phase text DEFAULT 'baseline' CHECK (phase IN ('baseline', 'probing'));

-- Add intelligence flags to learning profiles for teacher dashboard
ALTER TABLE public.learning_profiles 
ADD COLUMN IF NOT EXISTS batch_suggestion text,
ADD COLUMN IF NOT EXISTS risk_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS misconception_density numeric DEFAULT 0;

-- Update RLS to allow teachers to view their students' profiles
CREATE POLICY "Teachers can view their students' learning profiles"
ON public.learning_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles s
    WHERE s.user_id = learning_profiles.user_id
    AND s.teacher_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles s
    JOIN public.batch_students bs ON bs.student_id = s.user_id
    JOIN public.batches b ON b.id = bs.batch_id
    WHERE s.user_id = learning_profiles.user_id
    AND b.mentor_id = auth.uid()
  )
);
