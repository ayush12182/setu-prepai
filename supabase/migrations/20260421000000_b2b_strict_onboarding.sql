-- ─── B2B Strict Onboarding Migration ────────────────────────────────────────
-- Creates student_batch_map and batch_leaderboard tables.
-- Enforces that every student belongs to exactly one batch.

-- ── student_batch_map ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_batch_map (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id    UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT student_batch_map_unique UNIQUE (student_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_sbm_student ON public.student_batch_map(student_id);
CREATE INDEX IF NOT EXISTS idx_sbm_batch   ON public.student_batch_map(batch_id);

ALTER TABLE public.student_batch_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student can read own batch map"
  ON public.student_batch_map FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "service role full access sbm"
  ON public.student_batch_map FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── batch_leaderboard ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.batch_leaderboard (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id             UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  score                NUMERIC(10,2)  NOT NULL DEFAULT 0,
  accuracy             NUMERIC(5,2)   NOT NULL DEFAULT 0,   -- 0–100
  questions_attempted  INTEGER        NOT NULL DEFAULT 0,
  consistency_score    NUMERIC(5,2)   NOT NULL DEFAULT 0,   -- 0–100
  rank                 INTEGER,
  last_updated         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  CONSTRAINT batch_leaderboard_unique UNIQUE (student_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_bl_batch_rank ON public.batch_leaderboard(batch_id, rank NULLS LAST);

ALTER TABLE public.batch_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batch members can read leaderboard"
  ON public.batch_leaderboard FOR SELECT
  USING (
    batch_id IN (
      SELECT batch_id FROM public.student_batch_map WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "service role full access bl"
  ON public.batch_leaderboard FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── ensure batches.total_students column exists ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'batches' AND column_name = 'total_students'
  ) THEN
    ALTER TABLE public.batches ADD COLUMN total_students INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ── ensure batches.join_code is unique ────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'batches' AND indexname = 'batches_join_code_unique'
  ) THEN
    CREATE UNIQUE INDEX batches_join_code_unique ON public.batches(join_code);
  END IF;
END $$;

-- ── helper: recompute ranks for a batch ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.refresh_batch_ranks(p_batch_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.batch_leaderboard bl
  SET rank = sub.new_rank
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY batch_id
        ORDER BY score DESC, accuracy DESC, questions_attempted DESC
      ) AS new_rank
    FROM public.batch_leaderboard
    WHERE batch_id = p_batch_id
  ) sub
  WHERE bl.id = sub.id;
END;
$$;

-- ── helper: get leaderboard with profile names ────────────────────────────
CREATE OR REPLACE FUNCTION public.get_batch_leaderboard(p_batch_id UUID, p_limit INT DEFAULT 20)
RETURNS TABLE (
  student_id           UUID,
  full_name            TEXT,
  avatar_url           TEXT,
  score                NUMERIC,
  accuracy             NUMERIC,
  questions_attempted  INTEGER,
  rank                 INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.student_id,
    COALESCE(p.full_name, 'Student')::TEXT,
    p.avatar_url,
    bl.score,
    bl.accuracy,
    bl.questions_attempted,
    bl.rank
  FROM public.batch_leaderboard bl
  LEFT JOIN public.profiles p ON p.user_id = bl.student_id
  WHERE bl.batch_id = p_batch_id
  ORDER BY bl.rank ASC NULLS LAST
  LIMIT p_limit;
END;
$$;
