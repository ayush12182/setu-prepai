import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SimilarQuestionsRequest {
  conceptTested: string;
  subchapterName: string;
  subject: string;
  originalQuestion: string;
  count?: number;
}

// Strict Mathematical Syntax Standard
const JEE_SYNTAX_RULES = `
═══════════════════════════════════
STRICT MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════

- Use proper notation: V = IR, F = ma, e^(x+y−1), x², (a+b)/c
- Use Greek: α, β, θ, λ, μ, ρ, ω, ε, Δ, π
- Subscripts: v₁, v₂, ε₀, μ₀ (Unicode: ₀₁₂₃₄₅₆₇₈₉)
- Superscripts: x², x³, xⁿ (Unicode: ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿ)
- Fractions: (a − b)/c    Derivatives: dy/dx, ∂f/∂x
- Arrows: → for reactions
- NEVER describe formulas with words. NO LaTeX.
- Solution: Step 1→Step 2→...→Final Answer: [expression]
═══════════════════════════════════
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conceptTested, subchapterName, subject, originalQuestion, count = 3 }: SimilarQuestionsRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite JEE remediation specialist for SETU — India's #1 AI mentor platform.
A student just failed a question. Your job is to BUILD their understanding from the ground up with scaffolded practice.

Failed concept: "${conceptTested}"
Topic: ${subject} > ${subchapterName}

${JEE_SYNTAX_RULES}

═══════════════════════════════════
SCAFFOLDED LEARNING DESIGN
═══════════════════════════════════

Question 1 (Foundation): Tests the SAME concept in its simplest form.
- Direct formula application, single step
- Builds confidence that the core idea is understood
- Example: If they failed on projectile range, ask basic range formula with θ = 45°

Question 2 (Application): Same concept, slight twist.
- Requires one additional step or a minor variation
- Tests if they can TRANSFER the concept
- Example: Projectile range but on inclined plane, or with air resistance mentioned (but negligible)

Question 3 (Exam-Ready): Same concept at JEE Mains level.
- Full exam-style question combining this concept with one related idea
- This is the "graduation" question — if they get this right, they've mastered it
- Example: Projectile + relative motion, or projectile with constraint

═══════════════════════════════════
MISTAKE-AWARE DISTRACTOR DESIGN
═══════════════════════════════════

Since the student already made a mistake on this concept, your distractors MUST target:
1. The EXACT mistake they likely made (inferred from the original question)
2. The next most common mistake for this concept
3. A "looks right but wrong" option that tests careful reading

═══════════════════════════════════
🔒 ABSOLUTE RULES
═══════════════════════════════════
1. Solve each question FULLY before creating options
2. Exact match between solution and correct_option
3. Progressive difficulty: Q1 < Q2 < Q3
4. All questions test the SAME core concept (not tangential topics)

Mode: JEE EXAM ACCURACY MODE — Option Locked`;

    const userPrompt = `The student got this question wrong:
"${originalQuestion}"

Failed concept: "${conceptTested}"

Generate ${count} scaffolded practice questions (easy → medium → exam-ready) on this EXACT concept.

STRICT JEE CLEAN-SYNTAX FORMAT.

Return JSON array:
[{
  "question_text": "Question in JEE clean-syntax",
  "option_a": "Option with proper notation and units",
  "option_b": "Option with proper notation and units",
  "option_c": "Option with proper notation and units",
  "option_d": "Option with proper notation and units",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step solution:\\n\\nGiven:\\n...\\n\\nConcept:\\n[Why this builds on the failed question]\\n\\nSolution:\\nStep 1: ...\\n⇒ Step 2: ...\\n\\nFinal Answer: [value]\\n\\nAnswer: (X)\\n\\nKey Insight: [What the student should learn from this]",
  "difficulty_note": "Foundation / Application / Exam-Ready — [how this connects to the original mistake]"
}]

QUALITY CHECKLIST:
✅ All questions test "${conceptTested}" specifically
✅ Progressive difficulty (Q1 easiest, Q${count} hardest)
✅ Distractors target the student's likely mistake pattern
✅ correct_option verified against solution
✅ Each explanation includes a "Key Insight" connecting back to the original error`;

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
        temperature: 0.4,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let similarQuestions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        similarQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Parse error:", content);
      throw new Error("Failed to parse similar questions");
    }

    return new Response(JSON.stringify({ questions: similarQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("get-similar-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
