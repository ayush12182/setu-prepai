/**
 * generate-cuet-questions — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o
 * JOB SYSTEM: Integrated with bulk_generation_jobs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  job_id?:          string;
  exam:             string;
  subject:          string;
  chapter:          string;
  topic?:           string | null;
  subtopic?:        string | null;
  ncert_class?:     number;
  ncert_chapter_number?: number;
  difficulty_mix?:  { Easy: number; Medium: number; Hard: number };
  question_types?:  string[];
  count:            number;
  exam_stage?:      string;
  save_to_db?:      boolean;
}

const CUET_SYSTEM_PROMPT = `You are an expert CUET (UG) question paper designer working for NTA (National Testing Agency).
Generate MCQs identical to actual CUET PYQs.
RULES:
1. STRICTly NCERT line-by-line basis.
2. Formal NTA English.
3. No "None/All of the above".
4. Solvable in 30-90s.
5. Return ONLY a valid JSON array.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body: GenerateRequest = await req.json();
    const { job_id, exam, subject, chapter, count = 5 } = body;

    console.log(`[UniversalEngine] Starting generation for ${exam} - ${subject} (Job: ${job_id})`);

    // 1. Update Job to 'running'
    if (job_id) {
      await supabase.from("bulk_generation_jobs").update({
        status: "running",
        started_at: new Date().toISOString()
      }).eq("id", job_id);
    }

    // 2. Call OpenAI (gpt-4o)
    const prompt = `Generate exactly ${count} CUET questions for ${subject}: ${chapter}. Distribute difficulty: Easy 30%, Medium 50%, Hard 20%. Return as JSON array of objects with fields: question_id, question_text, options (A,B,C,D), correct_option, explanation (short and detailed_steps), concept_tested, difficulty.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: CUET_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const content = aiData.choices[0].message.content;
    const questions = JSON.parse(content).questions || JSON.parse(content);

    // 3. Save to DB
    const toInsert = (Array.isArray(questions) ? questions : [questions]).map((q: any) => ({
      question_id: q.question_id || `${exam}_${subject.substring(0,3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      exam,
      subject,
      ncert_chapter: chapter,
      topic: q.concept_tested,
      difficulty: q.difficulty || "Medium",
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
      explanation: q.explanation,
      source: "universal_engine_v1",
      quality_gate_passed: true
    }));

    const { error: insertErr } = await supabase.from("questions_bank").upsert(toInsert);
    if (insertErr) throw insertErr;

    // 4. Update Job to 'completed'
    if (job_id) {
      await supabase.from("bulk_generation_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        questions_generated: toInsert.length
      }).eq("id", job_id);
    }

    return new Response(JSON.stringify({ success: true, questions: toInsert }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[UniversalEngine] Error:", error);
    if (req.body && (await req.json()).job_id) {
       const { job_id } = await req.json();
       await supabase.from("bulk_generation_jobs").update({
         status: "failed",
         error_message: error instanceof Error ? error.message : String(error)
       }).eq("id", job_id);
    }
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
