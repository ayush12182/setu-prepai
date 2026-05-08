import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { topic, subconcept, previousWeaknessType, validationScore, confidenceAfterAttempt } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an advanced AI tutor responsible for fixing concepts that were NOT mastered after initial explanation.

========================
🧠 TASK
========================
Generate a SECOND-LEVEL intervention with a DIFFERENT teaching approach.
- If first attempt was visual → now use analogy or step-by-step breakdown.
- If misconception → explicitly contrast wrong vs correct thinking.
- Use a conversational "Jeetu Bhaiya" tone.

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "alternate_explanation": "...",
  "simplified_concept": "...",
  "solved_example": "...",
  "reinforcement_questions": [
    {"question": "...", "options": [], "correct_answer": 0, "difficulty": "easy|medium|trap", "reasoning": "..."}
  ],
  "teacher_insight": "Why the student might still be struggling"
}`;

    const userPrompt = `Topic: ${topic}
Subconcept: ${subconcept}
Previous Weakness Type: ${previousWeaknessType}
Validation Score: ${validationScore}/3
Confidence After Attempt: ${confidenceAfterAttempt}`;

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
