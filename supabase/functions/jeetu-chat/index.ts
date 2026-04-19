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
    `;

    // Map history to Gemini format with strict validation
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

    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-pro'];
    let resultText = "";
    let lastError = "";

    for (const modelName of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
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
           lastError = data.error.message;
           continue; // Try next model
        }
        
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response.";
        if (resultText) break; // Success!
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!resultText) {
      throw new Error(`Gemini Multi-Model Failure. Last Error: ${lastError}`);
    }

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
