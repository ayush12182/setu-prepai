import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { weakTopics, fixedTopics, classLevel } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `Generate a 5-question daily practice set (Retention Machine) for a Class ${classLevel} student.
Input includes Weak Topics and Recently Fixed Topics.

========================
🧠 RULES
========================
- 3 questions from weak topics (focus on core gaps).
- 2 from recently fixed topics (reinforce memory).
- Include 1 trap question to check for recurring misconceptions.
- Goal: Prevent relapse and build retention.

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 0,
      "topic": "...",
      "type": "retention | weakness | trap",
      "explanation": "..."
    }
  ]
}`;

    const userPrompt = `Weak Topics: ${JSON.stringify(weakTopics)}
Recently Fixed Topics: ${JSON.stringify(fixedTopics)}`;

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
