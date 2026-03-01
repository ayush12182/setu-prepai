
-- Table for AI-generated personalized learning roadmaps
CREATE TABLE public.learning_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  focus_area TEXT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmaps" ON public.learning_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON public.learning_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON public.learning_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow teachers/admins to read all student profiles for the dashboard
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Allow teachers to view all learning profiles
CREATE POLICY "Teachers can view all learning profiles" ON public.learning_profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Allow teachers to view all practice stats
CREATE POLICY "Teachers can view all practice stats" ON public.user_practice_stats
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Allow teachers to view all question attempts
CREATE POLICY "Teachers can view all question attempts" ON public.question_attempts
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Allow teachers to view all diagnostic attempts
CREATE POLICY "Teachers can view all diagnostic attempts" ON public.diagnostic_attempts
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'moderator')
  );

-- Trigger for updated_at
CREATE TRIGGER update_learning_roadmaps_updated_at
  BEFORE UPDATE ON public.learning_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
