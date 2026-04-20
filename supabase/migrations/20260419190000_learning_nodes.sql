-- Phase 4: Hierarchical Syllabus & Practice
-- This table powers the Subject -> Chapter -> Topic -> Subtopic tree

CREATE TABLE IF NOT EXISTS public.bulk_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    target_count INTEGER DEFAULT 10,
    status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'polling', 'completed', 'failed'
    error_message TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for jobs
ALTER TABLE public.bulk_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own jobs" ON public.bulk_generation_jobs FOR ALL TO authenticated USING (created_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.learning_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.learning_nodes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('root', 'chapter', 'topic', 'subtopic')),
    exam_type TEXT NOT NULL, -- 'NEET', 'JEE', 'CUET'
    subject_node_id UUID REFERENCES public.learning_nodes(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.learning_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learning nodes are publicly readable" 
    ON public.learning_nodes FOR SELECT 
    TO authenticated 
    USING (true);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_learning_nodes_parent ON public.learning_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_learning_nodes_exam ON public.learning_nodes(exam_type);

-- Seed Data (Initial Syllabus)

-- 1. ROOT SUBJECTS
INSERT INTO public.learning_nodes (id, name, type, exam_type, sort_order) VALUES
('b1010101-b101-b101-b101-b10101010101', 'Biology', 'root', 'NEET', 1),
('p1010101-p101-p101-p101-p10101010101', 'Physics', 'root', 'NEET', 2),
('c1010101-c101-c101-c101-c10101010101', 'Chemistry', 'root', 'NEET', 3),
('p2020202-p202-p202-p202-p20202020202', 'Physics', 'root', 'JEE', 1),
('c2020202-c202-c202-c202-c20202020202', 'Chemistry', 'root', 'JEE', 2),
('m2020202-m202-m202-m202-m20202020202', 'Mathematics', 'root', 'JEE', 3),
('e3030303-e303-e303-e303-e30303030303', 'English Language', 'root', 'CUET', 1),
('g3030303-g303-g303-g303-g30303030303', 'General Test', 'root', 'CUET', 2),
('b3030303-b303-b303-b303-b30303030303', 'Biology (Domain)', 'root', 'CUET', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. CHAPTERS (Biology NEET)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Cell: The Unit of Life', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 1),
('Plant Physiology', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 2),
('Human Physiology', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 3),
('Genetics and Evolution', 'chapter', 'NEET', 'b1010101-b101-b101-b101-b10101010101', 4)
ON CONFLICT DO NOTHING;

-- 3. CHAPTERS (Physics NEET/JEE)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Physical World and Measurement', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 1),
('Kinematics', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 2),
('Laws of Motion', 'chapter', 'NEET', 'p1010101-p101-p101-p101-p10101010101', 3),
('Electrostatics', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 1),
('Current Electricity', 'chapter', 'JEE', 'p2020202-p202-p202-p202-p20202020202', 2)
ON CONFLICT DO NOTHING;

-- 4. CHAPTERS (Chemistry NEET/JEE)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Some Basic Concepts of Chemistry', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 1),
('Structure of Atom', 'chapter', 'NEET', 'c1010101-c101-c101-c101-c10101010101', 2),
('Organic Chemistry - Some Basic Principles', 'chapter', 'JEE', 'c2020202-c202-c202-c202-c20202020202', 1)
ON CONFLICT DO NOTHING;

-- 5. CHAPTERS (Maths JEE)
INSERT INTO public.learning_nodes (name, type, exam_type, parent_id, sort_order) VALUES
('Sets, Relations and Functions', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 1),
('Complex Numbers and Quadratic Equations', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 2),
('Calculus', 'chapter', 'JEE', 'm2020202-m202-m202-m202-m20202020202', 3)
ON CONFLICT DO NOTHING;

-- Notify schema change
NOTIFY pgrst, 'reload schema';
