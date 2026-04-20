-- ============================================================
-- 21-Day Full Syllabus Test System
-- 20260418230000_twenty_one_day_cycle.sql
-- ============================================================
-- Tracks each student's 21-day test cycle.
-- last_full_test_date is updated when student completes the test.
-- days_left is computed by the frontend / RPC.

CREATE TABLE IF NOT EXISTS public.student_test_cycle (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_full_test_date  DATE,
  next_test_date  DATE GENERATED ALWAYS AS (last_full_test_date + INTERVAL '21 days') STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id)
);

ALTER TABLE public.student_test_cycle ENABLE ROW LEVEL SECURITY;

-- Students can only read/write their own cycle
CREATE POLICY "student_test_cycle_own" ON public.student_test_cycle
  FOR ALL USING (auth.uid() = student_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_student_test_cycle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_test_cycle_updated ON public.student_test_cycle;
CREATE TRIGGER trg_student_test_cycle_updated
  BEFORE UPDATE ON public.student_test_cycle
  FOR EACH ROW EXECUTE FUNCTION public.set_student_test_cycle_updated_at();

-- RPC: get_test_cycle_for_student
-- Returns next_test_date, days_left, is_test_day for the calling user.
-- Creates a default row (starting cycle from today) if none exists.
CREATE OR REPLACE FUNCTION public.get_test_cycle()
RETURNS TABLE (
  last_full_test_date DATE,
  next_test_date      DATE,
  days_left           INT,
  is_test_day         BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID := auth.uid();
  v_row        public.student_test_cycle;
  v_today      DATE := CURRENT_DATE;
BEGIN
  -- Fetch or create the cycle row
  SELECT * INTO v_row
    FROM public.student_test_cycle
   WHERE student_id = v_student_id;

  IF NOT FOUND THEN
    -- First time: start cycle from today (first test due in 21 days)
    INSERT INTO public.student_test_cycle (student_id, last_full_test_date)
    VALUES (v_student_id, v_today)
    ON CONFLICT (student_id) DO NOTHING;

    SELECT * INTO v_row
      FROM public.student_test_cycle
     WHERE student_id = v_student_id;
  END IF;

  RETURN QUERY SELECT
    v_row.last_full_test_date,
    v_row.next_test_date,
    GREATEST(0, (v_row.next_test_date - v_today)::INT)::INT  AS days_left,
    (v_today >= v_row.next_test_date)::BOOLEAN               AS is_test_day;
END;
$$;

-- RPC: complete_full_test
-- Call after student finishes their 21-day syllabus test.
-- Resets the cycle (last_full_test_date = today → next test in 21 days).
CREATE OR REPLACE FUNCTION public.complete_full_test()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.student_test_cycle (student_id, last_full_test_date)
  VALUES (auth.uid(), CURRENT_DATE)
  ON CONFLICT (student_id) DO UPDATE
    SET last_full_test_date = CURRENT_DATE,
        updated_at = now();
END;
$$;

NOTIFY pgrst, 'reload schema';
