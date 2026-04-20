-- Create table for storing processed lecture notes
CREATE TABLE public.lecture_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  video_title TEXT,
  thumbnail_url TEXT,
  
  -- Generated content
  structured_notes TEXT,
  key_timestamps JSONB DEFAULT '[]'::jsonb,
  formulas JSONB DEFAULT '[]'::jsonb,
  flashcards JSONB DEFAULT '[]'::jsonb,
  pyq_connections JSONB DEFAULT '[]'::jsonb,
  one_page_summary TEXT,
  
  -- Metadata
  subject TEXT,
  chapter TEXT,
  duration_seconds INTEGER,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lecture_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own lecture notes"
ON public.lecture_notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lecture notes"
ON public.lecture_notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lecture notes"
ON public.lecture_notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lecture notes"
ON public.lecture_notes
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lecture_notes_updated_at
BEFORE UPDATE ON public.lecture_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();