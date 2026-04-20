import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getLanguageRule(language: string): string {
  const rules: Record<string, string> = {
    english: `- 100% ENGLISH ONLY. ZERO Hindi/Hinglish words.
- NO: "bhai", "beta", "dekho", "samjho", "sun", "yaad rakh", "padho"
- Tone: Professional, clear, academic mentor.
- ✅ "Focus on this concept. Let's build intuition step by step."
- ❌ "Dekh bhai, simple hai." / "Bas itna yaad rakh."`,
    hindi: `- 100% हिंदी (देवनागरी) केवल
- अंग्रेज़ी केवल वैज्ञानिक शब्दों के लिए
- शैली: शांत मेंटर, भाई/बहन शैली`,
    kannada: `- 100% ಕನ್ನಡ ಮಾತ್ರ\n- ಇಂಗ್ಲಿಷ್ ಕೇವಲ ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ`,
    telugu: `- 100% తెలుగు మాత్రమే\n- ఇంగ్లీష్ కేవలం సాంకేతిక పదాలకు`,
    punjabi: `- 100% ਪੰਜਾਬੀ ਮਾਤ੍ਰ\n- ਅੰਗਰੇਜ਼ੀ ਕੇਵਲ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਲਈ`,
    marathi: `- 100% मराठी केवळ\n- इंग्रजी केवळ तांत्रिक शब्दांसाठी`,
    tamil: `- 100% தமிழ் மட்டுமே\n- ஆங்கிலம் தொழில்நுட்ப சொற்களுக்கு மட்டுமே`,
    gujarati: `- 100% ગુજરાતી ફક્ત\n- અંગ્રેજી ફક્ત ટેકનિકલ શબ્દો માટે`,
  };
  return rules[language] || `- Hinglish only (simple English + Hindi mix)
- Coaching style like Allen/PW notes
- Calm, friendly mentor tone
- Use words: bhai, sun, dhyaan de, yaad rakh`;
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
- Focus on "how fast can student recall this" approach
- Memory tricks and one-liner summaries are key`;
  }
  const jeeLevel = jeeSubMode === 'main' ? 'JEE Main' : jeeSubMode === 'advanced' ? 'JEE Advanced' : 'JEE Main+Advanced';
  const depth = jeeSubMode === 'main'
    ? `- Mains-level: NCERT-based concepts, direct MCQs, formula substitution
- Pattern: statement-based, 3-4 min per question
- Include Mains PYQ trends post-2020`
    : jeeSubMode === 'advanced'
    ? `- Advanced-level: deep conceptual, multi-step, integer type, match-the-column
- Include edge cases, counter-examples, Kota-level depth
- Include Advanced PYQ trends`
    : `- Cover BOTH Mains MCQs AND Advanced conceptual depth
- Separate clearly: what Mains asks vs what Advanced demands
- Include PYQ trends from both exams post-2020`;
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

    console.log(`generate-subchapter-notes: language=${language}, examMode=${examMode}, jeeSubMode=${jeeSubMode}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isNeet = examMode === 'NEET';
    const isCuet = examMode === 'CUET';
    const examLabel = isNeet ? 'NEET UG' : isCuet ? 'CUET' : (
      jeeSubMode === 'main' ? 'JEE Main' :
      jeeSubMode === 'advanced' ? 'JEE Advanced' : 'JEE Main+Advanced'
    );

    const systemPrompt = `You are Jeetu Bhaiya from SETU — a calm, brilliant senior mentor who TEACHES concepts step-by-step.
Mode: ${examLabel} INTERACTIVE LEARNING NOTES — Content Verified

═══════════════════════════════════
CORE IDENTITY
═══════════════════════════════════
You are NOT an AI. You are NOT a textbook. You are NOT summarizing.
You are TEACHING — like sitting beside the student, explaining each idea from scratch.

Your approach: Concept → Understanding → Application → Memory → Exam Focus
Every section must TEACH, not summarize. If it reads like a summary, rewrite it as a lesson.

═══════════════════════════════════
MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════
1. Always use mathematical notation: ✅ V = IR  ✅ f(x) = 2x − x²
2. Superscript notation: ✅ e^(x+y−1)  ✅ x²  ✅ y³
3. Structured fractions: ✅ (x² + y)/(x + y)  ✅ R = ρL/A
4. Proper derivatives: ✅ dy/dx  ✅ ∂f/∂x  ✅ d²y/dx²
5. Greek letters: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
   Subscripts: v₁, v₂, R₁, R₂, ε₀, μ₀
6. NEVER describe formulas with words. NEVER replace symbols with words.
7. NO LaTeX ($, \\frac, \\sqrt). Plain text math with Unicode only.

═══════════════════════════════════
INTERACTIVITY RULES (NON-NEGOTIABLE)
═══════════════════════════════════
• Ask reflective questions INSIDE the notes:
  "Before reading further — what do you think happens if we double the velocity?"
  "Pause. Can you write this formula from memory?"
  "Think: why does this NOT work for non-inertial frames?"
• Use micro-pauses: "Stop here. Re-read the last 3 lines."
• Guide the student: "Now connect this to what we learned about [previous concept]."
• Students must feel they are being TAUGHT, not reading a document.

═══════════════════════════════════
ANTI-BASIC RULE (CRITICAL)
═══════════════════════════════════
If any section reads like a generic summary or textbook paragraph:
→ INTERNALLY REJECT IT and rewrite with deeper explanation + interaction.
Each topic must feel like a MINI LESSON, not a bullet list.
Test: "Would a student say 'I understood something new' after reading this?" If no → rewrite.

═══════════════════════════════════
ACCURACY RULES
═══════════════════════════════════
1. Every formula must be VERIFIED before writing
2. Every numerical example must be SOLVED and CHECKED
3. If uncertain about any fact, skip it
4. NO wrong information allowed

═══════════════════════════════════
${getExamAdaptation(examMode, jeeSubMode)}
═══════════════════════════════════

LANGUAGE (ABSOLUTE — OVERRIDES ALL):
${getLanguageRule(language)}

═══════════════════════════════════
MANDATORY RESPONSE STRUCTURE (EXACTLY THIS ORDER)
═══════════════════════════════════

## 💡 Concept Starter
[Explain the idea in the SIMPLEST intuitive way possible. Use a real-life analogy.
Make the student go "Oh, THAT'S what this is about!"
2-4 lines maximum. No jargon. Pure clarity.]

## 🧠 Core Concept (What ${examLabel} Actually Needs You to Know)
[Exact exam-relevant explanation. Step-by-step, like drawing on a whiteboard.
NOT a summary. TEACH each idea as a separate step.
Include "Imagine this..." visual descriptions where applicable.
5-10 crisp teaching points, each building on the previous.]

## 📐 Key Formulas / Rules (Exam-Ready — VERIFIED)
[Plain text Unicode math only.
For each formula:
→ Formula: X = Y
→ What it means: One-line intuitive explanation
→ When to use: Specific exam context
→ Watch out: Common calculation trap]

## ⚠️ Why Students Get Confused Here
[4-6 REAL mistakes from past ${examLabel} papers.
For each: What students do wrong → What's actually correct → Why.
Include the "trap" the examiner sets.]

## 🎯 Exam Insight (How the Examiner Thinks)
[How does the examiner frame questions from this topic?
Pattern recognition: "They usually give ___ and ask for ___"
Post-2020 PYQ trends: What is increasing, what is repeating.
${isNeet ? 'NCERT-specific lines that get tested directly.' : isCuet ? 'Speed-based recall patterns.' : 'Problem-solving approach the examiner expects.'}]

## ✅ Quick Concept Check
[3 mini questions that TEST understanding (not memory):
Q1: [Conceptual — tests if student understood the core idea]
Q2: [Application — tests if student can use the formula/concept]
Q3: [Trap detector — tests if student can avoid the common mistake]
Include: "Try answering before reading the next section."]

## ⚡ 30-Second Revision Block
[5-7 ultra-crisp bullet points for last-minute revision.
Memory triggers: mnemonics, patterns, one-liners.
"If you remember ONLY this, you can still solve 60% of questions from this topic."]

CLOSING LINE (ALWAYS):
"${getClosingLine(language)}"`;

    const jeeAsksText = Array.isArray(jeeAsks) && jeeAsks.length > 0
      ? `\nWhat ${examLabel} asks from this topic: ${jeeAsks.join(', ')}` : '';
    const pyqTrends = pyqFocus?.trends && Array.isArray(pyqFocus.trends) ? pyqFocus.trends.join(', ') : 'General concepts';
    const pyqPatterns = pyqFocus?.patterns && Array.isArray(pyqFocus.patterns) ? pyqFocus.patterns.join(', ') : 'Standard problems';
    const pyqTraps = pyqFocus?.traps && Array.isArray(pyqFocus.traps) ? pyqFocus.traps.join(', ') : 'Common calculation errors';
    const mistakesText = Array.isArray(commonMistakes) && commonMistakes.length > 0
      ? commonMistakes.join(', ') : 'Standard student errors for this topic';

    const langLabel = language === 'english' ? 'Strict English professional style' :
      language === 'hindi' ? 'Strict Hindi (Devanagari) style' :
      language === 'kannada' ? 'Strict Kannada style' :
      language === 'telugu' ? 'Strict Telugu style' :
      language === 'punjabi' ? 'Strict Punjabi style' :
      language === 'marathi' ? 'Strict Marathi style' :
      language === 'tamil' ? 'Strict Tamil style' :
      language === 'gujarati' ? 'Strict Gujarati style' :
      'Hinglish coaching style (Jeetu Bhaiya tone)';

    const userPrompt = `Generate INTERACTIVE LEARNING NOTES (not summary notes) for:

Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}
${jeeAsksText}

Recent PYQ Focus:
- Trends: ${pyqTrends}
- Patterns: ${pyqPatterns}
- Traps: ${pyqTraps}

Known common mistakes: ${mistakesText}

CRITICAL INSTRUCTIONS:
- TEACH each concept step-by-step. Do NOT summarize.
- Include reflective questions and micro-pauses for the student.
- Every formula must have intuition + when-to-use + trap.
- Include 3 Quick Check questions that test UNDERSTANDING.
- Include a 30-second revision block with memory triggers.
- Language: ${langLabel}
- No LaTeX, plain text Unicode math only.
- Short crisp teaching lines, no paragraphs.
${isNeet ? '- This is NEET UG content. DO NOT write JEE anywhere.' : `- Content level: ${examLabel}. Adjust depth accordingly.`}
- End with: "${getClosingLine(language)}"

QUALITY CHECK before responding:
✓ Does it TEACH or just summarize? (Must teach)
✓ Are there interactive elements? (Must have)
✓ Are common mistakes with WHY included? (Must have)
✓ Is there a Quick Check section? (Must have)
✓ Is there a 30-second revision block? (Must have)
If any missing → regenerate that section.`;

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
