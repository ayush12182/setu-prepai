-- MENTOR DASHBOARD MIGRATION
-- Adds support for Classes/Batches and Mentor access to student data

-- 1. Create Classes/Batches table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT, -- physics, chemistry, etc.
    mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Class Members join table
CREATE TABLE IF NOT EXISTS public.class_members (
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (class_id, student_id)
);

-- 3. RLS POLICIES

-- Classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentors can see their own classes"
    ON public.classes FOR SELECT
    USING (auth.uid() = mentor_id OR public.has_role(auth.uid(), 'admin'));

-- Class Members
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentors can see members of their classes"
    ON public.class_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.classes
        WHERE id = class_id AND mentor_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin'));

-- 4. ATTEMPT ACCESS EXTENSION
-- Allow mentors to see attempts of students in their classes
CREATE POLICY "Mentors can see student attempts"
    ON public.user_mcq_attempts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.class_members cm
        JOIN public.classes c ON c.id = cm.class_id
        WHERE cm.student_id = public.user_mcq_attempts.user_id 
        AND c.mentor_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin'));

-- 5. FUNCTION: Get Batch Behavioral Metrics
-- This aggregates data for a whole class
CREATE OR REPLACE FUNCTION public.get_class_behavioral_metrics(p_class_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT json_build_object(
        'total_attempts', COUNT(*),
        'avg_accuracy', AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100,
        'reflection_rate', AVG(CASE WHEN NOT mistake_skipped THEN 1 ELSE 0 END) * 100,
        'perception_gap', json_build_object(
            'silly_mistakes', COUNT(*) FILTER (WHERE user_selected_mistake = 'silly'),
            'conceptual_gaps', COUNT(*) FILTER (WHERE ai_predicted_mistake = 'conceptual')
        )
    ) INTO result
    FROM public.user_mcq_attempts a
    JOIN public.class_members cm ON cm.student_id = a.user_id
    WHERE cm.class_id = p_class_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
