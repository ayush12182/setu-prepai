-- ============================================================
-- Bulk Generation Jobs Tracker
-- 20260415210000_bulk_generation_jobs.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bulk_generation_jobs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam              TEXT NOT NULL CHECK (exam IN ('JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUET', 'OTHER')),
  subject           TEXT NOT NULL,
  chapter           TEXT,
  difficulty        TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Mixed')),
  year_start        INTEGER DEFAULT 2015,
  year_end          INTEGER DEFAULT 2024,
  target_count      INTEGER NOT NULL DEFAULT 100,
  questions_generated INTEGER DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_message     TEXT,
  created_by        UUID REFERENCES auth.users(id),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  job_log           JSONB DEFAULT '[]'::JSONB  -- Array of batch results
);

ALTER TABLE public.bulk_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Admins and mentors can manage jobs
DROP POLICY IF EXISTS "admins_manage_jobs" ON public.bulk_generation_jobs;
CREATE POLICY "admins_manage_jobs" ON public.bulk_generation_jobs
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type IN ('admin', 'b2b_mentor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND user_type IN ('admin', 'b2b_mentor')
    )
  );

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON public.bulk_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_exam_subject ON public.bulk_generation_jobs(exam, subject);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
