-- Create staging_questions table mirroring questions schema
CREATE TABLE IF NOT EXISTS public.staging_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic text NOT NULL,
    subtopic text NOT NULL,
    concept text NOT NULL,
    difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_text text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL DEFAULT 0,
    explanation text NOT NULL,
    is_verified boolean DEFAULT false,
    tags text[] DEFAULT '{}',
    created_at timestamp WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pdf_source_id uuid,
    question_type text CHECK (question_type IN ('MCQ', 'Numerical', 'Multi Correct', 'Integer')),
    correct_answer text,
    is_ai_generated boolean DEFAULT false,
    parent_question_id uuid,
    embedding vector(768),
    attempts_count integer DEFAULT 0,
    correct_count integer DEFAULT 0,
    avg_time_taken float DEFAULT 0.0,
    difficulty_score float DEFAULT 50.0,
    concept_depth integer DEFAULT 1 CHECK (concept_depth BETWEEN 1 AND 5),
    multi_concept_level integer DEFAULT 1 CHECK (multi_concept_level BETWEEN 1 AND 5),
    calculation_intensity integer DEFAULT 1 CHECK (calculation_intensity BETWEEN 1 AND 5),
    trickiness_score integer DEFAULT 1 CHECK (trickiness_score BETWEEN 1 AND 5),
    verification_status text DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    question_quality_score text DEFAULT 'AVERAGE' CHECK (question_quality_score IN ('ELITE', 'GOOD', 'AVERAGE', 'REJECTED')),
    subject_id uuid,
    chapter_ref_id uuid,
    exam_type text CHECK (exam_type IN ('JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUET')),
    class text CHECK (class IN ('11', '12', 'dropper')),
    subject text CHECK (subject IN ('Physics', 'Chemistry', 'Maths', 'Biology')),
    chapter text,
    avg_time_seconds integer,
    solution_steps jsonb,
    common_mistake text,
    mistake_type text CHECK (mistake_type IN ('Conceptual', 'Calculation', 'Silly', 'Guessed', 'None')),
    source text,
    perceived_difficulty text CHECK (perceived_difficulty IN ('easy', 'medium', 'hard')),
    
    -- Staging status pipeline: GENERATED, VALIDATED, REJECTED, APPROVED
    status text NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'VALIDATED', 'REJECTED', 'APPROVED'))
);

-- Enable RLS for staging_questions
ALTER TABLE public.staging_questions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated read access
CREATE POLICY "Allow authenticated read access to staging_questions"
    ON public.staging_questions FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role full access
CREATE POLICY "Allow service_role full access to staging_questions"
    ON public.staging_questions FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
