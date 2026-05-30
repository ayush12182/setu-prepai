-- ============================================================
-- PrepEntrance Student Memory & Teacher Tasks Architecture
-- 20260408120000_student_memory_tasks.sql
-- ============================================================

-- ─── 1. TEACHER ASSIGNED TASKS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assigned_tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic               TEXT,
  subtopic            TEXT NOT NULL,
  difficulty          TEXT DEFAULT 'Medium',
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  initial_accuracy    FLOAT,  -- snapshot of their accuracy when task was assigned
  final_accuracy      FLOAT,  -- snapshot after completing the task
  created_at          TIMESTAMPTZ DEFAULT now(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_assigned_tasks_student ON public.assigned_tasks(student_id, status);
CREATE INDEX idx_assigned_tasks_teacher ON public.assigned_tasks(teacher_id);
ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;

-- Students can read their own tasks
DROP POLICY IF EXISTS "students_read_own_tasks" ON public.assigned_tasks;
CREATE POLICY "students_read_own_tasks" ON public.assigned_tasks
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can manage tasks for their students
DROP POLICY IF EXISTS "teachers_manage_assigned_tasks" ON public.assigned_tasks;
CREATE POLICY "teachers_manage_assigned_tasks" ON public.assigned_tasks
  USING (
    EXISTS (
      SELECT 1 FROM public.student_teacher_links
      WHERE student_id = assigned_tasks.student_id
        AND teacher_id = auth.uid()
        AND is_active = true
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "service_role_tasks" ON public.assigned_tasks;
CREATE POLICY "service_role_tasks" ON public.assigned_tasks USING (true) WITH CHECK (true);

-- ─── 2. STUDENT MEMORY VIEW ───────────────────────────────────
-- View to aggregate student historical performance on subtopics
CREATE OR REPLACE VIEW public.student_memory_view AS
WITH practice_stats AS (
  SELECT 
    student_id,
    subtopic,
    SUM(total_questions) as total_attempted,
    SUM(score) as total_correct
  FROM public.practice_reports
  GROUP BY student_id, subtopic
)
SELECT 
  student_id,
  subtopic,
  total_attempted,
  total_correct,
  (total_correct::FLOAT / NULLIF(total_attempted, 0) * 100) as current_accuracy
FROM practice_stats;

-- ─── 3. RPC: GET TEACHER IMPACT METRICS ───────────────────────
-- Computes the B2B Dashboard ROI metrics for a specific teacher.
CREATE OR REPLACE FUNCTION public.get_teacher_impact_metrics(p_teacher_id UUID)
RETURNS TABLE (
  active_students_7d INTEGER,
  active_students_prev7d INTEGER,
  avg_accuracy_7d FLOAT,
  avg_accuracy_prev7d FLOAT,
  weak_topics_surfaced INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COUNT(DISTINCT student_id) as active_curr,
      AVG(accuracy_pct) as acc_curr,
      COUNT(id) as total_reports
    FROM public.practice_reports
    WHERE teacher_id = p_teacher_id
      AND created_at >= now() - INTERVAL '7 days'
  ),
  prev_period AS (
    SELECT 
      COUNT(DISTINCT student_id) as active_prev,
      AVG(accuracy_pct) as acc_prev
    FROM public.practice_reports
    WHERE teacher_id = p_teacher_id
      AND created_at >= now() - INTERVAL '14 days'
      AND created_at < now() - INTERVAL '7 days'
  ),
  weak_topics_count AS (
    SELECT COUNT(DISTINCT element) as total_weak
    FROM public.practice_reports pr,
         unnest(pr.weak_topics) as element
    WHERE pr.teacher_id = p_teacher_id
  )
  SELECT 
    COALESCE((SELECT active_curr FROM current_period), 0)::INTEGER as active_students_7d,
    COALESCE((SELECT active_prev FROM prev_period), 0)::INTEGER as active_students_prev7d,
    COALESCE((SELECT acc_curr FROM current_period), 0.0)::FLOAT as avg_accuracy_7d,
    COALESCE((SELECT acc_prev FROM prev_period), 0.0)::FLOAT as avg_accuracy_prev7d,
    COALESCE((SELECT total_weak FROM weak_topics_count), 0)::INTEGER as weak_topics_surfaced;
END;
$$;
