import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { stream = "jee" } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const subjects = stream === "neet" ? "Physics, Chemistry, Biology" : "Physics, Chemistry, Mathematics";
    const systemPrompt = `You are an assessment designer for Class 10 students choosing the ${stream.toUpperCase()} stream. Generate a diagnostic test. Return a JSON object with a "questions" array.`;
    const userPrompt = `Generate 30 diagnostic questions for ${stream.toUpperCase()} stream. Subjects: ${subjects}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, subject, difficulty (easy/medium/hard).`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.4);

    return new Response(JSON.stringify({ questions: data.questions || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-diagnostic-test]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
