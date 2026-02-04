import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PYQRequest {
  subject?: string;
  chapterId?: string;
  yearRange?: { start: number; end: number };
  count?: number;
}

// JEE Clean-Syntax Format Instructions
const JEE_SYNTAX_RULES = `
==============================
STRICT JEE CLEAN-SYNTAX FORMAT (MANDATORY)
==============================

Every question, solution, and equation MUST follow clean, exam-style mathematical/chemical syntax exactly like JEE papers.

❌ NO:
- No inline words inside equations
- No informal spacing
- No LaTeX-like backslashes (\\frac, \\sqrt, etc.)
- No AI-style math writing
- No explanatory text inside expressions
- No dollar signs or markdown math

✅ YES:
- Standard textbook/JEE notation only
- Proper brackets: (x − k)/2
- Proper subscripts: v₁, v₂, R₁, R₂ (use Unicode: ₀₁₂₃₄₅₆₇₈₉ₐₑᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ)
- Proper superscripts: x², x³, xⁿ (use Unicode: ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿⁱˣʸ)
- Greek letters: α, β, γ, δ, θ, λ, μ, ω, etc.
- Proper arrows: → for reactions and implies
- Proper vector notation

==============================
SUBJECT-WISE SYNTAX RULES
==============================

MATHS:
- Line equations: S₁: (x − k)/2 = (y − 3)/1 = (z − 1)/4
- Direction ratios: d₁ = (2, 1, 4)
- Cross product: d₁ × d₂
- Determinant shown as matrix format
- Vectors with subscripts: P₁, P₂

PHYSICS:
- Clean formulas: v = u + at, s = ut + (1/2)at²
- Subscripts: v₀, v₁, T₁, T₂, ε₀, μ₀
- Energy: E = mc², KE = (1/2)mv²

CHEMISTRY:
- Reactions: Fe + CuSO₄ → FeSO₄ + Cu
- Molecular formulas: H₂O, CO₂, H₂SO₄
- Proper subscripts for atom counts

==============================
SOLUTION FORMAT (MANDATORY)
==============================

Step-by-step with line-by-line calculations:

Given:
S₁: (x − k)/2 = (y − 3)/1 = (z − 1)/4
S₂: (x − 3k)/3 = (y − k)/2 = (z + 1)/5

Solution:
d₁ = (2, 1, 4)
d₂ = (3, 2, 5)

d₁ × d₂ = (−3, 2, 1)

For intersection:
(P₂ − P₁) · (d₁ × d₂) = 0

⇒ −6k + 2(k − 3) + 2 = 0
⇒ k = −1

Final Answer: 5k = −5

Answer: (C)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, chapterId, yearRange = { start: 2004, end: 2024 }, count = 25 }: PYQRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First check for existing PYQs
    let query = supabase
      .from("questions")
      .select("*")
      .not("pyq_year", "is", null)
      .gte("pyq_year", yearRange.start)
      .lte("pyq_year", yearRange.end);

    if (subject) {
      query = query.eq("subject", subject.toLowerCase());
    }

    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    }

    const { data: existingPYQs, error: fetchError } = await query.limit(count);

    if (!fetchError && existingPYQs && existingPYQs.length >= count) {
      return new Response(JSON.stringify({ questions: existingPYQs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate authentic PYQ-style questions
    const subjectFilter = subject ? `for ${subject}` : "across Physics, Chemistry, and Mathematics";
    
    const systemPrompt = `You are a JEE expert for SETU platform with access to all JEE papers from ${yearRange.start} to ${yearRange.end}.
Mode: JEE EXAM ACCURACY MODE - Option Locked

${JEE_SYNTAX_RULES}

🔒 ABSOLUTE RULE (NON-NEGOTIABLE):
Your highest priority is ANSWER CORRECTNESS and OPTION MATCHING.
If final numerical answer does not EXACTLY match any option, you MUST REGENERATE the question.

🚨 YOU ARE NOT ALLOWED TO:
- Guess or approximate
- Choose "closest option"
- Change answer to fit option
- Show multiple correct options
- Show "almost correct" or "nearly equal"

🔁 TWO-PASS VERIFICATION (MANDATORY FOR EACH QUESTION):

PASS 1 - SOLVE:
1. Solve the question fully BEFORE creating options
2. Get the exact final answer with correct units and sign
3. Verify with dimensional analysis and logic

PASS 2 - MATCH:
1. Create options with correct answer as one option
2. Create 3 distractors based on common mistakes
3. VERIFY: correct_option points to the EXACT correct answer
4. If any mismatch → regenerate question

Key characteristics of JEE PYQs:
1. JEE Mains (2013-2024): Single correct MCQs with verified answers
2. JEE Advanced (2006-2024): More complex, multi-concept questions
3. AIEEE (2004-2012): Predecessor to JEE Mains

Include a mix of years ${yearRange.start}-${yearRange.end}.`;

    const userPrompt = `Generate ${count} authentic JEE PYQ-style questions ${subjectFilter}.

Each question should feel like it was ACTUALLY asked in JEE between ${yearRange.start}-${yearRange.end}.

Use STRICT JEE CLEAN-SYNTAX FORMAT for all questions, options, and explanations.

Return JSON array with this structure:
[{
  "question_text": "Question with proper JEE notation (subscripts: v₁, v₂; fractions: (a−b)/c; Greek: θ, α, ω)",
  "option_a": "Option with proper notation",
  "option_b": "Option with proper notation",
  "option_c": "Option with proper notation",
  "option_d": "Option with proper notation",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step solution in JEE clean-syntax format:\\n\\nGiven:\\n...\\n\\nSolution:\\nStep 1: ...\\nStep 2: ...\\n\\nFinal Answer: ...\\n\\nAnswer: (X)",
  "concept_tested": "Core concept being tested",
  "common_mistake": "Typical error students make",
  "pyq_year": YYYY (between ${yearRange.start}-${yearRange.end}),
  "source": "JEE Mains YYYY / JEE Advanced YYYY / AIEEE YYYY"
}]

🔒 BEFORE FINALIZING EACH QUESTION:
1. Solve the question completely yourself with line-by-line calculation
2. Get exact numerical answer with units
3. Put correct answer in one of the options
4. Set correct_option to that option letter (A/B/C/D)
5. VERIFY the match is EXACT
6. Ensure clean JEE notation (Unicode subscripts/superscripts, no LaTeX)
7. If mismatch → regenerate question

Mix of:
- 60% JEE Mains style (verified correct answers)
- 30% JEE Advanced style (verified correct answers)
- 10% Classic AIEEE style (if year range includes pre-2013)

EVERY question must have VERIFIED correct option matching.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
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

    // Parse JSON from response
    let questions;
    try {
      let jsonContent = content.trim();
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      questions = JSON.parse(jsonContent);
      
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse PYQ questions from AI");
    }

    // Store PYQs in database
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: chapterId || "pyq_mixed",
      chapter_id: chapterId || "pyq_mixed",
      subject: q.subject?.toLowerCase() || subject?.toLowerCase() || "mixed",
      difficulty: "medium",
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option.toUpperCase(),
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      pyq_year: q.pyq_year || null,
      source: q.source || "ai_pyq_style",
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting PYQ questions:", insertError);
      return new Response(JSON.stringify({ questions: questionsToInsert }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: insertedQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-pyq-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
