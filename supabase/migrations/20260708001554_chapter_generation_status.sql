-- Create the chapter generation status table for locking
CREATE TABLE chapter_generation_status (
    chapter_id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('idle', 'generating', 'published', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE chapter_generation_status ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the status (so the frontend can poll)
CREATE POLICY "Enable public read access" ON chapter_generation_status
    FOR SELECT
    USING (true);

-- Allow service role to perform all operations
CREATE POLICY "Enable service role all access" ON chapter_generation_status
    FOR ALL
    USING (true)
    WITH CHECK (true);
