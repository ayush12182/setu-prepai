-- Add cost tracking to generation_jobs
ALTER TABLE public.generation_jobs 
ADD COLUMN estimated_tokens INTEGER DEFAULT 0,
ADD COLUMN actual_tokens INTEGER DEFAULT 0,
ADD COLUMN estimated_cost DECIMAL(10, 4) DEFAULT 0.0000,
ADD COLUMN actual_cost DECIMAL(10, 4) DEFAULT 0.0000,
ADD COLUMN cost_per_question DECIMAL(10, 4) DEFAULT 0.0000;

-- Adjust status check to include new states requested by user
ALTER TABLE public.generation_jobs DROP CONSTRAINT generation_jobs_status_check;
ALTER TABLE public.generation_jobs ADD CONSTRAINT generation_jobs_status_check 
CHECK (status IN ('PENDING', 'QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING'));

-- Create generation_logs table
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
    chunk_id TEXT,
    question_id UUID REFERENCES public.generated_questions(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for logs
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.generation_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable ALL for authenticated users" ON public.generation_logs FOR ALL TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS generation_logs_job_id_idx ON public.generation_logs(job_id);
CREATE INDEX IF NOT EXISTS generation_logs_event_idx ON public.generation_logs(event);
