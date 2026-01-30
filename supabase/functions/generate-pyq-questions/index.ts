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
    
    const systemPrompt = `You are a JEE expert with access to all JEE Mains and JEE Advanced papers from ${yearRange.start} to ${yearRange.end}.
Your task is to create questions that are EXACTLY like actual JEE Previous Year Questions (PYQs).

CRITICAL: These must feel like REAL PYQs that appeared in JEE exams. Reference actual question patterns, numerical values, and styles from past papers.

Key characteristics of JEE PYQs:
1. JEE Mains (2013-2024): Single correct MCQs, numerical value questions converted to MCQ format
2. JEE Advanced (2006-2024): More complex, multi-concept questions
3. AIEEE (2004-2012): Predecessor to JEE Mains, similar style

Include a mix of years ${yearRange.start}-${yearRange.end} to simulate a proper PYQ test.`;

    const userPrompt = `Generate ${count} authentic JEE PYQ-style questions ${subjectFilter}.

Each question should feel like it was ACTUALLY asked in JEE Mains/Advanced between ${yearRange.start}-${yearRange.end}.

Return JSON array with this structure:
[{
  "question_text": "The exact question as it would appear in JEE paper",
  "option_a": "First option",
  "option_b": "Second option",
  "option_c": "Third option",
  "option_d": "Fourth option",
  "correct_option": "A/B/C/D",
  "explanation": "Complete solution with steps, as would appear in answer key",
  "concept_tested": "Core concept being tested",
  "common_mistake": "Typical error students make",
  "pyq_year": YYYY (a realistic year between ${yearRange.start}-${yearRange.end}),
  "source": "JEE Mains YYYY / JEE Advanced YYYY / AIEEE YYYY"
}]

Mix of:
- 60% JEE Mains style (moderate difficulty, 2-3 min questions)
- 30% JEE Advanced style (challenging, multi-concept, 4-5 min questions)  
- 10% Classic AIEEE style (if year range includes pre-2013)

Distribute questions across different years proportionally.`;

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
