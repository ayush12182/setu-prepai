-- Create standard notes table to make chapter notes deterministic
CREATE TABLE IF NOT EXISTS public.chapter_standardized_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id text NOT NULL,
  chapter_name text NOT NULL,
  subject text NOT NULL,
  language text NOT NULL DEFAULT 'english',
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chapter_standardized_notes_key UNIQUE (chapter_id, language)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chapter_standardized_notes ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow public read access to standardized notes" 
ON public.chapter_standardized_notes 
FOR SELECT 
USING (true);

-- Allow insertion/updating (primarily done by Edge Functions or Admin scripts)
CREATE POLICY "Allow service insert to standardized notes" 
ON public.chapter_standardized_notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service update to standardized notes" 
ON public.chapter_standardized_notes 
FOR UPDATE 
USING (true);
