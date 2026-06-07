-- ============================================================
-- JEE Question Intelligence System Migration
-- Migration: 20260604150000_jee_question_intelligence.sql
-- ============================================================

-- 1. Enable vector extension for semantic and duplicate searches
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create PDF sources table
CREATE TABLE IF NOT EXISTS public.pdf_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    source_style TEXT NOT NULL CHECK (source_style IN ('ALLEN', 'RESONANCE', 'FIITJEE', 'PYQ', 'STANDARD')),
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for pdf_sources
ALTER TABLE public.pdf_sources ENABLE ROW LEVEL SECURITY;

-- Select policy: all authenticated users can read sources
DROP POLICY IF EXISTS "Allow authenticated read access to pdf_sources" ON public.pdf_sources;
CREATE POLICY "Allow authenticated read access to pdf_sources"
    ON public.pdf_sources FOR SELECT
    TO authenticated
    USING (true);

-- Manage policy: admins and teachers can manage sources
DROP POLICY IF EXISTS "Allow admins to manage pdf_sources" ON public.pdf_sources;
CREATE POLICY "Allow admins to manage pdf_sources"
    ON public.pdf_sources FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
              AND user_type IN ('admin', 'teacher')
        )
    );

-- 3. Alter questions table to add new columns safely
DO $$
BEGIN
    -- pdf_source_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='pdf_source_id') THEN
        ALTER TABLE public.questions ADD COLUMN pdf_source_id UUID REFERENCES public.pdf_sources(id) ON DELETE SET NULL;
    END IF;

    -- question_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='question_type') THEN
        ALTER TABLE public.questions ADD COLUMN question_type TEXT CHECK (question_type IN ('MCQ', 'Numerical', 'Multi Correct', 'Integer'));
    END IF;

    -- options JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='options') THEN
        ALTER TABLE public.questions ADD COLUMN options JSONB;
    END IF;

    -- correct_answer
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='correct_answer') THEN
        ALTER TABLE public.questions ADD COLUMN correct_answer TEXT;
    END IF;

    -- is_ai_generated
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='is_ai_generated') THEN
        ALTER TABLE public.questions ADD COLUMN is_ai_generated BOOLEAN DEFAULT false;
    END IF;

    -- parent_question_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='parent_question_id') THEN
        ALTER TABLE public.questions ADD COLUMN parent_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL;
    END IF;

    -- embedding vector(768)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='embedding') THEN
        ALTER TABLE public.questions ADD COLUMN embedding vector(768);
    END IF;

    -- attempts_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='attempts_count') THEN
        ALTER TABLE public.questions ADD COLUMN attempts_count INTEGER DEFAULT 0;
    END IF;

    -- correct_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='correct_count') THEN
        ALTER TABLE public.questions ADD COLUMN correct_count INTEGER DEFAULT 0;
    END IF;

    -- avg_time_taken
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='avg_time_taken') THEN
        ALTER TABLE public.questions ADD COLUMN avg_time_taken FLOAT DEFAULT 0.0;
    END IF;

    -- difficulty_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='difficulty_score') THEN
        ALTER TABLE public.questions ADD COLUMN difficulty_score FLOAT DEFAULT 50.0;
    END IF;

    -- concept_depth
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='concept_depth') THEN
        ALTER TABLE public.questions ADD COLUMN concept_depth INTEGER DEFAULT 1 CHECK (concept_depth BETWEEN 1 AND 5);
    END IF;

    -- multi_concept_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='multi_concept_level') THEN
        ALTER TABLE public.questions ADD COLUMN multi_concept_level INTEGER DEFAULT 1 CHECK (multi_concept_level BETWEEN 1 AND 5);
    END IF;

    -- calculation_intensity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='calculation_intensity') THEN
        ALTER TABLE public.questions ADD COLUMN calculation_intensity INTEGER DEFAULT 1 CHECK (calculation_intensity BETWEEN 1 AND 5);
    END IF;

    -- trickiness_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='trickiness_score') THEN
        ALTER TABLE public.questions ADD COLUMN trickiness_score INTEGER DEFAULT 1 CHECK (trickiness_score BETWEEN 1 AND 5);
    END IF;

    -- verification_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='verification_status') THEN
        ALTER TABLE public.questions ADD COLUMN verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'));
    END IF;

    -- question_quality_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='question_quality_score') THEN
        ALTER TABLE public.questions ADD COLUMN question_quality_score TEXT DEFAULT 'AVERAGE' CHECK (question_quality_score IN ('ELITE', 'GOOD', 'AVERAGE', 'REJECTED'));
    END IF;

    -- is_verified
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='is_verified') THEN
        ALTER TABLE public.questions ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;

    -- subject_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='subject_id') THEN
        ALTER TABLE public.questions ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
    END IF;

    -- chapter_ref_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='chapter_ref_id') THEN
        ALTER TABLE public.questions ADD COLUMN chapter_ref_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;
    END IF;

    -- exam_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='exam_type') THEN
        ALTER TABLE public.questions ADD COLUMN exam_type TEXT CHECK (exam_type IN ('JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUET'));
    END IF;
