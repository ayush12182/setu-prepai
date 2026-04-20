/**
 * generate-learning-profile — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, quizAttempts } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    console.log(`[UniversalEngine] Generating learning profile for user: ${userId}`);

    const systemPrompt = `You are an AI learning analyst. Analyze student quiz attempts and identify weak topics, strong topics, and conceptual gaps. Return a JSON object with a "profile" object.`;
    const userPrompt = `Student Quiz Attempts: ${JSON.stringify(quizAttempts)}. Identify: weak_topics (array), strong_topics (array), concept_score (0-100), and speed_score (0-100).`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);
    const data = await aiRes.json();
    const profile = JSON.parse(data.choices[0].message.content).profile;

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[UniversalEngine] Profile Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
