-- Phase 1: Learning Engine DB Schema
-- Flexible Tree Structure for Syllabus

-- 1. Create Learning Nodes Table
CREATE TABLE IF NOT EXISTS public.learning_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.learning_nodes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('root', 'chapter', 'topic', 'subtopic')),
    exam_type TEXT NOT NULL, -- NEET, JEE_MAIN, JEE_ADVANCED, CUET
    subject_node_id UUID REFERENCES public.learning_nodes(id), -- Cache for fast filtering
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES public.learning_nodes(id) ON DELETE CASCADE,
    subject_node_id UUID REFERENCES public.learning_nodes(id), -- De-normalized for speed
    type TEXT NOT NULL CHECK (type IN ('mcq', 'assertion_reason', 'numerical')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    source TEXT DEFAULT 'NCERT', -- NCERT, PYQ, TEACHER, AI
    text TEXT NOT NULL,
    options JSONB, -- For MCQ/AR: [{id: 1, text: '...'}, {id: 2, text: '...'}]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    ai_hint TEXT,
    tolerance FLOAT DEFAULT 0.01, -- For numerical questions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Update Profiles Table for Teacher Linkage
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS teacher_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subjects TEXT[]; -- For teachers to specify expertise

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_learning_nodes_parent ON public.learning_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_learning_nodes_type ON public.learning_nodes(type);
CREATE INDEX IF NOT EXISTS idx_questions_node ON public.questions(node_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_node_id);
CREATE INDEX IF NOT EXISTS idx_profiles_teacher_id ON public.profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_teacher_code ON public.profiles(teacher_code);

-- 5. RLS Policies
ALTER TABLE public.learning_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Everyone can read learning nodes
CREATE POLICY "Allow public read access to learning_nodes"
    ON public.learning_nodes FOR SELECT
    TO authenticated
    USING (true);

-- Everyone can read questions
CREATE POLICY "Allow public read access to questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (true);

-- Only admins/teachers can modify nodes/questions (Add more specific logic if needed)
CREATE POLICY "Admins can manage nodes"
    ON public.learning_nodes FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can manage questions"
    ON public.questions FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

-- Notify schema change
NOTIFY pgrst, 'reload schema';
