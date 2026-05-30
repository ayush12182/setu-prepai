-- ============================================================
-- PrepEntrance B2B CUSTOM SYLLABUS SCHEMA
-- Allows organizations to define their own chapters and topics,
-- mapping them to PrepEntrance's global concepts.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.organization_syllabus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    custom_chapter_name TEXT NOT NULL,
    custom_topic_name TEXT NOT NULL,
    global_topic_reference TEXT, -- Maps to PrepEntrance's internal global topic/subtopic
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.organization_syllabus ENABLE ROW LEVEL SECURITY;

-- Institutions can manage their own syllabus
CREATE POLICY "Institutions manage their syllabus"
    ON public.organization_syllabus FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = organization_syllabus.organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = organization_syllabus.organization_id
              AND p.user_type IN ('b2b_institution', 'admin')
        )
    );

-- Everyone in the org can read the syllabus
CREATE POLICY "Org members can read syllabus"
    ON public.organization_syllabus FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
              AND p.organization_id = organization_syllabus.organization_id
        )
    );
