
-- Table to store per-cycle performance summary and weakness data
CREATE TABLE public.student_cycle_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle_number INTEGER NOT NULL,
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,
  -- Overall performance
  total_questions_attempted INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  overall_accuracy NUMERIC DEFAULT 0,
  total_study_time_seconds INTEGER DEFAULT 0,
  -- Subject-wise accuracy
  physics_accuracy NUMERIC DEFAULT 0,
  chemistry_accuracy NUMERIC DEFAULT 0,
  maths_accuracy NUMERIC DEFAULT 0,
  biology_accuracy NUMERIC DEFAULT 0,
  -- Weak areas (stored as JSONB for flexibility)
  -- Format: [{"chapterId": "phy-1", "subject": "Physics", "accuracy": 35, "weakConcepts": ["Projectile Motion"]}]
  weak_chapters JSONB DEFAULT '[]'::jsonb,
  -- Strong areas
  strong_chapters JSONB DEFAULT '[]'::jsonb,
  -- Chapters that were scheduled but not attempted
  skipped_chapters JSONB DEFAULT '[]'::jsonb,
  -- Major test score (if taken on Day 21)
  major_test_score INTEGER,
  major_test_max_score INTEGER DEFAULT 300,
  major_test_percentile NUMERIC,
  -- Metadata
  exam_mode TEXT DEFAULT 'jee',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, cycle_number)
);

-- Enable RLS
ALTER TABLE public.student_cycle_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cycle history"
  ON public.student_cycle_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle history"
  ON public.student_cycle_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle history"
  ON public.student_cycle_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_student_cycle_history_user ON public.student_cycle_history(user_id, cycle_number DESC);
