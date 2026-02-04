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
      easy: "Basic conceptual questions testing fundamental understanding. NCERT level. Should be solvable in 30-60 seconds.",
      medium: "JEE Mains level questions requiring application of concepts. Multi-step problems. 1-2 minutes to solve.",
      hard: "JEE Advanced level questions requiring deep understanding and multiple concepts. 2-3 minutes to solve."
    };

    const systemPrompt = `You are a JEE expert question creator for SETU platform.
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
1. Solve the question fully
2. Get final numerical/conceptual answer
3. Verify with units + logic

PASS 2 - MATCH:
1. Compare final answer with all 4 options
2. Find EXACT match (same value, same unit, same sign)
3. If NO exact match → regenerate question with correct options
4. Only after exact match → finalize question

Create questions for: ${subject} > ${chapterName} > ${subchapterName}
Difficulty: ${difficulty.toUpperCase()} - ${difficultyGuide[difficulty]}

CRITICAL RULES:
1. Questions must be EXACTLY like JEE Mains/Advanced papers
2. Each question must test a specific concept
3. Options should include common student mistakes as distractors
4. Provide clear step-by-step explanations in JEE CLEAN-SYNTAX format
5. Identify the exact concept being tested
6. VERIFY: correct_option MUST contain the EXACT correct answer`;

    const userPrompt = `Generate ${count} MCQ questions for "${subchapterName}" (${subject} - ${chapterName}) at ${difficulty} difficulty.

Use STRICT JEE CLEAN-SYNTAX FORMAT for all questions, options, and explanations.

Return JSON array with this exact structure:
[{
  "question_text": "The question with proper JEE notation (subscripts: v₁, v₂; fractions: (a−b)/c; Greek: θ, α, ω)",
  "option_a": "Option with proper notation",
  "option_b": "Option with proper notation", 
  "option_c": "Option with proper notation",
  "option_d": "Option with proper notation",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step solution in JEE clean-syntax format with line-by-line calculations",
  "concept_tested": "Specific concept name being tested",
  "common_mistake": "What mistake students commonly make here"
}]

🔒 BEFORE FINALIZING EACH QUESTION:
1. Solve the question yourself with line-by-line calculation
2. Verify the answer matches EXACTLY with correct_option
3. Check units and signs match
4. Ensure all math uses clean JEE notation (no LaTeX, no backslashes)
5. If mismatch → fix the question or regenerate

Make sure:
- Questions are unique and not repetitive
- Numerical values are realistic
- Include units where applicable
- Use Unicode subscripts (₀₁₂₃) and superscripts (⁰¹²³) appropriately
- correct_option value MUST be verified against solution`;

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
        temperature: 0.7,
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
