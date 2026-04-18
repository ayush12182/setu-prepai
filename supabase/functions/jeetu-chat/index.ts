/**
 * jeetu-chat — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Standard CORS OPTIONS handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, examMode, language = 'english' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log(`[JeetuChat] Processing request for exam: ${examMode}, lang: ${language}`);

    // Call OpenAI
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are Jeetu Bhaiya, an elite Kota mentor. Explain concepts clearly. Maintain a friendly yet professional senior-mentor tone." },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiRes.ok) {
       const errBody = await aiRes.text();
       throw new Error(`OpenAI error: ${aiRes.status} - ${errBody}`);
    }

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("[JeetuChat] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
