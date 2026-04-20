-- ============================================================
-- SETU Test Assignment & Visibility System
-- 20260419000000_test_assignment_system.sql
-- ============================================================

-- 1. Table: student_assessments
-- Tracks explicit assignments and status for students
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id   UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
    teacher_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
    assigned_at     TIMESTAMPTZ DEFAULT now(),
    started_at       TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    UNIQUE(student_id, assessment_id)
);

ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students see own assigned assessments" ON public.student_assessments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers see assessments they assigned" ON public.student_assessments
    FOR SELECT USING (auth.uid() = teacher_id);

-- 2. Table: material_access
-- Tracks which students have viewed shared notes/materials
CREATE TABLE IF NOT EXISTS public.material_access (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id     UUID NOT NULL REFERENCES public.batch_materials(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_viewed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(material_id, student_id)
);

ALTER TABLE public.material_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own material access" ON public.material_access
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers see material access for their materials" ON public.material_access
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.batch_materials
            WHERE id = material_access.material_id AND uploaded_by = auth.uid()
        )
    );

-- 3. Automation: Assign test on creation
CREATE OR REPLACE FUNCTION public.assign_test_to_students()
RETURNS TRIGGER AS $$
BEGIN
    -- If batch_id is present, assign to all students in that batch
    IF NEW.batch_id IS NOT NULL THEN
        INSERT INTO public.student_assessments (student_id, assessment_id, teacher_id)
        SELECT student_id, NEW.id, NEW.created_by
        FROM public.batch_members
        WHERE batch_id = NEW.batch_id
        ON CONFLICT (student_id, assessment_id) DO NOTHING;
    ELSE
        -- If no batch_id, assign to all students linked to this teacher
        INSERT INTO public.student_assessments (student_id, assessment_id, teacher_id)
        SELECT student_id, NEW.id, NEW.created_by
        FROM public.student_teacher_links
        WHERE teacher_id = NEW.created_by AND is_active = true
        ON CONFLICT (student_id, assessment_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_assign_test_on_creation
    AFTER INSERT ON public.assessment_sessions
    FOR EACH ROW EXECUTE FUNCTION public.assign_test_to_students();

-- 4. Automation: Assign active tests to new student link
CREATE OR REPLACE FUNCTION public.assign_active_tests_to_new_student()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.student_assessments (student_id, assessment_id, teacher_id)
    SELECT NEW.student_id, id, NEW.teacher_id
    FROM public.assessment_sessions
    WHERE created_by = NEW.teacher_id AND status = 'ACTIVE'
    ON CONFLICT (student_id, assessment_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_assign_active_tests_to_new_student
    AFTER INSERT ON public.student_teacher_links
    FOR EACH ROW EXECUTE FUNCTION public.assign_active_tests_to_new_student();

-- 5. Enable Realtime
ALter publication supabase_realtime add table student_assessments;
ALter publication supabase_realtime add table material_access;
