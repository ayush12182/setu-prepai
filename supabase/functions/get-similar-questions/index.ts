import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getEmbedding(apiKey: string, text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      })
    });
    if (!res.ok) {
      console.error("Failed to generate embedding:", await res.text());
      return null;
    }
    const data = await res.json();
    return data.embedding?.values || null;
  } catch (err) {
    console.error("Embedding generation error:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { conceptTested, subchapterName, subject, originalQuestion, count = 3 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // 1. Fetch original question metadata and ID
    const { data: origQ } = await supabaseClient
      .from('questions')
      .select('*')
      .eq('question_text', originalQuestion)
      .limit(1)
      .maybeSingle();

    const originalQuestionId = origQ?.id || null;
    const currentDifficulty = origQ?.difficulty || 'medium';
    const currentExamType = origQ?.exam_type || 'JEE_MAINS';
    const chapterId = origQ?.chapter_id || null;
    const subjectName = subject || origQ?.subject || '';

    // 2. Query Top 20 similar questions via pgvector RPC if embedding is available
    let exemplars: any[] = [];
    if (GEMINI_API_KEY && originalQuestion) {
      const origEmbedding = await getEmbedding(GEMINI_API_KEY, originalQuestion);

      if (origEmbedding) {
        const { data: matches, error: matchError } = await supabaseClient.rpc('match_questions', {
          query_embedding: origEmbedding,
          match_threshold: 0.1,
          match_count: 20
        });

        if (!matchError && matches && matches.length > 0) {
          const matchIds = matches.map(m => m.id).filter(id => id !== originalQuestionId);
          const { data: fullQuestions } = await supabaseClient
            .from('questions')
            .select('*')
            .in('id', matchIds)
            .eq('verification_status', 'APPROVED');

          if (fullQuestions && fullQuestions.length > 0) {
            const reranked = fullQuestions.map(q => {
              const matchRecord = matches.find(m => m.id === q.id);
              let score = matchRecord ? matchRecord.similarity : 0.5;

              // Chapter match boost
              if (q.chapter_id && origQ?.chapter_id && q.chapter_id.toLowerCase() === origQ.chapter_id.toLowerCase()) {
                score += 0.3;
              }
              // Difficulty match boost
              if (q.difficulty && currentDifficulty && q.difficulty.toLowerCase() === currentDifficulty.toLowerCase()) {
                score += 0.15;
              }
              // Exam type match boost
              if (q.exam_type && currentExamType && q.exam_type === currentExamType) {
                score += 0.1;
              }
              return { ...q, rerankScore: score };
            });

            reranked.sort((a: any, b: any) => b.rerankScore - a.rerankScore);
            exemplars = reranked;
          }
        }
      }
    }

    // 3. Fallback: Query by chapter/subject metadata to fill target count
    if (exemplars.length < count) {
      let query = supabaseClient
        .from('questions')
        .select('*')
        .eq('verification_status', 'APPROVED');

      if (originalQuestionId) {
        query = query.neq('id', originalQuestionId);
      }

      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      } else if (subjectName) {
        query = query.eq('subject', subjectName);
      }

      const { data: directMatch } = await query.limit(30);

      if (directMatch && directMatch.length > 0) {
        const existingIds = exemplars.map(e => e.id);
        const filteredDirect = directMatch.filter(q => !existingIds.includes(q.id));

        const withScore = filteredDirect.map(q => {
          let score = 0.5;
          if (conceptTested && q.concept_tested && q.concept_tested.toLowerCase().includes(conceptTested.toLowerCase())) {
            score += 0.4;
          }
          if (q.difficulty && currentDifficulty && q.difficulty.toLowerCase() === currentDifficulty.toLowerCase()) {
            score += 0.1;
          }
          return { ...q, rerankScore: score };
        });

        withScore.sort((a: any, b: any) => b.rerankScore - a.rerankScore);
        exemplars = [...exemplars, ...withScore];
      }
    }

    // 4. Return top count formatted questions
    const finalQuestions = exemplars.slice(0, count).map(q => ({
      id: q.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option || q.correct_answer || q.answer || 'A',
      explanation: q.explanation || '',
      concept_tested: q.concept_tested || 'General',
      difficulty: q.difficulty || 'medium',
      exam_type: q.exam_type || 'JEE_MAINS'
    }));

    return new Response(JSON.stringify({ questions: finalQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[get-similar-questions]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
