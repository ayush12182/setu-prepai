import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SimilarQuestionsRequest {
  conceptTested: string;
  subchapterName: string;
  subject: string;
  originalQuestion: string;
  count?: number;
}

// JEE Clean-Syntax Format Instructions
const JEE_SYNTAX_RULES = `
==============================
STRICT JEE CLEAN-SYNTAX FORMAT (MANDATORY)
==============================

Every question, solution, and equation MUST follow clean, exam-style notation.

❌ NO:
- No LaTeX-like backslashes (\\frac, \\sqrt, etc.)
- No dollar signs or markdown math
- No inline words inside equations

✅ YES:
- Proper subscripts: v₁, v₂, R₁, R₂ (Unicode: ₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ)
- Proper superscripts: x², x³, xⁿ (Unicode: ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿⁱˣʸ)
- Greek letters: α, β, γ, δ, θ, λ, μ, ω
- Fractions: (a − b)/c
- Arrows: → for reactions

SOLUTION FORMAT:
Line-by-line calculation, one step per line, final answer clearly stated.
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

    const systemPrompt = `You are a JEE expert creating practice questions to help students master a specific concept they got wrong.
The student just answered a question incorrectly about: "${conceptTested}"
Topic: ${subject} > ${subchapterName}

${JEE_SYNTAX_RULES}

Create ${count} similar but simpler questions that help build understanding progressively.
Start with easier variations and gradually increase complexity.

Mode: JEE EXAM ACCURACY MODE - Option Locked

🔒 ABSOLUTE RULE:
1. Solve each question BEFORE creating options
2. Get exact final answer
3. Put correct answer as one option
4. VERIFY correct_option matches exactly`;

    const userPrompt = `The student got this question wrong:
"${originalQuestion}"

They need to practice the concept: "${conceptTested}"

Generate ${count} progressively harder questions on the same concept.

Use STRICT JEE CLEAN-SYNTAX FORMAT:
- Unicode subscripts (v₁, v₂, T₁, T₂)
- Unicode superscripts (x², x³)
- Greek letters (θ, α, ω)
- Proper fractions: (a − b)/c
- Line-by-line solutions

Return JSON array:
[{
  "question_text": "Question in JEE clean-syntax format",
  "option_a": "Option A with proper notation",
  "option_b": "Option B with proper notation",
  "option_c": "Option C with proper notation", 
  "option_d": "Option D with proper notation",
  "correct_option": "A/B/C/D",
  "explanation": "Line-by-line solution:\\n\\nGiven: ...\\n\\nSolution:\\nStep 1: ...\\n⇒ Step 2: ...\\n\\nFinal Answer: ...\\n\\nAnswer: (X)",
  "difficulty_note": "Why this helps understand the concept"
}]

🔒 VERIFY: Each question's correct_option must match the solved answer EXACTLY.`;

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
        temperature: 0.6,
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
