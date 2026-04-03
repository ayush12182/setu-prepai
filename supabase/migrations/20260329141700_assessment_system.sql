
-- Questions Table: A persistent bank for verified assessment content
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic text NOT NULL,
    subtopic text NOT NULL,
    concept text NOT NULL,
    difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_text text NOT NULL,
    options jsonb NOT NULL, -- Array of strings
    correct_index integer NOT NULL,
    explanation text NOT NULL,
    is_verified boolean DEFAULT false,
    tags text[] DEFAULT '{}',
    created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User MCQ Attempts: Detailed tracking for student diagnostics
CREATE TABLE IF NOT EXISTS public.user_mcq_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    is_correct boolean NOT NULL,
    time_taken_ms integer NOT NULL,
    confidence_level text CHECK (confidence_level IN ('low', 'medium', 'high')),
    ai_predicted_mistake text CHECK (ai_predicted_mistake IN ('conceptual', 'calculation', 'silly', 'guessed', 'none')),
    user_selected_mistake text CHECK (user_selected_mistake IN ('conceptual', 'calculation', 'silly', 'guessed', 'none')),
    mistake_skipped boolean DEFAULT false,
    attempted_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.user_mcq_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_question_id ON public.user_mcq_attempts(question_id);

-- RLS Policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mcq_attempts ENABLE ROW LEVEL SECURITY;

-- Questions: Selectable by authenticated users
CREATE POLICY "Allow authenticated to read verified questions" 
ON public.questions FOR SELECT 
TO authenticated 
USING (is_verified = true OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'service_role'));

-- Attempts: Selectable/Insertable by the owner
CREATE POLICY "Users can manage their own attempts" 
ON public.user_mcq_attempts FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
