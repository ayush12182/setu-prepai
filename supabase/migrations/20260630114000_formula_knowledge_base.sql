-- 1. Create table for chapter metadata
CREATE TABLE IF NOT EXISTS public.revision_chapter_metadata (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  formula_count integer DEFAULT 0,
  high_priority_formula_count integer DEFAULT 0,
  expected_questions text DEFAULT '1-2',
  jee_weightage text DEFAULT 'Medium',
  difficulty text DEFAULT 'Medium',
  revision_time_mins integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(subject, chapter_name)
);

-- 2. Create table for formulas
CREATE TABLE IF NOT EXISTS public.revision_formulas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid REFERENCES public.revision_chapter_metadata(id) ON DELETE CASCADE,
  subject text NOT NULL,
  chapter_name text NOT NULL,
  topic text,
  title text NOT NULL,
  latex text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  used_for text,
  difficulty text,
  importance integer DEFAULT 3,
  jee_frequency text,
  shortcut text,
  common_mistake text,
  derivation text,
  related_formulas text[] DEFAULT '{}',
  prerequisite_concepts text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS
ALTER TABLE public.revision_chapter_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_formulas ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Students can read, Admins/Edge Functions can modify)
CREATE POLICY "Enable read access for all users" ON public.revision_chapter_metadata FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.revision_chapter_metadata USING (true);

CREATE POLICY "Enable read access for all users" ON public.revision_formulas FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.revision_formulas USING (true);
