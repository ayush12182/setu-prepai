import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON, JEE_PROMPT_CONSTRAINTS } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { count = 15, weakTopics = [], examMode = "JEE" } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const isJee = (examMode || "").toUpperCase().includes("JEE");
    const systemPrompt = isJee
      ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object with a "questions" array. No markdown, no backticks.

${JEE_PROMPT_CONSTRAINTS}`
      : `You are an adaptive learning engine for ${examMode} exam preparation. Generate high-quality MCQs targeting weak areas. Return a JSON object with a "questions" array.`;

    const userPrompt = `Generate ${count} questions for ${examMode}. ${weakTopics.length ? `Focus on weak topics: ${weakTopics.join(", ")}.` : "Mix all subjects."} Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, subject, difficulty.`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);

    return new Response(JSON.stringify({ questions: data.questions || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-adaptive-test]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