END $$;

-- 4. Create question_tags table for concept tags
CREATE TABLE IF NOT EXISTS public.question_tags (
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (question_id, tag)
);

-- Enable RLS for question_tags
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read access to question_tags" ON public.question_tags;
CREATE POLICY "Allow authenticated read access to question_tags"
    ON public.question_tags FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admins to manage question_tags" ON public.question_tags;
CREATE POLICY "Allow admins to manage question_tags"
    ON public.question_tags FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
              AND user_type IN ('admin', 'teacher')
        )
    );

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_pdf_source_id ON public.questions(pdf_source_id);
CREATE INDEX IF NOT EXISTS idx_questions_verification_status ON public.questions(verification_status);
CREATE INDEX IF NOT EXISTS idx_questions_question_quality_score ON public.questions(question_quality_score);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty_score ON public.questions(difficulty_score);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_ref_id ON public.questions(chapter_ref_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_type ON public.questions(exam_type);

-- Create HNSW index for vector cosine distance operations
CREATE INDEX IF NOT EXISTS idx_questions_embedding_cosine
    ON public.questions USING hnsw (embedding vector_cosine_ops);

-- 6. Trigger: Synchronize legacy and new question fields
CREATE OR REPLACE FUNCTION public.sync_question_legacy_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync options JSONB to legacy option_a/b/c/d
    IF NEW.options IS NOT NULL THEN
        IF jsonb_typeof(NEW.options) = 'object' THEN
            NEW.option_a := COALESCE(NEW.options->>'A', NEW.option_a);
            NEW.option_b := COALESCE(NEW.options->>'B', NEW.option_b);
            NEW.option_c := COALESCE(NEW.options->>'C', NEW.option_c);
            NEW.option_d := COALESCE(NEW.options->>'D', NEW.option_d);
        ELSIF jsonb_typeof(NEW.options) = 'array' THEN
            NEW.option_a := COALESCE(NEW.options->>0, NEW.option_a);
            NEW.option_b := COALESCE(NEW.options->>1, NEW.option_b);
            NEW.option_c := COALESCE(NEW.options->>2, NEW.option_c);
            NEW.option_d := COALESCE(NEW.options->>3, NEW.option_d);
        END IF;
    ELSIF NEW.option_a IS NOT NULL AND NEW.option_b IS NOT NULL AND NEW.option_c IS NOT NULL AND NEW.option_d IS NOT NULL THEN
        NEW.options := jsonb_build_object(
            'A', NEW.option_a,
            'B', NEW.option_b,
            'C', NEW.option_c,
            'D', NEW.option_d
        );
    END IF;

    -- Sync correct_answer and correct_option
    IF NEW.correct_answer IS NOT NULL THEN
        NEW.correct_option := NEW.correct_answer;
    ELSIF NEW.correct_option IS NOT NULL THEN
        NEW.correct_answer := NEW.correct_option;
    END IF;

    -- Sync is_verified and verification_status
    IF NEW.verification_status IS NOT NULL THEN
        IF NEW.verification_status = 'APPROVED' THEN
            NEW.is_verified := true;
        ELSE
            NEW.is_verified := false;
        END IF;
    ELSIF NEW.is_verified IS NOT NULL THEN
        IF NEW.is_verified THEN
            NEW.verification_status := 'APPROVED';
        ELSE
            IF NEW.verification_status = 'APPROVED' THEN
                NEW.verification_status := 'PENDING';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_question_legacy_fields ON public.questions;
CREATE TRIGGER trg_sync_question_legacy_fields
BEFORE INSERT OR UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.sync_question_legacy_fields();

-- 7. Recalculate difficulty_score dynamically based on real student activity
CREATE OR REPLACE FUNCTION public.recalculate_question_difficulty_score(p_question_id UUID)
RETURNS VOID AS $$
DECLARE
    v_attempts_qa INT := 0;
    v_correct_qa INT := 0;
    v_time_qa FLOAT := 0.0;

    v_attempts_uma INT := 0;
    v_correct_uma INT := 0;
    v_time_uma FLOAT := 0.0;

    v_total_attempts INT := 0;
    v_total_correct INT := 0;
    v_total_time FLOAT := 0.0;

    v_avg_time FLOAT := 0.0;
    v_accuracy_rate FLOAT := 0.0;
    v_baseline_time FLOAT := 180.0; -- Default baseline (in seconds)
    v_time_factor FLOAT := 0.0;
    v_new_difficulty_score FLOAT := 50.0;
    v_diff TEXT;
BEGIN
    -- Query from question_attempts
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_correct THEN 1 END),
        COALESCE(SUM(time_taken_seconds), 0.0)
    INTO v_attempts_qa, v_correct_qa, v_time_qa
    FROM public.question_attempts
    WHERE question_id = p_question_id;

    -- Query from user_mcq_attempts
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_correct THEN 1 END),
        COALESCE(SUM(time_taken_ms::FLOAT / 1000.0), 0.0)
    INTO v_attempts_uma, v_correct_uma, v_time_uma
    FROM public.user_mcq_attempts
    WHERE question_id = p_question_id;

    -- Combine attempt data
    v_total_attempts := COALESCE(v_attempts_qa, 0) + COALESCE(v_attempts_uma, 0);
    v_total_correct := COALESCE(v_correct_qa, 0) + COALESCE(v_correct_uma, 0);
    v_total_time := COALESCE(v_time_qa, 0.0) + COALESCE(v_time_uma, 0.0);

    IF v_total_attempts > 0 THEN
        v_accuracy_rate := v_total_correct::FLOAT / v_total_attempts::FLOAT;
        v_avg_time := v_total_time / v_total_attempts::FLOAT;

        -- Get default baseline time based on manual difficulty level
        SELECT COALESCE(difficulty, 'medium') INTO v_diff FROM public.questions WHERE id = p_question_id;

        IF LOWER(v_diff) = 'easy' THEN
            v_baseline_time := 120.0;
        ELSIF LOWER(v_diff) = 'hard' THEN
            v_baseline_time := 240.0;
        ELSE
            v_baseline_time := 180.0;
        END IF;

        v_time_factor := LEAST(1.0, v_avg_time / v_baseline_time);

        -- Formula: difficulty_score = (1 - accuracy_rate) * 70 + (time_factor) * 30
        v_new_difficulty_score := (1.0 - v_accuracy_rate) * 70.0 + v_time_factor * 30.0;

        UPDATE public.questions
        SET
            attempts_count = v_total_attempts,
            correct_count = v_total_correct,
            avg_time_taken = v_avg_time,
            difficulty_score = ROUND(v_new_difficulty_score::NUMERIC, 2)
        WHERE id = p_question_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger functions for attempt tables
