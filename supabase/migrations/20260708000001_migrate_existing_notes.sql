-- ============================================================
-- MIGRATE EXISTING NOTES → chapter_content (v1.0 Published)
-- ============================================================
-- 
-- Every row in chapter_standardized_notes that has real content
-- is migrated into chapter_content as:
--   status    = 'published'
--   version   = 1
--   version_label = '1.0'
--   source    = 'migration'
--   published_at = now()
--
-- The original table is kept intact (not dropped) so there is
-- zero rollback risk. The generate-notes function will be updated
-- to read from chapter_content instead.
-- ============================================================

INSERT INTO public.chapter_content (
  chapter_id,
  chapter_slug,
  chapter_name,
  subject,
  exam_type,
  language,
  version,
  version_label,
  status,
  raw_content,
  -- Build a minimal ai_context from raw content (first 2000 chars)
  ai_context,
  word_count,
  generation_model,
  source,
  published_at,
  created_at,
  updated_at
)
SELECT
  csn.chapter_id,
  csn.chapter_id AS chapter_slug,   -- chapter_id is already slug-formatted
  csn.chapter_name,
  csn.subject,
  'JEE'          AS exam_type,       -- existing cache is JEE-focused
  csn.language,
  1              AS version,
  '1.0'          AS version_label,
  'published'    AS status,
  csn.content    AS raw_content,
  -- ai_context: first 2000 chars of content, stripped of markdown blocks
  LEFT(
    REGEXP_REPLACE(
      REGEXP_REPLACE(csn.content, '\[METADATA\][\s\S]*?\[\/METADATA\]', '', 'g'),
      '\[[A-Z_]+(\s+[^\]]+)?\]([\s\S]*?)\[\/[A-Z_]+\]', '\2', 'g'
    ),
    2000
  ) AS ai_context,
  -- Approximate word count
  array_length(regexp_split_to_array(trim(csn.content), '\s+'), 1) AS word_count,
  'gemini-2.5-flash' AS generation_model,
  'migration'    AS source,
  now()          AS published_at,
  csn.created_at,
  now()          AS updated_at
FROM public.chapter_standardized_notes csn
WHERE
  csn.content IS NOT NULL
  AND length(trim(csn.content)) > 500   -- skip empty/placeholder rows
ON CONFLICT (chapter_id, exam_type, language, version) DO NOTHING;

-- Log how many were migrated
DO $$
DECLARE
  migrated_count integer;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM public.chapter_content
  WHERE source = 'migration';
  
  RAISE NOTICE '[Migration] Migrated % chapters from chapter_standardized_notes → chapter_content (v1.0 Published)', migrated_count;
END $$;
