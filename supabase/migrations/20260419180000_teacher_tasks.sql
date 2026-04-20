-- Phase 3: B2B Assigned Tasks
-- Allows teachers to push specific learning nodes to students

CREATE TABLE IF NOT EXISTS public.teacher_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    node_id UUID REFERENCES public.learning_nodes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    target_student_ids UUID[], -- NULL means all students linked to this teacher
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for teacher_tasks
ALTER TABLE public.teacher_tasks ENABLE ROW LEVEL SECURITY;

-- Teachers can see and manage their own tasks
CREATE POLICY "Teachers can manage their own tasks"
    ON public.teacher_tasks FOR ALL
    TO authenticated
    USING (teacher_id = auth.uid());

-- Students can see tasks assigned to them or their teacher's general tasks
CREATE POLICY "Students can see assigned tasks"
    ON public.teacher_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND (
                teacher_id = teacher_tasks.teacher_id 
                AND (target_student_ids IS NULL OR auth.uid() = ANY(target_student_ids))
            )
        )
    );

-- Notify schema change
NOTIFY pgrst, 'reload schema';
