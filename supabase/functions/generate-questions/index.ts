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

    const systemPrompt = `You are a JEE expert question creator trained on Allen, Physics Wallah, and Resonance materials. 
Create authentic JEE-style MCQ questions for: ${subject} > ${chapterName} > ${subchapterName}

Difficulty: ${difficulty.toUpperCase()} - ${difficultyGuide[difficulty]}

CRITICAL RULES:
1. Questions must be EXACTLY like JEE Mains/Advanced papers
2. Each question must test a specific concept
3. Options should include common student mistakes as distractors
4. Provide clear step-by-step explanations
5. Identify the exact concept being tested
6. For ${difficulty === 'easy' ? 'NCERT basics' : difficulty === 'medium' ? 'JEE Mains 2019-2024' : 'JEE Advanced 2019-2024'} style`;

    const userPrompt = `Generate ${count} MCQ questions for "${subchapterName}" (${subject} - ${chapterName}) at ${difficulty} difficulty.

Return JSON array with this exact structure:
[{
  "question_text": "The question with all necessary data",
  "option_a": "First option",
  "option_b": "Second option", 
  "option_c": "Third option",
  "option_d": "Fourth option",
  "correct_option": "A/B/C/D",
  "explanation": "Detailed step-by-step solution explaining WHY this is correct and why other options are wrong",
  "concept_tested": "Specific concept name being tested",
  "common_mistake": "What mistake students commonly make here"
}]

Make sure:
- Questions are unique and not repetitive
- Numerical values are realistic
- Include units where applicable
- Diagrams should be described in text if needed`;

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
