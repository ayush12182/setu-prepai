
-- Create commune_rooms table for live study rooms
CREATE TABLE public.commune_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  study_mode text NOT NULL DEFAULT 'doubts',
  exam_type text NOT NULL DEFAULT 'jee',
  created_by uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.commune_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view rooms
CREATE POLICY "Authenticated users can view rooms"
  ON public.commune_rooms FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms"
  ON public.commune_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Creators can delete their own rooms
CREATE POLICY "Creators can delete their own rooms"
  ON public.commune_rooms FOR DELETE
  USING (auth.uid() = created_by);

-- Create commune_messages table for real-time chat
CREATE TABLE public.commune_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.commune_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  category text NOT NULL DEFAULT 'Doubt',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.commune_messages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view messages in any room
CREATE POLICY "Authenticated users can view messages"
  ON public.commune_messages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert their own messages
CREATE POLICY "Authenticated users can insert messages"
  ON public.commune_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.commune_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commune_messages;

-- Indexes for performance
CREATE INDEX idx_commune_messages_room_id ON public.commune_messages(room_id);
CREATE INDEX idx_commune_messages_created_at ON public.commune_messages(created_at);
CREATE INDEX idx_commune_rooms_exam_type ON public.commune_rooms(exam_type);
CREATE INDEX idx_commune_rooms_expires_at ON public.commune_rooms(expires_at);
