-- Force PostgREST schema cache reload for all new tables
-- Run after: bulk_generation_jobs, exam_curriculum, student_question_attempts

NOTIFY pgrst, 'reload schema';

-- Verify tables exist (safe no-op if already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bulk_generation_jobs') THEN
    RAISE NOTICE 'bulk_generation_jobs missing — re-run 20260415210000 migration';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exam_curriculum') THEN
    RAISE NOTICE 'exam_curriculum missing — re-run 20260415220000 migration';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_question_attempts') THEN
    RAISE NOTICE 'student_question_attempts missing — re-run 20260415220000 migration';
  END IF;
END $$;
