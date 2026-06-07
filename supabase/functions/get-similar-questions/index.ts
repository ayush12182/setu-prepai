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

async function generateQuestionAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.6,
        response_mime_type: 'application/json'
      }
    })
  });
  if (!res.ok) {
    throw new Error(`Gemini error: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleanString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanString);
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
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

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

    // 2. Generate vector embedding of the original question
    const origEmbedding = await getEmbedding(GEMINI_API_KEY, originalQuestion);

    // 3. Query Top 10 similar questions via pgvector RPC
    let exemplars = [];
    if (origEmbedding) {
      const { data: matches, error: matchError } = await supabaseClient.rpc('match_questions', {
        query_embedding: origEmbedding,
        match_threshold: 0.1,
        match_count: 10
      });

      if (!matchError && matches && matches.length > 0) {
        // Fetch full fields including pdf_sources relation
        const matchIds = matches.map(m => m.id);
        const { data: fullQuestions } = await supabaseClient
          .from('questions')
          .select('*, pdf_sources(source_style)')
          .in('id', matchIds);

        if (fullQuestions) {
          // Programmatic Reranking: prioritize same chapter, same difficulty, same exam, and quality score
          const reranked = fullQuestions.map(q => {
            // Find similarity from match list
            const matchRecord = matches.find(m => m.id === q.id);
            let score = matchRecord ? matchRecord.similarity : 0.5;

            // Chapter match boost
            if (q.chapter_id && origQ?.chapter_id && q.chapter_id.toLowerCase() === origQ.chapter_id.toLowerCase()) {
              score += 0.2;
            }

            // Difficulty match boost
            if (q.difficulty && currentDifficulty && q.difficulty.toLowerCase() === currentDifficulty.toLowerCase()) {
              score += 0.15;
            }

            // Exam type match boost
            if (q.exam_type && currentExamType && q.exam_type === currentExamType) {
              score += 0.1;
            }

            // Quality score boost
            if (q.question_quality_score === 'ELITE') score += 0.2;
            else if (q.question_quality_score === 'GOOD') score += 0.1;
            else if (q.question_quality_score === 'AVERAGE') score += 0.05;

            return { ...q, rerankScore: score };
          });

          // Sort by rerankScore descending and take top 3
          reranked.sort((a, b) => b.rerankScore - a.rerankScore);
          exemplars = reranked.slice(0, 3);
        }
      }
    }

    // 4. Construct system prompt with guidelines and style benchmark
    const isJee = (subject || "").toUpperCase().includes("JEE") || true;
    
    // Check if there is an active style associated with exemplars
    const exemplarStyles = exemplars
      .map(e => e.pdf_sources?.source_style)
      .filter(Boolean);
    const targetStyle = exemplarStyles[0] || 'STANDARD';

    const systemPrompt = `You are an elite JEE exam question setter. Generate questions that reflect the exact depth, style, and numerical complexity of our gold-standard benchmark datasets.
We are targeting the style of: ${targetStyle}.

${targetStyle === 'ALLEN' ? '- Allen style: Involve multi-concept application, comprehensive calculations, and structured options.' : ''}
${targetStyle === 'RESONANCE' ? '- Resonance style: Highly structured, calculation-intensive, testing core physical/mathematical equations in-depth.' : ''}
${targetStyle === 'FIITJEE' ? '- FIITJEE style: Extremely tricky, requiring out-of-the-box analytical reasoning and combining 3-4 distinct topics.' : ''}
${targetStyle === 'PYQ' ? '- PYQ style: Standard NTA/IIT-JEE patterns, mathematically rigorous, with exact numerical calibration.' : ''}

Generate conceptually similar but non-duplicate questions.
You must output a JSON object containing a "questions" array of exactly ${count} items matching this schema:
- "question_text": string
- "options": array of exactly 4 strings
- "correct_answer": string ("A" | "B" | "C" | "D" or comma-separated list like "A,B" for Multi Correct)
- "explanation": string
- "solution_steps": array of strings
- "concept_tags": array of strings (e.g. ["Coulomb's Law", "Electric Field"])
- "difficulty": "easy" | "medium" | "hard"
- "avg_time_seconds": integer
- "concept_depth": integer (1 to 5)
- "multi_concept_level": integer (1 to 5)
- "calculation_intensity": integer (1 to 5)
- "trickiness_score": integer (1 to 5)
- "question_type": "MCQ" | "Numerical" | "Multi Correct" | "Integer"
`;

    // 5. Construct few-shot user prompt
    let userPrompt = `Failed concept: ${conceptTested} (${subchapterName}, ${subject}).
Original question: "${originalQuestion}".

Exemplar Questions from target source style:
`;

    if (exemplars.length > 0) {
      exemplars.forEach((ex, idx) => {
        userPrompt += `
Exemplar #${idx + 1}:
Text: ${ex.question_text}
Options: A: ${ex.option_a}, B: ${ex.option_b}, C: ${ex.option_c}, D: ${ex.option_d}
Correct Answer: ${ex.correct_answer || ex.correct_option}
Explanation: ${ex.explanation}
Style: ${ex.pdf_sources?.source_style || 'Standard'}
Pattern Metrics: Depth=${ex.concept_depth}, Multi-concept=${ex.multi_concept_level}, Calculation=${ex.calculation_intensity}, Trickiness=${ex.trickiness_score}
`;
      });
    } else {
      userPrompt += "No exemplars found. Generate standard high-quality questions.\n";
    }

    userPrompt += `\nGenerate exactly ${count} new, high-fidelity questions conceptually similar to the original question but not duplicates.`;

    // 6. Generate the questions
    const genData = await generateQuestionAI(GEMINI_API_KEY, systemPrompt, userPrompt);
    const generatedQuestionsList = genData.questions || [];

    const savedQuestions = [];

    // 7. Save generated questions to DB with PENDING status
    for (const q of generatedQuestionsList) {
      const qText = q.question_text || '';
      if (!qText.trim()) continue;

      let embedding: number[] | null = null;
      embedding = await getEmbedding(GEMINI_API_KEY, qText);

      // Check duplicates against DB
      if (embedding) {
        const { data: dupMatches } = await supabaseClient.rpc('match_questions', {
          query_embedding: embedding,
          match_threshold: 0.95,
          match_count: 1
        });

        if (dupMatches && dupMatches.length > 0) {
          console.log(`AI-Generated question is a duplicate. Skipping save.`);
          continue;
        }
      }

      // Convert options list to A/B/C/D object
      let optionsObj: Record<string, string> = {};
      if (Array.isArray(q.options) && q.options.length > 0) {
        const keys = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt: string, idx: number) => {
          if (idx < keys.length) {
            optionsObj[keys[idx]] = opt;
          }
        });
      } else if (typeof q.options === 'object' && q.options !== null) {
        optionsObj = q.options;
      }

      const payload = {
        parent_question_id: originalQuestionId,
        question_text: qText,
        question_type: q.question_type || 'MCQ',
        options: optionsObj,
        correct_answer: q.correct_answer || q.correct_option || 'A',
        explanation: q.explanation || '',
        is_ai_generated: true,
        embedding: embedding,
        attempts_count: 0,
        correct_count: 0,
        avg_time_taken: q.avg_time_seconds || 180,
        difficulty_score: q.difficulty === 'easy' ? 25.0 : q.difficulty === 'hard' ? 75.0 : 50.0,
        concept_depth: q.concept_depth || 1,
        multi_concept_level: q.multi_concept_level || 1,
        calculation_intensity: q.calculation_intensity || 1,
        trickiness_score: q.trickiness_score || 1,
        verification_status: 'PENDING', // MUST go to review first
        is_verified: false,
        subject: subject || origQ?.subject || '',
        difficulty: q.difficulty || currentDifficulty,
        exam_type: currentExamType,
        // Legacy column fallbacks
        chapter_id: origQ?.chapter_id || '',
        subchapter_id: origQ?.subchapter_id || '',
        concept_tested: conceptTested || origQ?.concept_tested || 'General',
        source: 'ai_generated'
      };

      const { data: dbData, error: dbError } = await supabaseClient
        .from('questions')
        .insert(payload)
        .select()
        .single();

      if (dbError) {
        console.error("Failed to insert AI generated question:", dbError);
        continue;
      }

      // Add concept tags
      const tags = q.concept_tags || [];
      if (dbData && tags.length > 0) {
        const tagPayload = tags.map((t: string) => ({
          question_id: dbData.id,
          tag: t.trim()
        }));
        await supabaseClient.from('question_tags').insert(tagPayload);
      }

      savedQuestions.push({
        ...dbData,
        // Match structure expected by QuizInterface or getSimilarQuestions hook
        option_a: optionsObj['A'] || '',
        option_b: optionsObj['B'] || '',
        option_c: optionsObj['C'] || '',
        option_d: optionsObj['D'] || '',
        correct_option: q.correct_answer || q.correct_option || 'A'
      });
    }

    return new Response(JSON.stringify({ questions: savedQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[get-similar-questions]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
