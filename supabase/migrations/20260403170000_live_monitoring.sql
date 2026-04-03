-- Migration: Live Monitoring and Assessment Link Feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: assessment_sessions
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    exam_type TEXT NOT NULL,
    class TEXT NOT NULL,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    question_count INTEGER NOT NULL DEFAULT 20,
    time_limit_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LIVE', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Table: session_participants
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for Guest Onboarding
    student_name TEXT NOT NULL,
    student_phone TEXT,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED')),
    current_question INTEGER DEFAULT 0,
    live_accuracy INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    weak_topics TEXT[] DEFAULT '{}',
    mistake_breakdown JSONB DEFAULT '{"conceptual": 0, "calculation": 0, "silly": 0}',
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional RLS
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- Allow public access for easy testing and guest accounts
CREATE POLICY "Allow public read for assessment_sessions" on public.assessment_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert for assessment_sessions" on public.assessment_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for assessment_sessions" on public.assessment_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read for session_participants" on public.session_participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert for session_participants" on public.session_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for session_participants" on public.session_participants FOR UPDATE USING (true);

-- ENABLE SUPABASE REALTIME for Live Grid monitoring
DO $$
BEGIN
  -- Add table to realtime publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'session_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
  END IF;
END $$;
