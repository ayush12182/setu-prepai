import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { userId, attemptId, answers, questions, stream = "JEE", phase = "baseline" } = body;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an advanced academic diagnostic system designed for B2B education platforms (schools, coaching institutes).
Your task is to generate a detailed performance report for a student who just completed a diagnostic test.

========================
🧠 INTELLIGENCE SEGMENTS (PHASE 3)
========================
Categorize every topic into these 4 segments based on Accuracy vs Confidence:
1. Strong (Accuracy High, Confidence High)
2. Needs Teaching (Accuracy Low, Confidence Low)
3. Misconception (Accuracy Low, Confidence High) ⚠️
4. Fragile Knowledge (Accuracy High, Confidence Low)

========================
📊 OUTPUT STRUCTURE (JSON ONLY)
========================
Generate a detailed teacher-facing report in JSON format with the following keys:
1. overall_stats: { score, accuracy, confidence_index, speed_accuracy_ratio }
2. performance_breakdown: { 
     chapter: { 
       status: "Strong" | "Moderate" | "Weak", 
       accuracy, 
       confidence,
       segment: "Strong" | "Needs Teaching" | "Misconception" | "Fragile"
     } 
   }
3. concept_mapping: { strong_areas: [], moderate_areas: [], weak_areas: [] }
4. indicators: { conceptual_clarity: "High" | "Medium" | "Low", problem_solving_ability, speed_accuracy_balance, guessing_tendency }
5. mistake_analysis: { conceptual_errors, calculation_mistakes, interpretation_errors }
6. category_tag: "e.g. High Potential but Weak Fundamentals"
7. actionable_insights: { topics_to_revise, starting_point, recommended_batch: "Batch A" | "Batch B" | "Batch C" }
8. adaptive_report: { 
     probing_topic,
     result: "Recoverable Weakness" | "Core Gap",
     drill_performance: { accuracy, trend }
   }
9. mentor_feedback: { 
     text: "Jeetu Bhaiya style feedback (conversational, slightly informal Hindi/English mix, encouraging but realistic)" 
   }

========================
🎯 OUTPUT TONE
========================
- Professional, data-driven for teacher
- Warm, relatable for mentor_feedback section
- Crisp and structured`;

    const userPrompt = `Diagnostic Results:
Stream: ${stream}
Answers: ${JSON.stringify(answers)}
Questions: ${JSON.stringify(questions)}
Phase: ${phase}

Analyze this and return the report in the specified JSON structure. 
Pay special attention to the Accuracy vs Confidence mapping for Misconceptions.
Also include:
- concept_score (0-100)
- accuracy_score (0-100)
- speed_score (0-100)
- confidence_score (0-100)
- weak_topics (array of strings)
- strong_topics (array of strings)
- prerequisite_gaps (array of strings)
- overall_level: "advanced" | "intermediate" | "beginner"`;

    const data = await callGeminiJSON<{ profile: any }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.3);

    // Map keys to match learning_profiles table schema if necessary
    const profile = {
      ...(data.profile || data),
      metadata: {
        ...(data.profile?.metadata || data),
        indicators: data.indicators,
        mistake_analysis: data.mistake_analysis,
        category_tag: data.category_tag,
        actionable_insights: data.actionable_insights,
        study_plan: data.study_plan,
        overall_stats: data.overall_stats,
        performance_breakdown: data.performance_breakdown,
      }
    };

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-learning-profile]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
