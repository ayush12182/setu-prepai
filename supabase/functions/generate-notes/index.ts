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

    const systemPrompt = `
      You are an expert ${subject} teacher at a top Kota coaching institute like Allen or Aakash. 
      Create high-yield, exam-oriented study notes for: "${chapterName}".
      Language: Hinglish (mix of Hindi + English).
      Structure:
      1. Major Concept Definitions
      2. Priority MCQ Points (NCERT based)
      3. Common Mistakes/Trap Areas
      4. Quick Revision Summary
      Use formatting like **bold** and bullet points for readability.
    `;

    const model = "gemini-flash-latest";
    try {
      console.log(`[GenerateNotes] Calling Gemini for: ${chapterName}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nTASK: Generate study notes for ${chapterName}` }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GenerateNotes] API Error: ${response.status} - ${errorText}`);
        throw new Error(`API returned ${response.status}`);
      }

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
      console.error(`[GenerateNotes] Processing Error:`, err);
      return new Response(JSON.stringify({ error: "AI Engine temporarily busy. Please try again." }), {
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
