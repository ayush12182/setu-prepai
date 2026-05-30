import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getExamAdaptation(examMode: string, jeeSubMode: string): string {
  if (examMode === 'NEET') {
    return `EXAM ADAPTATION (NEET UG):
- Focus on NCERT-based concept clarity and memory anchors
- Minimal heavy math; focus on conceptual understanding
- NEVER mention JEE anywhere`;
  }
  if (examMode === 'CUET') {
    return `EXAM ADAPTATION (CUET):
- NCERT clarity + quick recall + speed-based understanding
- Fact-based MCQ patterns, not derivation-heavy`;
  }
  const jeeLevel = jeeSubMode === 'main' ? 'JEE Main' : jeeSubMode === 'advanced' ? 'JEE Advanced' : 'JEE Main+Advanced';
  return `EXAM ADAPTATION (${jeeLevel}):
- Concept depth + problem-solving intuition
- Include Mains PYQ trends and advanced depth if applicable`;
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
    const fullPrompt = `You are an expert exam mentor creating a 1-Page Premium Revision Sheet for ${examLabel}.

CORE IDENTITY: You create visually clean, formula-first, highly-scannable short notes similar to Allen/Resonance/PW topper notes.
Language: ${language} (if hindi/regional, use English for scientific terms).

${getExamAdaptation(examMode, jeeSubMode)}

You must output a STRICT JSON object matching the EXACT schema below. 
Do NOT wrap the JSON in markdown blocks (no \`\`\`json). Just return the raw JSON object.

LATEX RULES:
- IMPORTANT: Use proper LaTeX syntax for formulas (e.g., \\frac{\\mu_0 I}{2\\pi r}).
- Do NOT add $$ or \\( or \\) around the formulas in the JSON. The frontend will wrap them automatically.
- Only include the raw LaTeX string inside the formula fields.

JSON SCHEMA:
{
  "chapter": "String (Name of the chapter/subchapter)",
  "formulaCards": [
    {
      "name": "String (Name of formula/rule)",
      "formula": "String (Raw LaTeX math)",
      "variables": "String (e.g., I = current, r = distance)",
      "usage": "String (One line intuitive explanation)"
    }
  ],
  "concepts": [
    {
      "title": "String (Core concept name)",
      "description": "String (2-3 lines of crisp explanation)"
    }
  ],
  "graphs": [
    {
      "title": "String (e.g., B vs r for solid cylinder)",
      "description": "String (Visual description of what the graph looks like and its key intercepts/slopes)"
    }
  ],
  "mistakes": [
    {
      "wrong": "String (What students do wrong)",
      "right": "String (What's actually correct)",
      "why": "String (Why it's correct)"
    }
  ],
  "pyqTriggers": [
    {
      "pattern": "String (Pattern seen in questions)",
      "action": "String (What to do immediately)"
    }
  ],
  "quickRevision": [
    "String",
    "String"
  ]
}

Input Details:
Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}
${jeeAsksText}
PYQ Trends: ${pyqTrends}
PYQ Patterns: ${pyqPatterns}
PYQ Traps: ${pyqTraps}
Common Mistakes: ${mistakesText}

Generate the JSON now.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: { 
            temperature: 0.2, 
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error("No response generated from Gemini");
    }

    return new Response(textOutput, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-subchapter-notes error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
