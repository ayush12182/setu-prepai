-- ============================================================
-- PERMANENT CONTENT REPOSITORY
-- PrepEntrance — Chapter Content Architecture v2
-- ============================================================
-- 
-- AI generates content ONCE.
-- Students always read from this table.
-- No AI calls happen on student chapter open.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chapter_content (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  chapter_id        text NOT NULL,        -- matches syllabus.ts id e.g. 'phy-1'
  chapter_slug      text NOT NULL,        -- url-safe e.g. 'kinematics'
  chapter_name      text NOT NULL,        -- display name e.g. 'Kinematics'
  subject           text NOT NULL,        -- physics | chemistry | maths | biology
  exam_type         text NOT NULL DEFAULT 'JEE',   -- JEE | NEET | CUET
  language          text NOT NULL DEFAULT 'english',

  -- Versioning
  version           integer NOT NULL DEFAULT 1,
  version_label     text NOT NULL DEFAULT '1.0',   -- semantic e.g. '1.0', '1.1', '2.0'

  -- Lifecycle Status
  -- draft     → AI generated, not yet reviewed
  -- published → Live, served to all students
  -- archived  → Old version, kept for history
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),

  -- ── Structured Content Fields ──────────────────────────
  -- All structured. Frontend renders from JSON.
  -- NO AI calls needed to display any of this.

  -- Overview section
  overview          jsonb,
  -- {
  --   summary: string,
  --   learningOutcomes: string[],
  --   whyItMatters: string,
  --   pyqTrend: string,
  --   prerequisites: string[]
  -- }

  -- Core theory (full markdown text, math delimiters included)
  theory            text,

  -- Formula Library
  formulas          jsonb,
  -- FormulaEntry[]:
  -- [{
  --   title: string, latex: string,
  --   variables: [{symbol, meaning, unit}],
  --   whenToUse: string, commonMistake: string, memoryTrick: string,
  --   difficulty: 'Easy'|'Medium'|'Hard', jeeWeightage: 1-5
  -- }]

  -- Interactive graph definitions (rendered by InteractiveGraph component)
  graphs            jsonb,
  -- GraphDefinition[]:
  -- [{
  --   graphType: 'velocity_time'|'displacement_time'|'projectile_path'|'shm',
  --   title: string, xAxis: string, yAxis: string,
  --   equation: string, sliders: {...}, interactive: true
  -- }]

  -- Interactive diagram definitions (rendered by InteractiveDiagram component)
  diagrams          jsonb,
  -- DiagramDefinition[]:
  -- [{ type: 'projectile_motion'|'free_body_diagram'|..., title: string }]

  -- Worked examples (interactive step-by-step)
  worked_examples   jsonb,
  -- WorkedExample[]:
  -- [{
  --   question: string, hints: string[], thinkTime: string,
  --   steps: string[], finalAnswer: string,
  --   alternativeMethod: string, commonMistakes: string[]
  -- }]

  -- PYQ intelligence
  pyq_insights      jsonb,
  -- {
  --   totalQuestions: number, postCovid: number, preCovid: number,
  --   difficultyDistribution: {easy%, medium%, hard%},
  --   trendingConcepts: string[], yearwiseBreakdown: {year: count}
  -- }

  -- Common mistakes list
  common_mistakes   jsonb,    -- string[]

  -- Quick revision notes (short bullet summary)
  revision_notes    text,

  -- Flashcards for spaced repetition
  flashcards        jsonb,
  -- FlashCard[]: [{ front: string, back: string, difficulty: string }]

  -- Mind map structure
  mind_map          jsonb,
  -- MindMapNode: { label: string, children: MindMapNode[] }

  -- Condensed context for AI tutor (< 2000 tokens)
  -- AI tutor reads THIS — never regenerates full notes
  ai_context        text,

  -- Full raw markdown (legacy compat + fallback rendering)
  raw_content       text,

  -- ── Metadata ───────────────────────────────────────────
  word_count        integer,
  generation_model  text,       -- e.g. 'gemini-2.5-flash'
  source            text DEFAULT 'ai_generated',
  -- 'ai_generated' | 'migration' | 'manual'

  generated_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),

  -- Only one published version per chapter+exam+language at a time
  -- (Enforced via trigger below, not unique constraint — allows multiple drafts)
  UNIQUE (chapter_id, exam_type, language, version)
);

-- ── Indexes ────────────────────────────────────────────────
-- Primary student read path: fast lookup of latest published version
CREATE INDEX IF NOT EXISTS idx_chapter_content_published
  ON public.chapter_content (chapter_id, exam_type, language, status, version DESC);

-- Admin panel listing
CREATE INDEX IF NOT EXISTS idx_chapter_content_status
  ON public.chapter_content (status, subject, exam_type);

CREATE INDEX IF NOT EXISTS idx_chapter_content_chapter_id
  ON public.chapter_content (chapter_id);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE public.chapter_content ENABLE ROW LEVEL SECURITY;

-- Students: read published content only
CREATE POLICY "Students read published chapter content"
  ON public.chapter_content
  FOR SELECT
  USING (status = 'published');

-- Admins/teachers: read all content (including drafts)
CREATE POLICY "Admins read all chapter content"
  ON public.chapter_content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.user_type IN ('admin', 'teacher')
    )
  );

-- Service role can do everything (edge functions use service role)
-- (Service role bypasses RLS by default in Supabase)

-- ── Updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_chapter_content_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER chapter_content_updated_at
  BEFORE UPDATE ON public.chapter_content
  FOR EACH ROW EXECUTE FUNCTION public.update_chapter_content_updated_at();
