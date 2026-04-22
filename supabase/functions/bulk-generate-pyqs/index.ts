/**
 * bulk-generate-pyqs — Supabase Edge Function
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { job_id, exam, subject, chapter, difficulty = "Mixed", count = 20 } = await req.json();

    console.log(`[UniversalEngine] Bulk PYQ generation for ${exam} (Job: ${job_id})`);

    if (job_id) {
      await supabase.from("bulk_generation_jobs").update({
        status: "running",
        started_at: new Date().toISOString()
      }).eq("id", job_id);
    }

    const systemPrompt = `You are an expert ${exam} question designer. Generate authentic PYQ-style MCQs. Return a JSON object with a "questions" array.`;
    const userPrompt = `Generate ${count} questions for ${subject} - ${chapter}. Difficulty: ${difficulty}. Include options, correct_option, and explanation.`;

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.4, response_mime_type: "application/json" },
        }),
      }
    );

    if (!aiRes.ok) throw new Error(`Gemini error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const questions = JSON.parse(rawText).questions;

    const toInsert = questions.map((q: any) => ({
      exam,
      subject,
      topic: chapter,
      ncert_chapter: chapter,
      difficulty: q.difficulty || "Medium",
      question_text: q.question_text,
      options: q.options || { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct_option: q.correct_option,
      explanation: q.explanation,
      pyq_similar: true,
      generation_model: "gemini-1.5-flash",
    }));

    const { error: insertErr } = await supabase.from("questions_bank").insert(toInsert);
    if (insertErr) throw insertErr;

    if (job_id) {
      await supabase.from("bulk_generation_jobs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        questions_generated: toInsert.length
      }).eq("id", job_id);
    }

    return new Response(JSON.stringify({ success: true, count: toInsert.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[UniversalEngine] Bulk PYQ Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