CREATE OR REPLACE FUNCTION public.trg_fn_recalculate_difficulty_qa()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.recalculate_question_difficulty_score(NEW.question_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.trg_fn_recalculate_difficulty_uma()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.question_id IS NOT NULL THEN
        PERFORM public.recalculate_question_difficulty_score(NEW.question_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up the triggers on attempts tables
DROP TRIGGER IF EXISTS trg_recalculate_difficulty_qa ON public.question_attempts;
CREATE TRIGGER trg_recalculate_difficulty_qa
AFTER INSERT ON public.question_attempts
FOR EACH ROW
EXECUTE FUNCTION public.trg_fn_recalculate_difficulty_qa();

DROP TRIGGER IF EXISTS trg_recalculate_difficulty_uma ON public.user_mcq_attempts;
CREATE TRIGGER trg_recalculate_difficulty_uma
AFTER INSERT ON public.user_mcq_attempts
FOR EACH ROW
EXECUTE FUNCTION public.trg_fn_recalculate_difficulty_uma();

-- 8. RPC: Vector Similarity Match
CREATE OR REPLACE FUNCTION public.match_questions(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_subject text DEFAULT NULL,
  filter_chapter_id text DEFAULT NULL,
  filter_difficulty text DEFAULT NULL,
  filter_exam_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  chapter_id TEXT,
  subject TEXT,
  difficulty TEXT,
  question_text TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  is_ai_generated BOOLEAN,
  verification_status TEXT,
  question_quality_score TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.chapter_id,
    q.subject,
    q.difficulty,
    q.question_text,
    q.options,
    q.correct_answer,
    q.explanation,
    q.is_ai_generated,
    q.verification_status,
    q.question_quality_score,
    (1 - (q.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.questions q
  WHERE q.embedding IS NOT NULL
    AND (1 - (q.embedding <=> query_embedding)) > match_threshold
    AND (filter_subject IS NULL OR LOWER(q.subject) = LOWER(filter_subject))
    AND (filter_chapter_id IS NULL OR q.chapter_id = filter_chapter_id)
    AND (filter_difficulty IS NULL OR LOWER(q.difficulty) = LOWER(filter_difficulty))
    AND (filter_exam_type IS NULL OR q.exam_type = filter_exam_type)
  ORDER BY 
    (1 - (q.embedding <=> query_embedding)) DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Notify postgrest schema reload
NOTIFY pgrst, 'reload schema';
