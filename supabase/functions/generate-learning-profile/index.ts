import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, quizAttempts } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an AI learning analyst for JEE/NEET students. Analyze quiz attempts and identify weak topics, strong topics, and conceptual gaps. Return a JSON object with a "profile" object.`;
    const userPrompt = `Student Quiz Attempts: ${JSON.stringify(quizAttempts)}. Identify: weak_topics (array), strong_topics (array), concept_score (0-100), speed_score (0-100), recommended_focus (array of topic strings).`;

    const data = await callGeminiJSON<{ profile: any }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);

    return new Response(JSON.stringify({ profile: data.profile || data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-learning-profile]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
