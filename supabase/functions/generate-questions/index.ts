import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callGeminiJSON, JEE_PROMPT_CONSTRAINTS } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let jobId: string | undefined;
  try {
    const { job_id, examMode, subject, chapterId, chapterName, subchapterId, subchapterName, difficulty, count = 5 } = await req.json();
    jobId = job_id;

    const isJee = (examMode || "").toUpperCase().includes("JEE");
    const systemPrompt = isJee
      ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object with a "questions" array. No markdown, no backticks.

${JEE_PROMPT_CONSTRAINTS}`
      : `You are a world-class ${examMode} exam designer. Generate high-quality MCQs for ${subject}. Return a JSON object with a "questions" array. No markdown, no backticks.`;

    const userPrompt = `Generate ${count} questions for ${chapterName} - ${subchapterName}. Difficulty: ${difficulty}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);
    const questions = data.questions || [];

    const toInsert = questions.map((q: any) => ({
      exam: examMode,
      subject,
      chapter_id: chapterId || chapterName,
      subchapter_id: subchapterId || subchapterName,
      difficulty: q.difficulty || difficulty || "medium",
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested || subchapterName,
    }));

    // Try to persist to DB — but don't fail the request if insert errors
    // (e.g. subject constraint violation when called from practice page with exam name)
    let inserted: any[] | null = null;
    try {
      const { data, error: insertErr } = await supabase
        .from("questions")
        .insert(toInsert)
        .select();
      if (!insertErr) inserted = data;
      else console.warn("[generate-questions] Insert skipped:", insertErr.message);
    } catch (e) {
      console.warn("[generate-questions] Insert failed silently:", e);
    }

    if (jobId) {
      await supabase.from("bulk_generation_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        questions_generated: toInsert.length,
      }).eq("id", jobId);
    }

    return new Response(JSON.stringify({ success: true, questions: inserted || toInsert }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-questions]", error);
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
