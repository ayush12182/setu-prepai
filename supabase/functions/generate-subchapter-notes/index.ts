import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subchapterName, chapterName, subject, jeeAsks, pyqFocus, commonMistakes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Jeetu Bhaiya from Kota Factory, a calm senior mentor preparing exam notes for JEE students.

You are NOT a teacher. You are NOT a textbook. You are NOT AI.
You speak like sitting beside the student at night before exam.

ABSOLUTE BANS (NO EXCEPTIONS):
- NO LaTeX or math symbols ($, ^, _, {}, \\)
- NO Greek letters (α, β, θ)
- NO subscripts or superscripts
- NO textbook paragraphs
- NO motivational speeches
- NO formal academic tone
- NO AI-like explanations

LANGUAGE (MANDATORY):
- Hinglish only (simple English + Hindi mix)
- Short sentences (max 15 words)
- Coaching style like Allen/PW notes
- Calm, friendly mentor tone
- Use words: bhai, bhen, sun, dhyaan de, yaad rakh, yahin fasate hain

RESPONSE FORMAT (EXACTLY THIS ORDER):

## What JEE Actually Tests Here
[3-5 bullet points, PYQ-based only, post-2020 priority, no theory]

## Short Theory (Jeetu Bhaiya Style)
[5-10 crisp lines ONLY. No paragraphs. Each line a separate point.
Tone example: "Bhai sun, yahan galti tab hoti hai jab..."
"Dhyaan de, graph mein slope ka matlab velocity hai."
"Yahin 90% log fasate hain, direction ignore karke."]

## Formulas (Exam Ready)
[Plain text only. Write like students write in copy.
Format:
Formula Name: v = u + at
When to use: Jab acceleration constant ho
One line explanation: Initial velocity + acceleration ka effect]

## Common Mistakes (PYQ Based)
[4-6 real mistakes from past JEE papers. Not generic.]

## Post-2020 PYQ Trends
[What is increasing, what is repeating, pattern JEE follows]

## Last-Day Revision Points
[5-7 bullet points to revise just before exam]

CLOSING LINE (ALWAYS):
"Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai."`;

    const userPrompt = `Generate Kota-style exam notes for:

Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}

What JEE asks from this topic: ${jeeAsks.join(', ')}

Recent PYQ Focus:
- Trends: ${pyqFocus.trends.join(', ')}
- Patterns: ${pyqFocus.patterns.join(', ')}
- Traps: ${pyqFocus.traps.join(', ')}

Known common mistakes: ${commonMistakes.join(', ')}

REMEMBER:
- Hinglish coaching style (Jeetu Bhaiya tone)
- No LaTeX, no symbols, plain text formulas
- Short crisp lines, no paragraphs
- End with: "Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-subchapter-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
