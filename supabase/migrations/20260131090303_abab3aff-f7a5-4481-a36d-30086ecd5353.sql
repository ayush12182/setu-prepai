-- Major Test Cycles (21-day cycles)
CREATE TABLE public.major_test_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  test_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Major Test Attempts
CREATE TABLE public.major_test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle_id UUID REFERENCES public.major_test_cycles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'auto_submitted', 'abandoned')),
  tab_switch_count INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  max_score INTEGER DEFAULT 300,
  physics_score INTEGER,
  chemistry_score INTEGER,
  maths_score INTEGER,
  physics_correct INTEGER DEFAULT 0,
  physics_incorrect INTEGER DEFAULT 0,
  physics_unattempted INTEGER DEFAULT 0,
  chemistry_correct INTEGER DEFAULT 0,
  chemistry_incorrect INTEGER DEFAULT 0,
  chemistry_unattempted INTEGER DEFAULT 0,
  maths_correct INTEGER DEFAULT 0,
  maths_incorrect INTEGER DEFAULT 0,
  maths_unattempted INTEGER DEFAULT 0,
  percentile_estimate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Major Test Answers (stores each question's answer)
CREATE TABLE public.major_test_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.major_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  question_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  selected_option TEXT,
  correct_option TEXT NOT NULL,
  is_correct BOOLEAN,
  is_marked_review BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Major Test Chapter Analysis
CREATE TABLE public.major_test_chapter_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES public.major_test_attempts(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  unattempted INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2),
  avg_time_seconds INTEGER,
  strength_level TEXT CHECK (strength_level IN ('strong', 'moderate', 'weak')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.major_test_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.major_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.major_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.major_test_chapter_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cycles (viewable by all authenticated)
CREATE POLICY "Cycles viewable by authenticated users" 
ON public.major_test_cycles FOR SELECT 
USING (auth.role() = 'authenticated');

-- RLS Policies for attempts
CREATE POLICY "Users can view their own attempts" 
ON public.major_test_attempts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" 
ON public.major_test_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts" 
ON public.major_test_attempts FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for answers
CREATE POLICY "Users can view their own answers" 
ON public.major_test_answers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.major_test_attempts 
  WHERE id = major_test_answers.attempt_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their own answers" 
ON public.major_test_answers FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.major_test_attempts 
  WHERE id = major_test_answers.attempt_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can update their own answers" 
ON public.major_test_answers FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.major_test_attempts 
  WHERE id = major_test_answers.attempt_id 
  AND user_id = auth.uid()
));

-- RLS Policies for chapter analysis
CREATE POLICY "Users can view their own chapter analysis" 
ON public.major_test_chapter_analysis FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.major_test_attempts 
  WHERE id = major_test_chapter_analysis.attempt_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their own chapter analysis" 
ON public.major_test_chapter_analysis FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.major_test_attempts 
  WHERE id = major_test_chapter_analysis.attempt_id 
  AND user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_major_test_attempts_user_id ON public.major_test_attempts(user_id);
CREATE INDEX idx_major_test_attempts_cycle_id ON public.major_test_attempts(cycle_id);
CREATE INDEX idx_major_test_answers_attempt_id ON public.major_test_answers(attempt_id);
CREATE INDEX idx_major_test_chapter_analysis_attempt_id ON public.major_test_chapter_analysis(attempt_id);

-- Insert first cycle (starting from today)
INSERT INTO public.major_test_cycles (cycle_number, start_date, end_date, test_date, is_active)
VALUES (1, CURRENT_DATE, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '21 days', true);