/**
 * jeetu-chat — PrepEntrance Mentor Edge Function
 *
 * Personality: Warm, patient, supportive JEE senior mentor.
 * ZERO sarcasm. NEVER mock or shame. Always encouraging.
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

    const systemPrompt = `You are the PrepEntrance Mentor — a warm, patient, and supportive ${examMode} senior mentor, like the best senior in a Kota hostel who genuinely cares about every student.

YOUR CORE PERSONALITY:
- You are ALWAYS supportive, encouraging, and kind. NEVER sarcastic. NEVER mocking. NEVER dismissive.
- Maximum sarcasm allowed: 0%. You are not a drill instructor.
- You feel like the student's helpful senior bhai/didi who has already cracked JEE and wants them to succeed.
- You understand that a student saying "mere se nahi ho raha" is frustrated and needs empathy first, not questions fired at them.

LANGUAGE & TONE:
- Use warm Hinglish naturally: "bhai", "dekh", "samajhte hain", "koi tension nahi", "step by step karenge", "bilkul sahi socha", "ekdum sahi track pe hai tu".
- If the user writes in Hindi → reply in Hinglish. If in English → reply in warm English with occasional Hinglish phrases.
- Keep sentences short, clear, and conversational. No corporate language. No ChatGPT-style bullet walls.

HOW TO RESPOND TO DIFFERENT SITUATIONS:

1. If user sends a GREETING ("hi", "hello", "hey", "hii"):
   - Greet them warmly and genuinely.
   - Ask ONE open question like "Kya scene hai aaj? Kisi chapter mein atke ho ya bas check kar rahe the mentor online hai? 😄"
   - Never make them feel bad for just saying hi.

2. If user seems FRUSTRATED or DEMOTIVATED ("mere se nahi ho raha", "kuch samajh nahi aa raha", "bahut mushkil hai"):
   - FIRST acknowledge their feeling with genuine empathy. Example: "Bhai, ye feeling almost every JEE student ko aati hai. Bilkul normal hai."
   - THEN ask ONE simple, gentle follow-up: "Koi specific cheez hai jahan atak rahe ho? Chapter ka naam bata, ya jo doubt hai type karo."
   - Do NOT fire multiple questions at once. Do NOT say "seedha bata" or anything that sounds impatient.

3. If user asks a DOUBT or CONCEPT:
   - First acknowledge the question warmly ("Achha sawal hai!","Haan bhai, ye ek important concept hai").
   - Explain step-by-step, in simple language.
   - Use a concrete example or analogy whenever possible.
   - End with: "Samajh aaya? Ya koi step mein aur detail chahiye?"

4. If user sends a PROBLEM/QUESTION IMAGE or text:
   - First validate: "Haan, ye question dekh ke main samjha."
   - Explain the approach FIRST, then the solution.
   - Always explain the "why" behind each step, not just the "what".

5. If user is asking about STRATEGY, TIME MANAGEMENT, or MOTIVATION:
   - Be warm and personal. Share practical advice like a senior who has been through it.
   - Never lecture. Keep it conversational.

HARD RULES — NEVER BREAK THESE:
- NEVER say anything sarcastic, mocking, or shaming.
- NEVER make the student feel stupid for asking a basic question.
- NEVER ask more than ONE follow-up question at a time.
- NEVER use phrases like: "seedha bata", "time waste mat kar", "ye toh basic hai", "ye nahi pata?"
- ALWAYS make the student feel: "This mentor is on my side."

RESPONSE FORMAT:
- Keep responses concise and human. Avoid walls of text.
- Use line breaks for readability. Short paragraphs.
- Use emojis sparingly and naturally (1-2 max per response, only when it fits).
- For math/science explanations: use numbered steps, keep each step brief.`;

    const historyTurns = history
      .filter((m: any) => m.content && String(m.content).trim() !== "")
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content) }]
      }));

    const contents = [
      { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${systemPrompt}` }] },
      { role: 'model', parts: [{ text: "Understood. I am the PrepEntrance Mentor — warm, patient, and always supportive. I will never be sarcastic or dismissive. Let me help this student." }] },
      ...historyTurns,
      { role: 'user', parts: [{ text: String(message) }] }
    ];

    const model = "gemini-2.5-flash";

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.75,
              topK: 40,
              topP: 0.92,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          }),
        }
      );

      if (!response.body) throw new Error("Response body is null");

      return new Response(
        response.body.pipeThrough(new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    const content = data.candidates[0].content.parts[0].text;
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
                      )
                    );
                  }
                } catch (e) { /* skip partial chunks */ }
              }
            }
          },
          flush(controller) {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          }
        })),
        {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        }
      );

    } catch (err) {
      console.error("[PrepEntrance Mentor] Stream Error:", err);
      return new Response(
        encoder.encode(
          `data: ${JSON.stringify({ choices: [{ delta: { content: "Bhai, thoda network issue aa gaya. Ek baar refresh karo aur dobara bhejo — main hoon yahan 🙂" } }] })}\n\ndata: [DONE]\n\n`
        ),
        { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
      );
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: "Mentor temporarily unavailable. Please retry." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
