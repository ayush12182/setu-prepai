-- ============================================================
-- PrepEntrance UNIFIED B2B/B2C SCHEMA
-- Adds: organizations, batches, user_type, tests, assigned_practice
-- All attempts still go into user_mcq_attempts (shared backend)
-- ============================================================

-- 1. ORGANIZATIONS (B2B institutions)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    city TEXT,
    plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read orgs"
    ON public.organizations FOR SELECT
    TO authenticated USING (true);

-- 2. EXTEND PROFILES — add user_type and organization linkage
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'b2c_student'
        CHECK (user_type IN ('b2c_student', 'b2b_student', 'b2b_mentor', 'b2b_institution', 'admin')),
    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_org     ON public.profiles(organization_id);

-- 3. BATCHES (replaces/extends the existing "classes" concept, linked to org)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT,
    target_exam TEXT DEFAULT 'JEE',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors see their batches"
    ON public.batches FOR SELECT
    USING (
        auth.uid() = mentor_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = batches.organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    );

CREATE POLICY "Mentors can insert batches"
    ON public.batches FOR INSERT
    WITH CHECK (auth.uid() = mentor_id);

-- 4. BATCH MEMBERS
CREATE TABLE IF NOT EXISTS public.batch_members (
    batch_id   UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    PRIMARY KEY (batch_id, student_id)
);

ALTER TABLE public.batch_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors/institutions see batch members"
    ON public.batch_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.batches b
        WHERE b.id = batch_id
          AND (
              b.mentor_id = auth.uid()
              OR EXISTS (
                  SELECT 1 FROM public.profiles p
                  WHERE p.user_id = auth.uid()
                    AND p.organization_id = b.organization_id
                    AND p.user_type IN ('b2b_institution', 'admin')
              )
          )
    ));

-- 5. TESTS (B2B test creation)
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT DEFAULT 'ai_generated' CHECK (mode IN ('ai_generated', 'manual')),
    -- For AI-generated tests
    topic TEXT,
    subtopic TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER DEFAULT 10,
    -- For manual tests — array of question IDs
    question_ids UUID[] DEFAULT '{}',
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors/institutions can manage tests"
    ON public.tests FOR ALL
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM public.batches b
            JOIN public.profiles p ON p.organization_id = b.organization_id
            WHERE b.id = tests.batch_id
              AND p.user_id = auth.uid()
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    )
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Students can read published tests for their batch"
    ON public.tests FOR SELECT
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM public.batch_members bm
            WHERE bm.batch_id = tests.batch_id
              AND bm.student_id = auth.uid()
        )
    );

-- 6. ASSIGNED PRACTICE (mentor → student targeted drills)
CREATE TABLE IF NOT EXISTS public.assigned_practice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
    question_count INTEGER DEFAULT 10,
    reason TEXT, -- e.g. "Conceptual gap in Friction at high confidence"
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.assigned_practice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see their assigned practice"
    ON public.assigned_practice FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Mentors can assign practice"
    ON public.assigned_practice FOR INSERT
    WITH CHECK (auth.uid() = assigned_by);

CREATE POLICY "Mentors can view their assignments"
    ON public.assigned_practice FOR SELECT
    USING (auth.uid() = assigned_by);

-- 7. EXTEND user_mcq_attempts — add user_type snapshot for analytics queries
-- (no breaking changes; new column is nullable)
ALTER TABLE public.user_mcq_attempts
    ADD COLUMN IF NOT EXISTS user_type_snapshot TEXT,
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS test_id UUID REFERENCES public.tests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_attempts_batch ON public.user_mcq_attempts(batch_id);

-- 8. Allow mentors to see student attempts for students in their batches
-- (Extending existing RLS on user_mcq_attempts)
DROP POLICY IF EXISTS "Mentors can see student attempts" ON public.user_mcq_attempts;

CREATE POLICY "Mentors can see student attempts via batches"
    ON public.user_mcq_attempts FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.batch_members bm
            JOIN public.batches b ON b.id = bm.batch_id
            WHERE bm.student_id = public.user_mcq_attempts.user_id
              AND b.mentor_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    );

-- 9. HELPER FUNCTION: get student weakness profile for a mentor view
CREATE OR REPLACE FUNCTION public.get_student_weakness_profile(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE result JSONB;
BEGIN
    SELECT json_build_object(
        'total_attempts', COUNT(*),
        'accuracy', ROUND(AVG(CASE WHEN a.is_correct THEN 100 ELSE 0 END)::numeric, 1),
        'conceptual_gaps', json_agg(DISTINCT q.subtopic) FILTER (
            WHERE a.is_correct = false
              AND a.confidence_level = 'high'
        ),
        'weak_subtopics', (
            SELECT json_agg(sub_row ORDER BY wrong_count DESC)
            FROM (
                SELECT q2.subtopic,
                       COUNT(*) FILTER (WHERE a2.is_correct = false) AS wrong_count,
                       COUNT(*) AS total
                FROM public.user_mcq_attempts a2
                JOIN public.questions q2 ON q2.id = a2.question_id
                WHERE a2.user_id = p_student_id
                GROUP BY q2.subtopic
                HAVING COUNT(*) FILTER (WHERE a2.is_correct = false) > 0
            ) AS sub_row
        ),
        'confidence_mismatch_count', COUNT(*) FILTER (
            WHERE a.is_correct = false AND a.confidence_level = 'high'
        )
    ) INTO result
    FROM public.user_mcq_attempts a
    JOIN public.questions q ON q.id = a.question_id
    WHERE a.user_id = p_student_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
