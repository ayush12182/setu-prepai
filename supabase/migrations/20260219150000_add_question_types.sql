-- Add support for new question types
ALTER TABLE "public"."questions" 
ADD COLUMN "type" text NOT NULL DEFAULT 'MCQ' CHECK (type IN ('MCQ', 'INTEGER', 'MATCH')),
ADD COLUMN "integer_answer" numeric,
ADD COLUMN "tolerance" numeric DEFAULT 0,
ADD COLUMN "match_pairs" jsonb;

COMMENT ON COLUMN "public"."questions"."type" IS 'Type of question: MCQ, INTEGER, or MATCH';
COMMENT ON COLUMN "public"."questions"."match_pairs" IS 'Structure for match type: { left: string[], right: string[], mapping: Record<string, number> }';
