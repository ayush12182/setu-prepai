/**
 * get-similar-questions — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o-mini
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  try {
    const { conceptTested, subchapterName, subject, originalQuestion, count = 3 } = await req.json();

    console.log(`[UniversalEngine] Getting similar questions for concept: ${conceptTested}`);

    const systemPrompt = `You are an elite remediation specialist. Generate scaffolded practice questions (easy -> medium -> exam-ready) for the concept the student failed. Return a JSON object with a "questions" array.`;
    const userPrompt = `Failed Concept: ${conceptTested}, original question: ${originalQuestion}. Generate ${count}Questions. Use clear notation.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const questions = JSON.parse(aiData.choices[0].message.content).questions;

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[UniversalEngine] Similar Questions Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
