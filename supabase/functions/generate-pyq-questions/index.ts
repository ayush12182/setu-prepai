import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    
    const systemPrompt = `You are an elite JEE PYQ specialist for SETU — India's #1 AI mentor platform.
You have deep expertise in every JEE paper from ${yearRange.start} to ${yearRange.end}.
Mode: JEE EXAM ACCURACY MODE — Option Locked

${JEE_SYNTAX_RULES}

═══════════════════════════════════
PYQ AUTHENTICITY STANDARDS
═══════════════════════════════════

Your questions must be INDISTINGUISHABLE from real JEE papers. Follow these era-specific patterns:

POST-NTA ERA (2019-2024 JEE Mains):
- 4 options, single correct, +4/−1 marking
- Numerical value type (integer answer, no options) — for these, still create 4 options but make them close integers
- Focus: Application-heavy, less rote, more conceptual traps
- Shift toward: Data interpretation, assertion-reason, statement-based
- Physics: More modern physics, semiconductor, EM waves emphasis
- Chemistry: More GOC, biomolecules, environmental chemistry
- Maths: More statistics, probability, 3D geometry

JEE ADVANCED ERA (2013-2024):
- Multi-correct possible (but generate single-correct for our format)
- Paragraph-based, matrix-match style adapted to MCQ
- High difficulty: 2-3 concepts fused, non-obvious approach required
- Tests: Deep understanding over computation speed
- Signature patterns: "Trick" questions that test whether you READ carefully

AIEEE/OLDER ERA (2004-2012):
- More straightforward, formula-driven
- Clean computation, less tricky
- Standard problems from Irodov, DC Pandey, Cengage level

═══════════════════════════════════
SUBJECT DISTRIBUTION & TOPICS
═══════════════════════════════════

PHYSICS (weightage-based question distribution):
- Mechanics (20%): NLM, WEP, Rotational, Gravitation, SHM
- Electrodynamics (25%): Electrostatics, Capacitance, Current Electricity, EMI, AC
- Optics & Modern (20%): Ray Optics, Wave Optics, Photoelectric, Atoms, Nuclei
- Waves & Thermo (15%): Wave Motion, Sound, KTG, Thermodynamics
- Properties of Matter (10%): Elasticity, Fluid Mechanics, Surface Tension
- Magnetism (10%): Moving Charges, Magnetism, Magnetic Properties

CHEMISTRY:
- Physical (35%): Equilibrium, Thermodynamics, Electrochemistry, Kinetics, Solutions
- Organic (30%): GOC, Hydrocarbons, Halides, Alcohols/Phenols, Carbonyl, Amines, Biomolecules
- Inorganic (35%): Periodic Table, Chemical Bonding, Coordination, p-block, d-block, Metallurgy, Qualitative Analysis

MATHEMATICS:
- Calculus (35%): Limits, Continuity, Differentiation, Integration, Differential Equations, Area
- Algebra (30%): Complex Numbers, Quadratics, P&C, Probability, Matrices, Binomial, Sequences
- Coordinate (20%): Straight Lines, Circles, Conics, 3D Geometry
- Trigonometry (10%): Trig equations, Inverse Trig, Properties of Triangles
- Vectors (5%): Vector algebra, Scalar/Vector triple products

═══════════════════════════════════
🔒 ABSOLUTE RULES
═══════════════════════════════════
1. ANSWER CORRECTNESS > everything else
2. Solve BEFORE creating options
3. No approximations unless explicitly required by question
4. Exact match between solution and correct_option
5. Each question MUST feel authentic to its claimed year/exam

🔁 TWO-PASS VERIFICATION:
PASS 1 — SOLVE fully, get exact answer
PASS 2 — VERIFY correct_option matches exactly. If not → regenerate.`;

    const userPrompt = `Generate ${count} authentic JEE PYQ-style questions ${subjectFilter}.

Each question must feel EXACTLY like it appeared in a real JEE paper from ${yearRange.start}-${yearRange.end}.

STRICT JEE CLEAN-SYNTAX FORMAT for all content.

Return JSON array:
[{
  "question_text": "Question with proper JEE notation (subscripts: v₁, v₂; fractions: (a−b)/c; Greek: θ, α, ω)",
  "option_a": "Option with proper notation and units",
  "option_b": "Option with proper notation and units",
  "option_c": "Option with proper notation and units",
  "option_d": "Option with proper notation and units",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step solution:\\n\\nGiven:\\n...\\n\\nConcept:\\n[Core principle]\\n\\nSolution:\\nStep 1: ...\\n⇒ Step 2: ...\\n\\nFinal Answer: [value with unit]\\n\\nAnswer: (X)\\n\\nWhy other options are wrong:\\n(Y): [specific mistake]",
  "concept_tested": "Exact concept (e.g., 'Faraday's Law with changing area')",
  "common_mistake": "Specific error → wrong option mapping",
  "pyq_year": YYYY,
  "source": "JEE Mains YYYY / JEE Advanced YYYY / AIEEE YYYY",
  "subject": "${subject || 'physics/chemistry/maths'}"
}]

Year distribution: Spread questions across ${yearRange.start}-${yearRange.end}, with 50% from recent 5 years.
Mix: 60% JEE Mains, 30% JEE Advanced, 10% AIEEE (if year range allows).

QUALITY CHECKLIST:
✅ Each question authentic to its claimed exam and year
✅ Difficulty matches the exam type (Advanced > Mains > AIEEE)
✅ correct_option verified against full solution
✅ Distractors from real student mistakes
✅ No two questions test the same concept
✅ Unicode notation only (no LaTeX)`;

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
        temperature: 0.5,
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
