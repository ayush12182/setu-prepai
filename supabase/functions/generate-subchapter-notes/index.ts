import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getLanguageRule(language: string): string {
  const rules: Record<string, string> = {
    english: `- 100% ENGLISH ONLY. ZERO Hindi/Hinglish words.\n- Tone: Professional, clear, academic mentor.`,
    hindi: `- 100% हिंदी (देवनागरी) केवल\n- अंग्रेज़ी केवल वैज्ञानिक शब्दों के लिए\n- शैली: शांत मेंटर, भाई/बहन शैली`,
    kannada: `- 100% ಕನ್ನಡ ಮಾತ್ರ\n- ಇಂಗ್ಲಿಷ್ ಕೇವಲ ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ`,
    telugu: `- 100% తెలుగు మాత్రమే\n- ఇంగ్లీష్ కేవలం సాంకేతిక పదాలకు`,
    punjabi: `- 100% ਪੰਜਾਬੀ ਮਾਤ੍ਰ\n- ਅੰਗਰੇਜ਼ੀ ਕੇਵਲ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਲਈ`,
    marathi: `- 100% मराठी केवळ\n- इंग्रजी केवळ तांत्रिक शब्दांसाठी`,
    tamil: `- 100% தமிழ் மட்டுமே\n- ஆங்கிலம் தொழில்நுட்ப சொற்களுக்கு மட்டுமே`,
    gujarati: `- 100% ગુજરાતી ફક્ત\n- અંગ્રેજી ફક્ત ટેકનિકલ શબ્દો માટે`,
  };
  return rules[language] || `- Hinglish only (simple English + Hindi mix)\n- Coaching style like Allen/PW notes\n- Calm, friendly mentor tone`;
}

function getClosingLine(language: string): string {
  const lines: Record<string, string> = {
    english: "Remember this clearly. Now solve PYQs, that is the real exam.",
    hindi: "बस भाई, इतना याद रखो। अब PYQ लगाओ, वही असली परीक्षा है।",
    marathi: "बस भाऊ, एवढं लक्षात ठेवा. आता PYQ सोडवा, तीच खरी परीक्षा आहे.",
  };
  return lines[language] || "Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai.";
}

