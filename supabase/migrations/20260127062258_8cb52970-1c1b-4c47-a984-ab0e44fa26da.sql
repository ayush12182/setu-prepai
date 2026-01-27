-- Create questions table for storing MCQs
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subchapter_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  concept_tested TEXT NOT NULL,
  common_mistake TEXT,
  source TEXT DEFAULT 'ai_generated',
  pyq_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question attempts table for tracking student progress
CREATE TABLE public.question_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice sessions table
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subchapter_id TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user practice stats table for quick lookups
CREATE TABLE public.user_practice_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_questions_solved INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  chapters_practiced TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_practice_stats ENABLE ROW LEVEL SECURITY;

-- Questions are readable by all authenticated users
CREATE POLICY "Questions are viewable by authenticated users" 
ON public.questions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Users can only see their own attempts
CREATE POLICY "Users can view their own attempts" 
ON public.question_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts" 
ON public.question_attempts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" 
ON public.practice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.practice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.practice_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only see their own stats
CREATE POLICY "Users can view their own stats" 
ON public.user_practice_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_practice_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_practice_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_questions_subchapter ON public.questions(subchapter_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_attempts_user ON public.question_attempts(user_id);
CREATE INDEX idx_attempts_question ON public.question_attempts(question_id);
CREATE INDEX idx_sessions_user ON public.practice_sessions(user_id);

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_practice_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_practice_stats (user_id, total_questions_solved, total_correct, total_time_seconds)
  VALUES (NEW.user_id, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END, NEW.time_taken_seconds)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_questions_solved = user_practice_stats.total_questions_solved + 1,
    total_correct = user_practice_stats.total_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    total_time_seconds = user_practice_stats.total_time_seconds + NEW.time_taken_seconds,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update stats on new attempt
CREATE TRIGGER on_question_attempt_insert
AFTER INSERT ON public.question_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_user_practice_stats();