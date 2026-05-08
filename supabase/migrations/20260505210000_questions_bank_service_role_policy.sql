-- Allow service_role (Edge Functions) to insert into questions_bank
-- The service role bypasses RLS by default, but this policy ensures
-- explicit INSERT permission for AI-generated question seeding.

-- Grant Edge Functions (service role) full access to questions_bank
CREATE POLICY "service_role_full_access" ON questions_bank
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Also allow AI-generated inserts from authenticated service calls
-- (handles the case where the function uses an anon key fallback)
ALTER TABLE questions_bank ENABLE ROW LEVEL SECURITY;
