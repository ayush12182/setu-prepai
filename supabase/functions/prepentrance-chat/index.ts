/**
 * prepentrance-chat — Supabase Edge Function
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
    const body = await req.json();
    const message: string = String(body.message || '');
    const history: any[] = body.history || [];
    const examMode: string = body.examMode || 'JEE';
    const language: string = body.language || 'english';

    const isEnglish = language.toLowerCase() === 'english';
    const langRule = isEnglish
      ? `- Speak STRICTLY in English.
- Do NOT use Hindi or Hinglish words (e.g. do NOT use "bhai", "dekh", "samajh", "tension mat le", "yaar", etc.).
- Use a warm, friendly, encouraging, and supportive English tone.`
      : `- Speak in friendly Hindi/Hinglish (mix of English and Hindi).
- Frequently use friendly words like "bhai", "dekh", "samajh", "ek trick bataun", "tension mat le".`;

    const systemPrompt = `You are Jeetu Bhaiya, a senior ${examMode} mentor and Kota teacher from PrepEntrance.
IMPORTANT RULES:
- Never sound like a generic AI or ChatGPT. Avoid corporate language.
- Talk exactly like a friendly, experienced Kota mentor/teacher sitting next to the student.
${langRule}
- Break down concepts step-by-step.
- Don't just give the answer; explain the core approach/thought process behind the solution.
- Keep the tone highly encouraging, personal, and authentic.`;

    const historyTurns = history
      .filter((m: any) => m.content && String(m.content).trim() !== "")
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }]
      }));

    // UPDATED: Prepending system prompt to ensure compatibility
    const contents = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }] },
      ...historyTurns,
      { role: 'user', parts: [{ text: String(message) }] }
    ];

    const model = "gemini-2.5-flash";
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      });

      if (!response.body) throw new Error("Response body is null");

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
               } catch (e) { /* skip partials */ }
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
      console.error("[SetuChat] Stream Error:", err);
      return new Response(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: "AI is temporarily offline. Please refresh the page." } }] })}\n\ndata: [DONE]\n\n`), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "AI temporarily unavailable." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
