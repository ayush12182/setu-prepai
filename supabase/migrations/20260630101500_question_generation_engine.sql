-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. generation_jobs table
CREATE TABLE IF NOT EXISTS public.generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PAUSED')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_requested INTEGER NOT NULL DEFAULT 0,
    total_generated INTEGER NOT NULL DEFAULT 0,
    duplicates_removed INTEGER NOT NULL DEFAULT 0,
    failed_questions INTEGER NOT NULL DEFAULT 0,
    retries INTEGER NOT NULL DEFAULT 0,
    progress FLOAT NOT NULL DEFAULT 0.0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. question_templates table
CREATE TABLE IF NOT EXISTS public.question_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    concept TEXT,
    family_name TEXT NOT NULL,
    template_text TEXT NOT NULL,
    variables_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. generated_questions table (Isolated Staging)
CREATE TABLE IF NOT EXISTS public.generated_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.generation_jobs(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.question_templates(id) ON DELETE SET NULL,
    template_version INTEGER,
    generation_version INTEGER DEFAULT 1,
    ai_model_generator TEXT,
    ai_model_validator TEXT,
    
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT,
    concept TEXT,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    
    solution_steps TEXT,
    common_mistake TEXT,
    shortcut_trick TEXT,
    hint TEXT,
    formula_used TEXT,
    
    estimated_time INTEGER, -- in seconds
    marks INTEGER DEFAULT 4,
    negative_marks INTEGER DEFAULT -1,
    is_numerical BOOLEAN DEFAULT false,
    
    -- Quality Scores (0-100)
    grammar_score INTEGER,
    concept_score INTEGER,
    difficulty_score INTEGER,
    originality_score INTEGER,
    formatting_score INTEGER,
    overall_score INTEGER,
    
    -- Metadata
    nta_syllabus_code TEXT,
    blooms_taxonomy TEXT,
    text_embedding VECTOR(1536),
    media_assets JSONB DEFAULT '[]'::jsonb,
    
    status TEXT NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'VALIDATED', 'HUMAN_REVIEWED', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'REJECTED')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. question_reviews table
CREATE TABLE IF NOT EXISTS public.question_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.generated_questions(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL CHECK (status IN ('APPROVED', 'REJECTED', 'NEEDS_WORK')),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. question_exports table
CREATE TABLE IF NOT EXISTS public.question_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.generation_jobs(id) ON DELETE SET NULL,
    export_format TEXT NOT NULL CHECK (export_format IN ('PDF', 'CSV', 'JSON', 'SQL', 'XLSX', 'MARKDOWN')),
    file_url TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generation_jobs_modtime
    BEFORE UPDATE ON public.generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_templates_modtime
    BEFORE UPDATE ON public.question_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_questions_modtime
    BEFORE UPDATE ON public.generated_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_exports ENABLE ROW LEVEL SECURITY;

-- Admins only can read/write. Since there is no admin role table clearly visible in this generic context, 
-- we will use service role / authenticated roles, but ideally map it to a user metadata 'role' = 'admin'.
-- For now, allow authenticated users (staff) to manage the engine, while public cannot.
CREATE POLICY "Enable read access for authenticated users" ON public.generation_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.generation_jobs FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.question_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.question_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.generated_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.generated_questions FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.question_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.question_reviews FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.question_exports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.question_exports FOR ALL TO authenticated USING (true);

-- Indexes for performance (especially vector search)
CREATE INDEX IF NOT EXISTS generated_questions_embedding_idx ON public.generated_questions USING ivfflat (text_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS generated_questions_status_idx ON public.generated_questions(status);
CREATE INDEX IF NOT EXISTS generation_jobs_status_idx ON public.generation_jobs(status);
