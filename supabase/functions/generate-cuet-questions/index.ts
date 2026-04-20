import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CUET_SYSTEM_PROMPT = `You are an expert CUET (UG) question paper designer working for NTA (National Testing Agency).
Generate MCQs identical to actual CUET PYQs.
RULES:
1. Strictly NCERT line-by-line basis.
2. Formal NTA English.
3. No "None/All of the above".
4. Solvable in 30-90 seconds.
5. Return ONLY valid JSON with a "questions" array.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let jobId: string | undefined;
  try {
    const body = await req.json();
    const { job_id, exam, subject, chapter, count = 5 } = body;
    jobId = job_id;

    if (jobId) {
      await supabase.from("bulk_generation_jobs").update({
        status: "running",
        started_at: new Date().toISOString(),
      }).eq("id", jobId);
    }

    const userPrompt = `Generate exactly ${count} CUET questions for ${subject}: ${chapter}. Distribute difficulty: Easy 30%, Medium 50%, Hard 20%. Return JSON with a "questions" array. Each question must have: question_id, question_text, options (object with A/B/C/D keys), correct_option, explanation, concept_tested, difficulty.`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY!, CUET_SYSTEM_PROMPT, userPrompt, 0.5);
    const questions = data.questions || (Array.isArray(data) ? data : []);

    const toInsert = questions.map((q: any) => ({
      question_id: q.question_id || `${exam}_${subject.substring(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      exam,
      subject,
      ncert_chapter: chapter,
      topic: q.concept_tested,
      difficulty: q.difficulty || "Medium",
      question_text: q.question_text,
      options: q.options,
      correct_option: q.correct_option,
      explanation: q.explanation,
      source: "gemini_engine_v2",
      quality_gate_passed: true,
    }));

    const { error: insertErr } = await supabase.from("questions_bank").upsert(toInsert);
    if (insertErr) throw insertErr;

    if (jobId) {
      await supabase.from("bulk_generation_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        questions_generated: toInsert.length,
      }).eq("id", jobId);
    }

    return new Response(JSON.stringify({ success: true, questions: toInsert }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-cuet-questions]", error);
    if (jobId) {
      await supabase.from("bulk_generation_jobs").update({
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
      }).eq("id", jobId);
    }
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
