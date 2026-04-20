import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CURRICULUM_PROMPT = `You are the core curriculum intelligence engine for SETU, an AI exam prep platform.
Convert any chapter into a structured, exam-optimized learning tree. Return ONLY valid JSON.

Output format:
{
  "chapter": "<chapter name>",
  "subtopics": [
    {
      "id": "unique_slug",
      "name": "Subtopic Name",
      "order": 1,
      "difficulty_level": "easy | medium | hard",
      "weightage_estimate": "low | medium | high",
      "concept_type": "theoretical | numerical | mixed | memory-based",
      "microtopics": [
        { "name": "Microtopic Name", "tags": ["formula","definition","application","graph","exception"] }
      ],
      "expected_question_types": ["MCQ","Assertion-Reason","Numerical","Match the Following"],
      "common_mistakes": ["Typical student mistake"]
    }
  ]
}

Rules:
- 6-14 subtopics, ordered basic → advanced
- 3-6 microtopics per subtopic
- No generic headings (no "Introduction", "Overview", "Basics")
- Weightage = frequency in past exam papers
- Biology: NCERT lines, diagrams, factual traps, memory clusters
- Physics: numericals, derivations, graph-based thinking
- Chemistry: reaction mechanisms, exceptions, memory rules
- Math: problem types, standard forms, formula-driven`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { subject, chapter, exam, chapter_node_id } = await req.json();

    if (!subject || !chapter || !exam) {
      return new Response(JSON.stringify({ error: "subject, chapter, exam are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // CACHE HIT: return existing AI-generated tree
    if (chapter_node_id) {
      const { data: existing } = await supabase
        .from("learning_nodes")
        .select("id")
        .eq("parent_id", chapter_node_id)
        .eq("ai_generated", true)
        .limit(1);

      if (existing && existing.length > 0) {
        const { data: topics } = await supabase
          .from("learning_nodes")
          .select("*")
          .eq("parent_id", chapter_node_id)
          .order("sort_order", { ascending: true });

        const topicIds = (topics || []).map((t: any) => t.id);
        const { data: microtopics } = topicIds.length > 0
          ? await supabase.from("learning_nodes").select("*").in("parent_id", topicIds).order("sort_order")
          : { data: [] };

        return new Response(JSON.stringify({ cached: true, topics: topics || [], microtopics: microtopics || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // GENERATE: Call OpenAI with retry
    let parsed: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${OPENAI_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: CURRICULUM_PROMPT },
              { role: "user", content: JSON.stringify({ subject, chapter, exam }) },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
          }),
        });

        if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
        const json = await res.json();
        parsed = JSON.parse(json.choices[0].message.content);
        if (parsed?.subtopics?.length) break;
      } catch (e) {
        if (attempt === 3) throw e;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    if (!parsed?.subtopics?.length) throw new Error("Invalid curriculum response from AI");

    // PERSIST: Insert into learning_nodes graph
    const insertedTopics: any[] = [];
    const insertedMicrotopics: any[] = [];

    if (chapter_node_id) {
      for (let i = 0; i < parsed.subtopics.length; i++) {
        const sub = parsed.subtopics[i];

        const keywordTokens = (sub.microtopics || [])
          .flatMap((m: any) => m.name.toLowerCase().split(/\s+/))
          .slice(0, 12);

        const { data: topicRow } = await supabase
          .from("learning_nodes")
          .insert({
            parent_id: chapter_node_id,
            name: sub.name,
            type: "topic",
            exam_type: exam,
            sort_order: sub.order ?? i + 1,
            difficulty_level: sub.difficulty_level,
            weightage_estimate: sub.weightage_estimate,
            concept_type: sub.concept_type,
            ai_generated: true,
            common_mistakes: sub.common_mistakes ?? [],
            expected_question_types: sub.expected_question_types ?? [],
            keywords: keywordTokens,
          })
          .select()
          .single();

        if (!topicRow) continue;
        insertedTopics.push(topicRow);

        for (let j = 0; j < (sub.microtopics ?? []).length; j++) {
          const micro = sub.microtopics[j];
          const { data: microRow } = await supabase
            .from("learning_nodes")
            .insert({
              parent_id: topicRow.id,
              name: micro.name,
              type: "subtopic",
              exam_type: exam,
              sort_order: j + 1,
              ai_generated: true,
              microtopic_tags: micro.tags ?? [],
              keywords: micro.tags ?? [],
            })
            .select()
            .single();

          if (microRow) insertedMicrotopics.push(microRow);
        }
      }
    }

    return new Response(
      JSON.stringify({
        cached: false,
        chapter: parsed.chapter,
        topics: chapter_node_id ? insertedTopics : parsed.subtopics,
        microtopics: chapter_node_id ? insertedMicrotopics : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-subtopics]", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
