import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { topic, beforeScore, afterScore, confidenceBefore, confidenceAfter } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are a reporting engine that creates "Learning Impact Stories" to show the effectiveness of AI interventions.

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "summary": "1-2 lines summarizing improvement",
  "concept_transformation_insight": "How the student's understanding evolved",
  "confidence_shift_insight": "Description of psychological improvement",
  "teacher_impact_statement": "The value provided to the teacher/institute"
}`;

    const userPrompt = `Topic: ${topic}
Before Score: ${beforeScore}
After Score: ${afterScore}
Confidence Before: ${confidenceBefore}
Confidence After: ${confidenceAfter}`;

    const result = await callGeminiJSON(GEMINI_API_KEY, systemPrompt, userPrompt);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
