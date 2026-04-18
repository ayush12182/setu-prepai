/**
 * analyze-handwritten-notes — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o-mini (Vision)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64, subject, topic, language = 'english' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    if (!imageBase64) throw new Error("No image provided");

    console.log(`[UniversalEngine] Analyzing handwritten notes for ${subject} - ${topic}`);

    const systemPrompt = `You are Jeetu Bhaiya, a senior Kota mentor. Analyze the student's handwritten notes. Correct mistakes, highlight strengths, and give exam tips. Return Markdown.`;
    const userPrompt = `Analysis for ${subject}: ${topic}. Use ${language}. Link to NCERT if possible.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Vision capability
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[UniversalEngine] Analysis Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
