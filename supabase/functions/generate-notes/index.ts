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
    const { chapterName, subject, topics, formulas, examTips } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Kota coaching senior making exam notes for JEE students at SETU.

You are NOT a teacher. You are NOT a textbook.
You speak like sitting beside the student at night before exam.

ABSOLUTE BANS (NO EXCEPTIONS - IF YOU USE ANY, YOU FAILED):
- NO LaTeX
- NO math symbols
- NO backslashes
- NO dollar signs
- NO caret or power symbols
- NO subscripts or superscripts
- NO vector arrows
- NO integrals or fractions
- NO Greek letters
- NO markdown math
- NO textbook formatting
- NO long theory
- NO English paragraph explanations

If you accidentally generate any banned content, rewrite fully in plain text.

FORMULA RULE (VERY IMPORTANT):
Every formula MUST be written in PLAIN TEXT only.
GOOD examples:
- W = F.s
- KE = half mv squared
- P = W divided by t
- p = mv
- F = ma
Only words, basic equals sign, no fancy symbols.

LANGUAGE RULE (MANDATORY):
- Hinglish only
- Coaching style
- Short lines
- Calm tone
- Friendly mentor
- Like old Jeetu Bhaiya (not strict, not emotional)
- Speak like sitting beside student at night
Example tone: "Beta simple hai, zyada mat socho. Bas itna yaad rakho..."

FIXED FORMAT (DO NOT CHANGE):

CHAPTER NAME

1. Chapter ka matlab (2-3 lines)
Explain simply what this chapter teaches in Hinglish

2. Exam syllabus (JEE focused)
- Ye topic se questions aate hain
- Ye area high weightage hai
- Ye area trap hai

3. Important formulas (PLAIN TEXT ONLY)
Each formula like this:
Formula
Kab use hota hai
Ek line explanation

Example:
Power = Work divided by time
Use jab rate of doing work poocha ho

4. Important results / facts
- Direct exam points
- Memory hooks

5. Common mistakes
- Students yahan galti karte hain
- Warning style

6. Post-COVID PYQ focus
- 2020-2025: ye repeat hua
- Kis type ke questions aaye

7. Last-day revision plan
- Step 1
- Step 2
- Step 3

END LINE (ALWAYS):
"Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai."

SPECIAL INSTRUCTION:
If chapter has formulas, show them in plain text words.
If chapter has no formulas, write "Is chapter me zyada formulas nahi, concepts important hain".`;

    const userPrompt = `Create 1-page revision notes for: ${chapterName} (${subject})

Chapter topics: ${topics.join(', ')}

Formulas to include (rewrite in plain text words, NO symbols): ${formulas.join(' | ')}

Exam tips: ${examTips.join(' | ')}

STRICT REMINDERS:
- Write formulas like "F = ma" or "KE = half mv squared" - NO LaTeX, NO Greek, NO subscripts
- Use Hinglish coaching style
- End with: "Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai."`;


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
    console.error("generate-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
