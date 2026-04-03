-- Expansion of the Questions Bank Foundation
-- Alterations to existing tables to support 10k+ questions with rich metadata

-- Adding missing columns to questions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'exam') THEN
        ALTER TABLE public.questions ADD COLUMN exam text CHECK (exam IN ('JEE_MAINS', 'NEET', 'CUET'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'class') THEN
        ALTER TABLE public.questions ADD COLUMN class text CHECK (class IN ('11', '12', 'dropper'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'subject') THEN
        ALTER TABLE public.questions ADD COLUMN subject text CHECK (subject IN ('Physics', 'Chemistry', 'Maths', 'Biology'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'chapter') THEN
        ALTER TABLE public.questions ADD COLUMN chapter text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'avg_time_seconds') THEN
        ALTER TABLE public.questions ADD COLUMN avg_time_seconds integer;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'solution_steps') THEN
        ALTER TABLE public.questions ADD COLUMN solution_steps jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'common_mistake') THEN
        ALTER TABLE public.questions ADD COLUMN common_mistake text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'mistake_type') THEN
        ALTER TABLE public.questions ADD COLUMN mistake_type text CHECK (mistake_type IN ('Conceptual', 'Calculation', 'Silly', 'Guessed', 'None'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'source') THEN
        ALTER TABLE public.questions ADD COLUMN source text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'perceived_difficulty') THEN
        ALTER TABLE public.questions ADD COLUMN perceived_difficulty text CHECK (perceived_difficulty IN ('easy', 'medium', 'hard'));
    END IF;
END $$;

-- Update user_mcq_attempts logic to track `selected_option`
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_mcq_attempts' AND column_name = 'selected_option') THEN
        ALTER TABLE public.user_mcq_attempts ADD COLUMN selected_option integer;
    END IF;
END $$;

-- Create student weakness map cache
CREATE TABLE IF NOT EXISTS public.student_weakness_map (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subtopic text NOT NULL,
    accuracy_percent numeric(5,2) DEFAULT 0,
    avg_time_seconds integer DEFAULT 0,
    attempts_count integer DEFAULT 0,
    last_attempted timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, subtopic)
);

CREATE INDEX IF NOT EXISTS idx_weakness_student_id ON public.student_weakness_map(student_id);

-- Enable RLS for weakness map
ALTER TABLE public.student_weakness_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weakness map" 
ON public.student_weakness_map FOR ALL 
TO authenticated 
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);
