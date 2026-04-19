/**
 * jeetu-chat — Supabase Edge Function
 * 
 * ENGINE: REFACTORED TO GEMINI-1.5-FLASH (FINAL)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const encoder = new TextEncoder();
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { message, history = [] } = await req.json();

    const systemPrompt = `
      You are Jeetu Bhaiya, a legendary mentor for JEE/NEET/CUET aspirants. 
      Your style is firm but supportive, like a big brother. 
      Use Hinglish (Hindi + English). 
      Don't just solve problems—give 'Toka' (reality checks) and actionable study plans.
    `;

    const historyTurns = history
      .filter((m: any) => m.content && String(m.content).trim() !== "")
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }]
      }));

    const contents = [
      ...historyTurns,
      { role: 'user', parts: [{ text: String(message) }] }
    ];

    // UPDATED: Standardizing on gemini-1.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
    });

    const data = await response.json();
    
    if (data.error) {
       // FALLBACK: Show clean UI message as requested
       return new Response(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: "AI is temporarily unavailable. Bhai thoda wait kar le, system update ho raha hai." } }] })}\n\ndata: [DONE]\n\n`), {
         headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
       });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI temporarily unavailable. Try again in a moment.";

    const stream = new ReadableStream({
      async start(controller) {
        const words = resultText.split(' ');
        for (const word of words) {
          const payload = { choices: [{ delta: { content: word + ' ' } }] };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          await new Promise(r => setTimeout(r, 10));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "AI temporarily unavailable." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
