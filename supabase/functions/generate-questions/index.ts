/**
 * generate-questions — Supabase Edge Function
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
    const { job_id, examMode, subject, chapterName, subchapterName, difficulty, count = 5 } = await req.json();

    console.log(`[UniversalEngine] Starting Gemini generation for ${examMode} (Job: ${job_id})`);

    const systemPrompt = `You are a world-class ${examMode} exam designer. Generate high-quality MCQs for ${subject}. Return ONLY a JSON object with a "questions" array. No markdown, no backticks.`;
    const userPrompt = `Generate ${count} questions for ${chapterName} - ${subchapterName}. Difficulty: ${difficulty}. 
    Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), and a clear explanation.`;

    const model = "gemini-flash-latest";
    try {
      console.log(`[UniversalEngine] Attempting model: ${model}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nTask: ${userPrompt}` }] }],
          generationConfig: {
            temperature: 0.1, // Low temperature for high JSON reliability
            response_mime_type: "application/json",
          }
        }),
      });
      
      data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error(`Model ${model} returned empty candidates`);
      }
    } catch (err) {
      console.error(`[UniversalEngine] Error with model ${model}:`, err);
      throw err;
    }

    const resultText = data.candidates[0].content.parts[0].text;
    const questions = JSON.parse(resultText).questions;

    const toInsert = questions.map((q: any) => ({
      exam: examMode,
      subject,
      chapter_id: chapterName,
      subchapter_id: subchapterName,
      difficulty: q.difficulty || difficulty || "medium",
      question_text: q.question_text,
      option_a: q.option_a || q.options?.A,
      option_b: q.option_b || q.options?.B,
      option_c: q.option_c || q.options?.C,
      option_d: q.option_d || q.options?.D,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested || subchapterName,
    }));

    const { error: insertErr } = await supabase.from("questions").insert(toInsert);
    if (insertErr) throw insertErr;

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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
