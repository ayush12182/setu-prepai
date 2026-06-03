import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON, JEE_PROMPT_CONSTRAINTS } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { conceptTested, subchapterName, subject, originalQuestion, count = 3 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const isJee = (subject || "").toUpperCase().includes("JEE") || (subchapterName || "").toUpperCase().includes("JEE") || true; // PrepEntrance primary focus
    const systemPrompt = isJee
      ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object with a "questions" array. No markdown, no backticks.

${JEE_PROMPT_CONSTRAINTS}`
      : `You are an elite remediation specialist for JEE/NEET. Generate scaffolded practice questions (easy → medium → exam-ready) for a concept the student failed. Return a JSON object with a "questions" array.`;

    const userPrompt = `Failed concept: ${conceptTested} (${subchapterName}, ${subject}). Original question: ${originalQuestion}. Generate ${count} scaffolded questions ordered by increasing difficulty. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, difficulty.`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);

    return new Response(JSON.stringify({ questions: data.questions || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[get-similar-questions]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
