import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { 
      targetExam = "JEE", 
      currentClass = "11", 
      subjects = "Physics, Chemistry, Mathematics",
      difficulty = "Moderate to High",
      duration = "60 minutes",
      totalQuestions = 30,
      topic = null,
      phase = "baseline"
    } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // n-1 Logic
    const currentClsInt = parseInt(currentClass);
    const targetBaseClass = currentClsInt > 0 ? (currentClsInt - 1).toString() : currentClass;

    const systemPrompt = `You are an advanced academic diagnostic system designed for B2B education platforms (schools, coaching institutes).
Your task is to generate a structured diagnostic test for a newly onboarded student.

========================
🎯 INPUT PARAMETERS
========================
- Target Exam: ${targetExam}
- Current Class: ${currentClass} ${topic ? `(Focusing on Topic: ${topic})` : `(Targeting fundamentals of Class ${targetBaseClass} per n-1 rule)`}
- Subjects: ${subjects}
- Difficulty Level: ${difficulty} (similar to ASAT/PWSAT)
- Test Duration: ${duration}
- Total Questions: ${totalQuestions}
- Phase: ${phase}

========================
🧠 LOGIC RULE (VERY IMPORTANT)
========================
${topic ? `MICRO-PROBING MODE:
- Student showed weakness in "${topic}".
- Generate exactly ${totalQuestions} questions covering these levels:
  1. Basic concept check
  2. Direct application
  3. Graph/Data interpretation
  4. Tricky/Conceptual trap
  5. Advanced application` : `BASELINE MODE (n-1 Concept Mapping):
- If student is in Class ${currentClass} → ask questions from Class ${targetBaseClass}
- Ensure strong focus on fundamentals, concept clarity, and application`}

========================
📘 QUESTION GENERATION RULES
========================
- Questions should be conceptual and application-based (not direct theory)
- Follow ASAT/PWSAT style:
  - Mix of easy, moderate, tricky questions
  - Include misconception-based traps
- Include:
  - 70% concept application
  - 20% numerical/problem-solving
  - 10% direct concept checks
- Avoid repetition
- Cover all major chapters proportionally
- Include MCQs with 4 options (1 correct)`;

    const userPrompt = `Generate ${totalQuestions} questions for ${targetExam}. 
Return a JSON object with a "questions" array. Each question must have:
- question_text: the full question
- option_a, option_b, option_c, option_d: string options
- correct_option: "A", "B", "C", or "D"
- explanation: detailed conceptual explanation
- subject: string
- topic: string
- difficulty: "easy", "medium", or "hard"
- skill_tested: string (e.g. "Concept Application", "Numerical Solving")`;

    const data = await callGeminiJSON<{ questions: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.4);

    return new Response(JSON.stringify({ 
      questions: data.questions || [],
      metadata: { targetExam, currentClass, targetBaseClass, totalQuestions }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-diagnostic-test]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
