import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { topic, attempts } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are a learning analytics engine. Your goal is to identify patterns in student mistakes to help teachers intervene effectively.

========================
🧠 TASK
========================
Identify patterns in student mistakes based on their attempt history.

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "dominant_error": "Sign Error | Concept Confusion | Calculation Mistake | Interpretation Error",
  "concept_gap": "Specific area of the topic that is misunderstood",
  "behavior_pattern": "Overconfident | Underconfident | Careless | Diligent but Struggling",
  "risk_level": "Low | Medium | High",
  "strategy": "Suggested intervention strategy for the teacher"
}`;

    const userPrompt = `Topic: ${topic}
Student Attempts: ${JSON.stringify(attempts)}`;

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
