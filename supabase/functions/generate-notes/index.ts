/**
 * generate-notes — Supabase Edge Function
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
      
      Mode: ${smartMode} (if 'Only Formulas', focus on equations. if 'Beginner', simplify concepts).
      Language: Hinglish (Professional, using common Hindi terms in Hinglish for better student connection).

      Structure the output with:
      - Key Concepts (bullet points)
      - Must-Know Formulas (LaTeX format)
      - Common Student Mistakes
      - A 1-minute quick revision summary
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
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
       throw new Error(`Gemini API Error: ${data.error.message} (${data.error.status})`);
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Failed to generate notes.";

    // TRANSFORM: Wrap result in the streaming format the frontend expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // We send it in small chunks to simulate streaming UX
        const chunks = resultText.split(' ');
        for (const word of chunks) {
          const payload = {
            choices: [{
              delta: { content: word + ' ' }
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          // Tiny delay for better UX
          await new Promise(r => setTimeout(r, 5));
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
