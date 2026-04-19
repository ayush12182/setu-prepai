/**
 * jeetu-chat — Supabase Edge Function
 * 
 * ENGINE: Refactored to Google Gemini 1.5 Flash 
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  try {
    const { message, history = [] } = await req.json();

    const systemPrompt = `
      You are Jeetu Bhaiya, a legendary mentor for JEE/NEET/CUET aspirants. 
      Your style is firm but supportive, like a big brother. 
      Use Hinglish (Hindi + English). 
      Don't just solve problems—give 'Toka' (reality checks) and actionable study plans.
      If a student is stressed, motivate them with realistic goal-setting.
    `;

    // Map history to Gemini format
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...history.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bhai, network down hai. Thoda wait kar le.";

    // TRANSFORM: Wrap result in the streaming format the frontend expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // We send it in small chunks to simulate streaming UX
        const words = resultText.split(' ');
        for (const word of words) {
          const payload = {
            choices: [{
              delta: { content: word + ' ' }
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          // Tiny delay for realistic feel
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
