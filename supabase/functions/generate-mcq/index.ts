/**
 * generate-mcq — Supabase Edge Function
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

  try {
    const { topic, subject, difficulty = "medium", language = "english" } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    console.log(`[UniversalEngine] Generating single MCQ for ${topic}`);

    const systemPrompt = `You are a JEE/NEET paper setter. Generate 1 high-quality MCQ. Return ONLY a JSON object: { "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correctIndex": 0-3, "explanation": "..." }`;
    const userPrompt = `Topic: ${topic}, Subject: ${subject}, Difficulty: ${difficulty}, Language: ${language}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    const mcq = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(mcq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[UniversalEngine] MCQ Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
