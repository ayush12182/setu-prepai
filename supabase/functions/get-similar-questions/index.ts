import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      chapterId,
      conceptTested,
      originalQuestionId,
      difficulty,
      count = 3,
      examType = "JEE_MAINS"
    } = await req.json();

    // Only serve JEE questions for this feature
    const jeeExamTypes = ["JEE_MAINS", "JEE_ADVANCED", "JEE"];
    const isJee = jeeExamTypes.includes((examType || "").toUpperCase());
    if (!isJee) {
      return new Response(JSON.stringify({ questions: [], message: "Similar questions only available for JEE" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chapterId) {
      return new Response(JSON.stringify({ questions: [], error: "chapterId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let results: any[] = [];

    // STRATEGY 1: Same chapter_id + same concept_tested — MOST SIMILAR
    if (conceptTested) {
      const { data: conceptMatches } = await supabase
        .from("questions")
        .select("*")
        .eq("chapter_id", chapterId)
        .eq("verification_status", "APPROVED")
        .in("exam_type", jeeExamTypes)
        .ilike("concept_tested", `%${conceptTested}%`)
        .neq("id", originalQuestionId || "00000000-0000-0000-0000-000000000000")
        .limit(50);

      if (conceptMatches && conceptMatches.length > 0) {
        // Shuffle for variety
        const shuffled = conceptMatches.sort(() => Math.random() - 0.5);
        results = shuffled.slice(0, count);
      }
    }

    // STRATEGY 2: If not enough — same chapter_id + same difficulty
    if (results.length < count) {
      const existingIds = [originalQuestionId, ...results.map((r) => r.id)].filter(Boolean);
      const needed = count - results.length;

      const { data: difficultyMatches } = await supabase
        .from("questions")
        .select("*")
        .eq("chapter_id", chapterId)
        .eq("verification_status", "APPROVED")
        .in("exam_type", jeeExamTypes)
        .eq("difficulty", (difficulty || "medium").toLowerCase())
        .not("id", "in", `(${existingIds.map((id) => `"${id}"`).join(",")})`)
        .limit(50);

      if (difficultyMatches && difficultyMatches.length > 0) {
        const shuffled = difficultyMatches.sort(() => Math.random() - 0.5);
        results = [...results, ...shuffled.slice(0, needed)];
      }
    }

    // STRATEGY 3: Final fallback — any question from same chapter
    if (results.length < count) {
      const existingIds = [originalQuestionId, ...results.map((r) => r.id)].filter(Boolean);
      const needed = count - results.length;

      const { data: chapterMatches } = await supabase
        .from("questions")
        .select("*")
        .eq("chapter_id", chapterId)
        .eq("verification_status", "APPROVED")
        .in("exam_type", jeeExamTypes)
        .not("id", "in", `(${existingIds.map((id) => `"${id}"`).join(",")})`)
        .limit(50);

      if (chapterMatches && chapterMatches.length > 0) {
        const shuffled = chapterMatches.sort(() => Math.random() - 0.5);
        results = [...results, ...shuffled.slice(0, needed)];
      }
    }

    const finalQuestions = results.slice(0, count).map((q) => ({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option || q.correct_answer || "A",
      explanation: q.explanation || "",
      concept_tested: q.concept_tested || "General",
      difficulty: q.difficulty || "medium",
      exam_type: q.exam_type || "JEE_MAINS",
      chapter_id: q.chapter_id,
      similarity_source: results.findIndex((r) => r.id === q.id) < 1 ? "concept_match" : "chapter_match"
    }));

    console.log(`[get-similar-questions] chapter=${chapterId}, concept=${conceptTested}, found=${finalQuestions.length}`);

    return new Response(JSON.stringify({ questions: finalQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[get-similar-questions]", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
