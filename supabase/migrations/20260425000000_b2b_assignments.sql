-- ============================================================
-- SETU B2B Assignments Schema & RPC
-- 20260425000000_b2b_assignments.sql
-- ============================================================

-- 1. Batch Assignments Table
CREATE TABLE IF NOT EXISTS public.batch_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('test', 'material')),
  reference_id UUID NOT NULL, -- references assessment_sessions or batch_materials
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.batch_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can see active assignments for their batches"
ON public.batch_assignments FOR SELECT
USING (
  is_active = true AND
  batch_id IN (
    SELECT batch_id FROM public.batch_members WHERE student_id = auth.uid()
  )
);

CREATE POLICY "Teachers can manage assignments"
ON public.batch_assignments FOR ALL
USING (auth.uid() = assigned_by);


-- 2. Student Assignment Views (is_seen tracking)
CREATE TABLE IF NOT EXISTS public.student_assignment_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.batch_assignments(id) ON DELETE CASCADE,
  is_seen BOOLEAN DEFAULT true,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, assignment_id)
);

ALTER TABLE public.student_assignment_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can see their own views"
ON public.student_assignment_views FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own views"
ON public.student_assignment_views FOR ALL
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);


-- 3. RPC: get_student_assigned_content
CREATE OR REPLACE FUNCTION public.get_student_assigned_content(p_student_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tests JSONB := '[]'::jsonb;
  v_materials JSONB := '[]'::jsonb;
  v_overdue_count INT := 0;
  v_due_soon_count INT := 0;
BEGIN
  -- Build Tests JSON
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ba.id,
      'reference_id', ase.id,
      'title', COALESCE(ase.metadata->>'title', ase.exam_type || ' Assessment'),
      'subject', COALESCE(ase.metadata->>'subject', ase.exam_type),
      'questions', ase.question_count,
      'duration', ase.time_limit_minutes,
      'due_date', ba.due_date,
      'is_seen', COALESCE(sav.is_seen, false),
      'status', CASE 
          WHEN sp.status IN ('SUBMITTED', 'IN_PROGRESS') THEN 'attempted'
          WHEN ba.due_date < now() THEN 'overdue'
          ELSE 'not_attempted'
        END,
      'attempt_id', sp.id
    )
  ), '[]'::jsonb)
  INTO v_tests
  FROM public.batch_assignments ba
  JOIN public.batch_members bm ON bm.batch_id = ba.batch_id AND bm.student_id = p_student_id
  JOIN public.assessment_sessions ase ON ase.id = ba.reference_id
  LEFT JOIN public.student_assignment_views sav ON sav.assignment_id = ba.id AND sav.student_id = p_student_id
  LEFT JOIN public.student_assessments sa ON sa.assessment_id = ase.id AND sa.student_id = p_student_id
  -- Wait, student's attempt is often stored in session_participants or student_assessments depending on flow. Let's use session_participants for safety.
  LEFT JOIN public.session_participants sp ON sp.session_id = ase.id AND sp.student_id = p_student_id
  WHERE ba.type = 'test' AND ba.is_active = true;

  -- Build Materials JSON
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ba.id,
      'reference_id', bm_mat.id,
      'title', bm_mat.title,
      'subject', bm_mat.subject,
      'type', bm_mat.type,
      'file_type', bm_mat.type,
      'uploaded_at', bm_mat.created_at,
      'due_date', ba.due_date,
      'is_seen', COALESCE(sav.is_seen, false)
    )
  ), '[]'::jsonb)
  INTO v_materials
  FROM public.batch_assignments ba
  JOIN public.batch_members bm ON bm.batch_id = ba.batch_id AND bm.student_id = p_student_id
  JOIN public.batch_materials bm_mat ON bm_mat.id = ba.reference_id
  LEFT JOIN public.student_assignment_views sav ON sav.assignment_id = ba.id AND sav.student_id = p_student_id
  WHERE ba.type = 'material' AND ba.is_active = true;

  -- Alerts computation
  SELECT 
    COUNT(*) FILTER (WHERE ba.due_date < now()),
    COUNT(*) FILTER (WHERE ba.due_date >= now() AND ba.due_date <= now() + interval '3 days')
  INTO v_overdue_count, v_due_soon_count
  FROM public.batch_assignments ba
  JOIN public.batch_members bm ON bm.batch_id = ba.batch_id AND bm.student_id = p_student_id
  WHERE ba.is_active = true;

  RETURN jsonb_build_object(
    'tests', v_tests,
    'materials', v_materials,
    'alerts', jsonb_build_object(
      'overdue', v_overdue_count,
      'due_soon', v_due_soon_count
    )
  );
END;
$$;
