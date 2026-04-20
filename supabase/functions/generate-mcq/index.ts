import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

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

    const systemPrompt = `You are a JEE/NEET paper setter. Generate 1 high-quality MCQ. Return ONLY a JSON object: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0-3, "explanation": "..." }`;
    const userPrompt = `Topic: ${topic}, Subject: ${subject}, Difficulty: ${difficulty}, Language: ${language}`;

    const mcq = await callGeminiJSON(GEMINI_API_KEY, systemPrompt, userPrompt, 0.4);

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