function getExamAdaptation(examMode: string, jeeSubMode: string): string {
  if (examMode === 'NEET') {
    return `EXAM ADAPTATION (NEET UG):
- Focus on NCERT-based concept clarity and memory anchors
- Use mnemonics, diagram descriptions, and recall triggers
- Minimal heavy math; focus on conceptual understanding
- NEVER mention JEE anywhere`;
  }
  if (examMode === 'CUET') {
    return `EXAM ADAPTATION (CUET):
- NCERT clarity + quick recall + speed-based understanding
- Fact-based MCQ patterns, not derivation-heavy
- Memory tricks and one-liner summaries are key`;
  }
  const jeeLevel = jeeSubMode === 'main' ? 'JEE Main' : jeeSubMode === 'advanced' ? 'JEE Advanced' : 'JEE Main+Advanced';
  const depth = jeeSubMode === 'main'
    ? `- Mains-level: NCERT-based concepts, direct MCQs, formula substitution\n- Include Mains PYQ trends post-2020`
    : jeeSubMode === 'advanced'
    ? `- Advanced-level: deep conceptual, multi-step, integer type, match-the-column\n- Include edge cases, counter-examples, Kota-level depth`
    : `- Cover BOTH Mains MCQs AND Advanced conceptual depth\n- Separate clearly: what Mains asks vs what Advanced demands`;
  return `EXAM ADAPTATION (${jeeLevel}):
- Concept depth + problem-solving intuition
${depth}`;
}

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
      jeeSubMode = 'both',
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const isNeet = examMode === 'NEET';
    const isCuet = examMode === 'CUET';
    const examLabel = isNeet ? 'NEET UG' : isCuet ? 'CUET' : (
      jeeSubMode === 'main' ? 'JEE Main' :
      jeeSubMode === 'advanced' ? 'JEE Advanced' : 'JEE Main+Advanced'
    );

    const jeeAsksText = Array.isArray(jeeAsks) && jeeAsks.length > 0
      ? `\nWhat ${examLabel} asks from this topic: ${jeeAsks.join(', ')}` : '';
    const pyqTrends = pyqFocus?.trends && Array.isArray(pyqFocus.trends) ? pyqFocus.trends.join(', ') : 'General concepts';
    const pyqPatterns = pyqFocus?.patterns && Array.isArray(pyqFocus.patterns) ? pyqFocus.patterns.join(', ') : 'Standard problems';
    const pyqTraps = pyqFocus?.traps && Array.isArray(pyqFocus.traps) ? pyqFocus.traps.join(', ') : 'Common calculation errors';
    const mistakesText = Array.isArray(commonMistakes) && commonMistakes.length > 0
      ? commonMistakes.join(', ') : 'Standard student errors for this topic';

    const fullPrompt = `You are Jeetu Bhaiya from SETU — a calm, brilliant senior mentor who TEACHES concepts step-by-step.
Mode: ${examLabel} INTERACTIVE LEARNING NOTES

CORE IDENTITY: You are TEACHING — like sitting beside the student, explaining each idea from scratch.
Your approach: Concept → Understanding → Application → Memory → Exam Focus

MATHEMATICAL SYNTAX (MANDATORY):
- Always use proper notation: V = IR, f(x) = 2x − x², dy/dx, ∂f/∂x
- Greek letters: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
- Subscripts: v₁, v₂, R₁, R₂, ε₀, μ₀
- NO LaTeX ($, \\frac, \\sqrt). Plain text Unicode math only.

INTERACTIVITY RULES:
- Ask reflective questions INSIDE the notes: "Before reading further — what do you think happens if we double the velocity?"
- Use micro-pauses: "Stop here. Re-read the last 3 lines."
- Students must feel they are being TAUGHT, not reading a document.

${getExamAdaptation(examMode, jeeSubMode)}

LANGUAGE: ${getLanguageRule(language)}

MANDATORY STRUCTURE (EXACTLY THIS ORDER):

## 💡 Concept Starter
[Explain the idea in the SIMPLEST intuitive way. Real-life analogy. 2-4 lines. No jargon.]

## 🧠 Core Concept (What ${examLabel} Actually Needs You to Know)
[Step-by-step teaching, like drawing on a whiteboard. 5-10 crisp teaching points, each building on the previous. Include "Imagine this..." visual descriptions.]

## 📐 Key Formulas / Rules (Exam-Ready — VERIFIED)
[For each formula:
→ Formula: X = Y
→ What it means: One-line intuitive explanation
→ When to use: Specific exam context
→ Watch out: Common calculation trap]

## ⚠️ Why Students Get Confused Here
[4-6 REAL mistakes. For each: What students do wrong → What's actually correct → Why.]

## 🎯 Exam Insight (How the Examiner Thinks)
[How does the examiner frame questions? Pattern recognition. Post-2020 PYQ trends.]

## ✅ Quick Concept Check
[3 mini questions testing UNDERSTANDING (not memory):
Q1: [Conceptual]
Q2: [Application]
Q3: [Trap detector]
"Try answering before reading the next section."]

## ⚡ 30-Second Revision Block
[5-7 ultra-crisp bullet points for last-minute revision. Memory triggers, mnemonics, one-liners.]

CLOSING LINE: "${getClosingLine(language)}"

---
Now generate INTERACTIVE LEARNING NOTES for:
Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}
${jeeAsksText}

Recent PYQ Focus:
- Trends: ${pyqTrends}
- Patterns: ${pyqPatterns}
- Traps: ${pyqTraps}

Known common mistakes: ${mistakesText}

QUALITY CHECK:
✓ Does it TEACH or just summarize? (Must teach)
✓ Are there interactive elements? (Must have)
✓ Are common mistakes with WHY included? (Must have)
✓ Is there a Quick Check section? (Must have)
✓ Is there a 30-second revision block? (Must have)`;

    // Call Gemini streaming endpoint
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    // Transform Gemini SSE → OpenAI-compatible SSE (what the client expects)
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Emit as OpenAI-compatible SSE chunk
                const openaiChunk = JSON.stringify({
                  choices: [{ delta: { content: text } }],
                });
                await writer.write(encoder.encode(`data: ${openaiChunk}\n\n`));
              }
            } catch { /* skip malformed */ }
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-subchapter-notes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
