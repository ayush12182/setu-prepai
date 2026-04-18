/**
 * generate-notes — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o-mini (for speed)
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
    const { chapterName, subject, topics = [], smartMode = 'default', language = 'hinglish', examMode = 'JEE' } = await req.json();

    console.log(`[UniversalEngine] Generating notes for ${chapterName} (${subject})`);

    const systemPrompt = `You are a Jeetu Bhaiya style teacher. Generate high-quality classroom notes. Use Hinglish if requested. Return markdown.`;
    const userPrompt = `Subject: ${subject}, Chapter: ${chapterName}, Topics: ${topics.join(', ')}, Mode: ${smartMode}, Language: ${language}, Exam: ${examMode}. Use clear ## headers.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Mini is perfect for notes, fast and cheap
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[UniversalEngine] Notes Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
