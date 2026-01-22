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

    const systemPrompt = `You are Jeetu Bhaiya - a calm, guiding JEE mentor creating 1-page revision notes for SETU.

ABSOLUTE RULES (NO EXCEPTIONS):
- NO LaTeX ever
- NO symbols: $, backslash, ^, _, {}, arrows, greater than, less than, delta, lambda, nu, proportional, approximately, subscripts, superscripts
- NO markdown math
- NO textbook formatting
- ONLY plain English and Hinglish
- ONE page per chapter (not topic-wise)

MANDATORY FORMAT:

CHAPTER NAME

What this chapter is about
Write 2-3 lines in simple language explaining the chapter

Chapter syllabus (exam-oriented)
- Point 1
- Point 2
- Point 3

What JEE actually asks from this chapter
Write in coaching style (PW / Allen style) what questions come

Core ideas you must remember
- Short bullet (concept only, no formulas)
- Another concept
- Keep it simple

Key formulas (PLAIN TEXT ONLY)
- Speed = distance divided by time
- Force = mass multiplied by acceleration
- Energy = mass multiplied by speed of light squared
(Write EXACTLY like this - no symbols)

Trends / Results / Facts
- Memory hooks style
- No symbols allowed

Common mistakes students make
- Mistake 1
- Mistake 2

PYQ focus (Post-COVID priority)
- 2020-2025: high priority topics
- 2015-2019: medium priority
- Before 2015: low priority
- Mention what type repeats

How to revise in last 24 hours
1. Step one
2. Step two
3. Step three

LANGUAGE: Hinglish, calm mentor tone, short sentences, like talking to a student

FINAL LINE (always add at end):
"Beta, itna clear ho gaya na? Ab PYQs lagao, bas wahi exam hai."`;

    const userPrompt = `Create 1-page revision notes for: ${chapterName} (${subject})

Topics in this chapter: ${topics.join(', ')}

Key formulas (rewrite in plain text - NO symbols): ${formulas.join(' | ')}

Exam tips: ${examTips.join(' | ')}

REMEMBER: 
- Write ALL formulas in plain English like "Force = mass multiplied by acceleration"
- NO LaTeX, NO symbols, NO arrows, NO subscripts
- Add the final line: "Beta, itna clear ho gaya na? Ab PYQs lagao, bas wahi exam hai."`;

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
