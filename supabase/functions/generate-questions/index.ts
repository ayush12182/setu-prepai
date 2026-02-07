import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionRequest {
  subchapterId: string;
  subchapterName: string;
  chapterId: string;
  chapterName: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
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
- Proper vector notation: vec notation with →

==============================
QUESTION FORMAT RULES
==============================

MATHS:
- Direction ratios: d₁ = (2, 1, 4)
- Fractions: (x − k)/2 = (y − 3)/1 = (z − 1)/4
- Cross product: d₁ × d₂
- Determinant format for matrix operations

PHYSICS:
- Clean formulas: v = u + at, s = ut + (1/2)at²
- Energy: E = mc², KE = (1/2)mv²
- Subscripts for variables: v₀, v₁, T₁, T₂

CHEMISTRY:
- Reactions: Fe + CuSO₄ → FeSO₄ + Cu
- No arrow explanations inside equation
- Proper subscripts for molecular formulas: H₂O, CO₂, H₂SO₄

==============================
SOLUTION FORMAT (MANDATORY)
==============================

Step 1: Given/Asked (short)
What is given, what is asked

Step 2: Concept (1-2 lines)
The principle being used

Step 3: Calculation (line-by-line)
One step per line:
d₁ × d₂ = (−3, 2, 1)
P₂ − P₁ = (2k, k − 3, 2)
⇒ −6k + 2(k − 3) + 2 = 0
⇒ −4k − 4 = 0
⇒ k = −1

Step 4: Final Answer
5k = 5(−1) = −5

Step 5: Answer Match
Final Answer: (C) −5

==============================
NO TEXT IN EQUATIONS RULE
==============================

WRONG: "Substituting k = −1 in equation gives 5k = −5"
RIGHT:
Substitute k = −1:
5k = 5(−1)
   = −5
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subchapterId, subchapterName, chapterId, chapterName, subject, difficulty, count = 5 }: QuestionRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we already have questions for this subchapter and difficulty
    const { data: existingQuestions, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .eq("subchapter_id", subchapterId)
      .eq("difficulty", difficulty)
      .limit(count);

    if (fetchError) {
      console.error("Error fetching existing questions:", fetchError);
    }

    // If we have enough questions, return them
    if (existingQuestions && existingQuestions.length >= count) {
      return new Response(JSON.stringify({ questions: existingQuestions.slice(0, count) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate new questions using AI
    const difficultyGuide = {
      easy: `NCERT + NCERT Exemplar level. Single-concept, direct application. Solvable in 30-60 seconds.
Focus: Definition recall, single-formula plug-in, basic graph reading, simple unit conversion.
Traps to include: Sign errors, unit mismatch, confusing similar formulas (e.g., v=u+at vs v²=u²+2as).`,
      medium: `JEE Mains level. Multi-step, 2-3 concept integration. Solvable in 1-2 minutes.
Focus: Application problems, concept linking (e.g., energy + momentum), graph interpretation with calculation, multi-variable problems.
Traps to include: Partial calculation errors, wrong frame of reference, forgetting boundary conditions, incorrect sign conventions, misreading graphs.`,
      hard: `JEE Advanced level. Multi-concept fusion, non-obvious approach needed. Solvable in 2-4 minutes.
Focus: Paragraph-based reasoning, uncommon applications of standard formulas, edge cases, problems requiring trick substitutions or symmetry arguments.
Traps to include: Over-simplification, missing edge cases, applying wrong theorem, dimensional traps, calculation shortcuts that lead to wrong answers.`
    };

    const systemPrompt = `You are an elite JEE question designer for SETU — India's #1 AI mentor platform.
Mode: JEE EXAM ACCURACY MODE — Option Locked

${JEE_SYNTAX_RULES}

═══════════════════════════════════
QUESTION DESIGN PHILOSOPHY
═══════════════════════════════════

You are NOT just generating MCQs. You are crafting exam-grade questions that:
1. Test EXACTLY ONE core concept per question (stated in concept_tested)
2. Have 3 distractors designed from REAL student mistakes (not random values)
3. Are numerically clean — no ugly decimals unless intentional
4. Match the cognitive level of actual NTA/IIT papers

═══════════════════════════════════
SUBJECT-SPECIFIC MASTERY RULES
═══════════════════════════════════

PHYSICS:
- Always specify reference frame, sign convention, and coordinate system when relevant
- Use standard SI units; mention CGS only when the question specifically tests unit conversion
- Include diagram descriptions in text when spatial reasoning is needed: "A block of mass m on an inclined plane at angle θ..."
- Common trap patterns to use: centripetal vs centrifugal, real vs apparent weight, relative velocity signs, direction of induced EMF (Lenz's law), sign of work done
- For Electrostatics/Magnetism: Always specify medium (vacuum/dielectric), charge signs, current direction
- For Optics: Specify sign convention (Cartesian), real/virtual distinction
- For Modern Physics: Use proper decay notation, energy-mass equivalence with correct c² factors
- For Thermodynamics: Clearly state process type (isothermal/adiabatic/isobaric/isochoric), system boundaries

CHEMISTRY:
- Physical Chemistry: Calculations must be dimensionally consistent. Use proper equilibrium expressions, rate laws, and thermodynamic relations. Include units in all numerical answers.
- Organic Chemistry: Use IUPAC naming. Specify stereochemistry (R/S, E/Z, cis/trans) when relevant. Include reagent conditions (temperature, solvent, catalyst). Test: reaction mechanisms, rearrangements, named reactions, functional group interconversions.
- Inorganic Chemistry: Test periodic trends with exceptions. Include coordination chemistry (CFSE, isomerism, magnetic properties). Use proper oxidation state notation. Cover: metallurgy, qualitative analysis, p-block/d-block/f-block properties.
- Common trap patterns: forgetting to balance equations, wrong hybridization, ignoring steric effects, confusing kinetic vs thermodynamic control

MATHEMATICS:
- Always specify domain/range restrictions when relevant
- For Calculus: Test limits (L'Hôpital, squeeze theorem, standard limits), continuity/differentiability at specific points, definite integrals with substitution traps, area/volume applications
- For Algebra: Complex numbers (modulus, argument, Euler form), matrices/determinants (properties, rank), sequences & series (convergence, telescoping, partial fractions)
- For Coordinate Geometry: Conic sections (eccentricity, focal chord, tangent/normal), 3D geometry (direction cosines, shortest distance between lines, plane equations)
- For Trigonometry: Multiple angle formulas, conditional identities, inverse trig domains
- For Probability: Bayes' theorem, conditional probability traps, distinguishable vs indistinguishable counting
- For Vectors: Cross product direction (right-hand rule), scalar triple product applications, projection formulas
- Common trap patterns: domain errors, sign mistakes in complex number arguments, forgetting ±, wrong formula for nth term vs sum

═══════════════════════════════════
DISTRACTOR DESIGN (CRITICAL)
═══════════════════════════════════

Each wrong option MUST come from a SPECIFIC, DOCUMENTED student mistake:
- Option from forgetting a factor (like 2, π, or ½)
- Option from wrong sign convention
- Option from using wrong formula
- Option from incomplete calculation (stopping one step early)

In common_mistake field, document WHICH specific error produces WHICH wrong option.

═══════════════════════════════════
🔒 ABSOLUTE RULES (NON-NEGOTIABLE)
═══════════════════════════════════
1. ANSWER CORRECTNESS > everything else
2. If final answer doesn't EXACTLY match an option → REGENERATE
3. No approximations, no "closest option", no rounding unless explicitly required
4. Each question MUST be solvable with standard JEE syllabus knowledge
5. No ambiguous questions — exactly ONE correct answer always

🔁 TWO-PASS VERIFICATION (MANDATORY):
PASS 1 — SOLVE: Solve completely. Get exact answer with units.
PASS 2 — MATCH: Verify exact match with correct_option. If no match → regenerate.

Create questions for: ${subject} > ${chapterName} > ${subchapterName}
Difficulty: ${difficulty.toUpperCase()} — ${difficultyGuide[difficulty]}`;

    const userPrompt = `Generate ${count} MCQ questions for "${subchapterName}" (${subject} — ${chapterName}) at ${difficulty} difficulty.

STRICT JEE CLEAN-SYNTAX FORMAT for all content.

Return JSON array:
[{
  "question_text": "Question with proper JEE notation (subscripts: v₁, v₂; fractions: (a−b)/c; Greek: θ, α, ω; superscripts: x², eⁿ)",
  "option_a": "Option with proper notation and units",
  "option_b": "Option with proper notation and units",
  "option_c": "Option with proper notation and units",
  "option_d": "Option with proper notation and units",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step solution in JEE clean-syntax:\\n\\nGiven:\\n...\\n\\nConcept:\\n...\\n\\nSolution:\\nStep 1: [formula/substitution]\\n⇒ Step 2: [calculation]\\n⇒ Step 3: [simplification]\\n\\nFinal Answer: [value with unit]\\n\\nAnswer: (X)\\n\\nWhy other options are wrong:\\n(A/B/C/D): [specific mistake that leads to this value]",
  "concept_tested": "Exact concept name (e.g., 'Conservation of Linear Momentum in 2D Collision')",
  "common_mistake": "Specific error → which wrong option it produces. E.g., 'Forgetting factor of 2 in KE formula gives option (B)'"
}]

QUALITY CHECKLIST (mandatory before output):
✅ Each question tests exactly ONE concept from the subchapter
✅ All 4 options are dimensionally consistent
✅ Numerical values are realistic (no absurd magnitudes)
✅ correct_option verified against full solution
✅ common_mistake maps to a specific wrong option
✅ No two questions test the same concept
✅ Unicode subscripts/superscripts used (no LaTeX)
✅ Units included where applicable`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from AI response
    let questions;
    try {
      // Remove markdown code fences if present
      let jsonContent = content.trim();
      
      // Handle ```json ... ``` or ``` ... ``` format
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }
      
      // Parse the JSON array
      questions = JSON.parse(jsonContent);
      
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response. Error:", parseError);
      console.error("Content received:", content.substring(0, 500));
      throw new Error("Failed to parse questions from AI");
    }

    // Store questions in database
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: subchapterId,
      chapter_id: chapterId,
      subject: subject.toLowerCase(),
      difficulty,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option.toUpperCase(),
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      source: "ai_generated",
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      // Return the generated questions even if insert fails
      return new Response(JSON.stringify({ questions: questionsToInsert, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: insertedQuestions, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
