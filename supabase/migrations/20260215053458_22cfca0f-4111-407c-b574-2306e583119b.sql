-- Allow users to delete their own practice sessions (for cycle reset)
CREATE POLICY "Users can delete their own sessions"
ON public.practice_sessions
FOR DELETE
USING (auth.uid() = user_id);
