/**
 * generate-notes — Supabase Edge Function
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
    const { chapterName, subject, smartMode = 'default' } = await req.json();

    const prompt = `
      You are an expert ${subject} teacher at a top Kota coaching institute. 
      Create detailed, high-yield study notes for the chapter: "${chapterName}".
      Mode: ${smartMode}. Language: Hinglish.
    `;

    const model = "gemini-flash-latest";
    try {
      console.log(`[GenerateNotes] Attempting model: ${model}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `CONTEXT: ${prompt}` }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      });
      
      if (!response.body) throw new Error("No response body");

      return new Response(response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
               try {
                 const data = JSON.parse(line.slice(6));
                 if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                   const content = data.candidates[0].content.parts[0].text;
                   controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
                 }
               } catch (e) { /* skip */ }
            }
          }
        },
        flush(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        }
      })), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });

    } catch (err) {
      console.error(`[GenerateNotes] Stream Error:`, err);
      return new Response(JSON.stringify({ error: "AI temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "AI temporarily unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
