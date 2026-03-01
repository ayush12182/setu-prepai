
-- Add student_level to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_level text;

-- Create diagnostic question bank
CREATE TABLE public.diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  topic text NOT NULL,
  subtopic text,
  grade_range text NOT NULL, -- '6-8', '9-10', '11-12'
  difficulty text NOT NULL DEFAULT 'medium', -- easy, medium, hard
  question_type text NOT NULL DEFAULT 'mcq', -- mcq, reasoning, numerical
  skill_tested text NOT NULL, -- concept, logic, calculation, reading, prerequisite
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  explanation text NOT NULL,
  prerequisite_topic text, -- topic that must be mastered before this
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diagnostic questions viewable by authenticated users"
ON public.diagnostic_questions FOR SELECT
TO authenticated
USING (true);

-- Create diagnostic test attempts
CREATE TABLE public.diagnostic_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  student_level text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress', -- in_progress, completed
  total_questions integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  total_time_seconds integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.diagnostic_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own diagnostic attempts"
ON public.diagnostic_attempts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostic attempts"
ON public.diagnostic_attempts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic attempts"
ON public.diagnostic_attempts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create diagnostic answers (per-question tracking)
CREATE TABLE public.diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.diagnostic_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.diagnostic_questions(id),
  selected_option text,
  is_correct boolean,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  difficulty_at_time text, -- difficulty when question was presented
  answered_at timestamptz DEFAULT now()
);

ALTER TABLE public.diagnostic_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own diagnostic answers"
ON public.diagnostic_answers FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.diagnostic_attempts
  WHERE id = diagnostic_answers.attempt_id AND user_id = auth.uid()
));

CREATE POLICY "Users can view own diagnostic answers"
ON public.diagnostic_answers FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.diagnostic_attempts
  WHERE id = diagnostic_answers.attempt_id AND user_id = auth.uid()
));

-- Create learning profiles
CREATE TABLE public.learning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  diagnostic_attempt_id uuid REFERENCES public.diagnostic_attempts(id),
  concept_score numeric DEFAULT 0,
  accuracy_score numeric DEFAULT 0,
  speed_score numeric DEFAULT 0,
  confidence_score numeric DEFAULT 0,
  weak_topics jsonb DEFAULT '[]'::jsonb,
  strong_topics jsonb DEFAULT '[]'::jsonb,
  prerequisite_gaps jsonb DEFAULT '[]'::jsonb,
  overall_level text, -- beginner, intermediate, advanced
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own learning profile"
ON public.learning_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own learning profile"
ON public.learning_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning profile"
ON public.learning_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at on learning_profiles
CREATE TRIGGER update_learning_profiles_updated_at
BEFORE UPDATE ON public.learning_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for fast diagnostic question lookups
CREATE INDEX idx_diagnostic_questions_grade ON public.diagnostic_questions(grade_range);
CREATE INDEX idx_diagnostic_questions_subject ON public.diagnostic_questions(subject);
CREATE INDEX idx_diagnostic_questions_difficulty ON public.diagnostic_questions(difficulty);
