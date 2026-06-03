import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON, JEE_PROMPT_CONSTRAINTS } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { topic, subject, difficulty = "medium", language = "english" } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const isJee = (subject || "").toUpperCase().includes("JEE") || (topic || "").toUpperCase().includes("JEE") || true; // PrepEntrance primarily focuses on JEE questions overhaul
    const systemPrompt = isJee
      ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0-3, "explanation": "..." }.

${JEE_PROMPT_CONSTRAINTS}`
      : `You are a JEE/NEET paper setter. Generate 1 high-quality MCQ. Return ONLY a JSON object: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0-3, "explanation": "..." }`;

    const userPrompt = `Topic: ${topic}, Subject: ${subject}, Difficulty: ${difficulty}, Language: ${language}`;

    const mcq = await callGeminiJSON(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);

    return new Response(JSON.stringify(mcq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-mcq]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
