import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subchapterName,
      chapterName,
      subject,
      jeeAsks = [],
      pyqFocus = {},
      commonMistakes = [],
      language = 'english',
      examMode = 'JEE',
    } = await req.json();

    console.log(`generate-subchapter-notes: language=${language}, examMode=${examMode}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isNeet = examMode === 'NEET';
    const examLabel = isNeet ? 'NEET UG' : 'JEE';

    const systemPrompt = `You are Jeetu Bhaiya from SETU, a calm senior mentor preparing exam notes for ${examLabel} students.
Mode: ${examLabel} ACCURACY MODE - Content Verified

You are NOT a teacher. You are NOT a textbook. You are NOT AI.
You speak like sitting beside the student at night before exam.

ACCURACY RULES (NON-NEGOTIABLE):
1. Every formula must be VERIFIED before writing
2. Every numerical example must be SOLVED and CHECKED
3. If uncertain about any fact, skip it
4. NO wrong information allowed
${isNeet ? '5. This is NEET UG, NOT JEE. Focus on NCERT-based content. NEVER use the word JEE in your response.' : ''}

ABSOLUTE BANS:
- NO LaTeX or math symbols ($, ^, _, {}, \\)
- NO Greek letters - write "alpha", "beta", "theta"
- NO subscripts or superscripts
- NO textbook paragraphs
- NO motivational speeches
${isNeet ? '- NO mention of JEE anywhere in the response' : ''}

LANGUAGE:
${language === 'english'
        ? `- STRICT PROFESSIONAL ENGLISH ONLY\n- Tone: Professional, clear, academic mentor`
        : `- Hinglish only (simple English + Hindi mix)\n- Coaching style like Allen/PW notes\n- Calm, friendly mentor tone\n- Use words: bhai, sun, dhyaan de, yaad rakh`}

RESPONSE FORMAT (EXACTLY THIS ORDER):

## What ${examLabel} Actually Tests Here
[3-5 bullet points, PYQ-based only, post-2020 priority, no theory]

## Short Theory (${language === 'english' ? 'Mental Model' : 'Jeetu Bhaiya Style'})
[5-10 crisp lines ONLY. No paragraphs. Each line a separate point.]

## Formulas (Exam Ready - VERIFIED)
[Plain text only. Format:
Formula Name: X = Y
When to use: Context
One line explanation: What it means]

## Common Mistakes (${examLabel} Based)
[4-6 real mistakes from past ${examLabel} papers.]

## Post-2020 PYQ Trends
[What is increasing, what is repeating, pattern ${examLabel} follows]

## Last-Day Revision Points
[5-7 bullet points to revise just before exam]

CLOSING LINE (ALWAYS):
"${language === 'english' ? 'Remember this clearly. Now solve PYQs, that is the real exam.' : 'Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai.'}"`;

    const jeeAsksText = Array.isArray(jeeAsks) && jeeAsks.length > 0
      ? `\nWhat ${examLabel} asks from this topic: ${jeeAsks.join(', ')}` : '';
    const pyqTrends = pyqFocus?.trends && Array.isArray(pyqFocus.trends) ? pyqFocus.trends.join(', ') : 'General concepts';
    const pyqPatterns = pyqFocus?.patterns && Array.isArray(pyqFocus.patterns) ? pyqFocus.patterns.join(', ') : 'Standard problems';
    const pyqTraps = pyqFocus?.traps && Array.isArray(pyqFocus.traps) ? pyqFocus.traps.join(', ') : 'Common calculation errors';
    const mistakesText = Array.isArray(commonMistakes) && commonMistakes.length > 0
      ? commonMistakes.join(', ') : 'Standard student errors for this topic';

    const userPrompt = `Generate Kota-style exam notes for:

Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}
${jeeAsksText}

Recent PYQ Focus:
- Trends: ${pyqTrends}
- Patterns: ${pyqPatterns}
- Traps: ${pyqTraps}

Known common mistakes: ${mistakesText}

REMEMBER:
- ${language === 'english' ? 'Strict English professional style' : 'Hinglish coaching style (Jeetu Bhaiya tone)'}
- No LaTeX, no symbols, plain text formulas
- Short crisp lines, no paragraphs
${isNeet ? '- This is NEET UG content. DO NOT write JEE anywhere.' : ''}
- End with: "${language === 'english' ? 'Remember this clearly. Now solve PYQs, that is the real exam.' : 'Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai.'}"`;

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
