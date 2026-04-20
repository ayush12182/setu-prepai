/**
 * generate-notes — Supabase Edge Function
 * 
 * ENGINE: REFACTORED TO GEMINI-1.5-FLASH-STABLE
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
    console.error("[GenerateNotes] Missing GEMINI_API_KEY");
    return new Response(JSON.stringify({ error: "Configuration Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { chapterName, subject } = await req.json();

    const systemPrompt = `
      You are an expert ${subject} teacher at a top Kota coaching institute like Allen or Aakash. 
      Create high-yield, exam-oriented study notes for: "${chapterName}".
      Language: Hinglish (mix of Hindi + English).
      Include:
      1. Key definitions
      2. Priority MCQ points (NCERT focus)
      3. Common mistakes to avoid
    `;

    const model = "gemini-1.5-flash"; // More explicit model name
    
    console.log(`[GenerateNotes] Starting stream for: ${chapterName}`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nCONTENT REQUEST: Generate study notes for ${chapterName}` }] }],
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
    
    if (!response.ok) {
      const errText = await response.text();
      console.error(`[GenerateNotes] API Error ${response.status}:`, errText);
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
             } catch (e) { /* partial JSON */ }
          }
        }
      },
      flush(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      }
    })), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error(`[GenerateNotes] Global Error:`, error);
    // Return a graceful error stream so the UI doesn't just show '500'
    const errorMsg = "Bhai, notes engine thoda busy hai. Ek baar refresh karke try kar. (AI Temporarily Unavailable)";
    return new Response(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: errorMsg } }] })}\n\ndata: [DONE]\n\n`), {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  }
});
