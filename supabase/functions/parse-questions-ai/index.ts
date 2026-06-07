import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

async function callClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });
  if (!res.ok) {
    throw new Error(`Claude error: ${await res.text()}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.2,
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
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { rawText, source = 'PDF_UPLOAD', exam, subject, userClass, pdfSourceId } = await req.json();

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Missing rawText in payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!geminiKey && !anthropicKey) {
      throw new Error("Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is configured.");
    }

    const systemPrompt = `You are an expert AI educational content parser in India.
Your job is to parse unstructured question text, PYQ dumps, or raw text and output a strictly typed JSON array of questions matching this schema.

Schema requirements for array objects:
- "exam": "JEE_MAINS" | "JEE_ADVANCED" | "NEET" | "CUET"
- "subject": "Physics" | "Chemistry" | "Mathematics" | "Biology"
- "chapter": string
- "question_type": "MCQ" | "Numerical" | "Multi Correct" | "Integer"
- "options": array of strings (For MCQ and Multi Correct: exactly 4 strings. For Numerical and Integer: empty array or null)
- "correct_answer": string (For MCQ: "A", "B", "C", or "D". For Multi Correct: comma-separated list of keys, e.g. "A,B" or "A,C,D". For Numerical/Integer: the numeric value as a string, e.g. "12.5" or "4")
- "explanation": string (brief summary)
- "solution_steps": array of strings (detailed steps)
- "difficulty": "easy" | "medium" | "hard"
- "avg_time_seconds": integer
- "concept_tags": array of strings (concept-level tags, e.g. ["Coulomb's Law", "Electric Field"])
- "concept_depth": integer (1 to 5)
- "multi_concept_level": integer (1 to 5)
- "calculation_intensity": integer (1 to 5)
- "trickiness_score": integer (1 to 5)
- "question_text": string

Output ONLY the JSON array. Do not output any markdown formatting like \`\`\`json. Return just the raw array [{ ... }].`;

    const userPrompt = `Parse the following text into structured questions for Exam: ${exam}, Class: ${userClass}, Subject: ${subject}.\n\nRaw text:\n${rawText}`;

    let parsedOutput = '';
    if (geminiKey) {
      // Use Gemini primarily since we also need it for embeddings
      parsedOutput = await callGemini(geminiKey, systemPrompt, userPrompt);
    } else {
      parsedOutput = await callClaude(anthropicKey!, systemPrompt, userPrompt);
    }

    parsedOutput = parsedOutput.trim();
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(parsedOutput);
    } catch (e) {
      console.warn("Failed to parse directly as JSON, cleaning markdown codeblock");
      const cleanString = parsedOutput.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedQuestions = JSON.parse(cleanString);
    }

    if (!Array.isArray(parsedQuestions)) {
      throw new Error("Output was not a JSON array.");
    }

    const insertedQuestions = [];
    const duplicateQuestionsCount = 0;
    let skippedCount = 0;

    for (const q of parsedQuestions) {
      const qText = q.question_text || '';
      if (!qText.trim()) continue;

      let embedding: number[] | null = null;
      if (geminiKey) {
        // Generate embedding for duplicate detection
        embedding = await getEmbedding(geminiKey, qText);
      }

      // Check for duplicates if embedding exists
      if (embedding) {
        const { data: matches, error: matchError } = await supabaseClient.rpc('match_questions', {
          query_embedding: embedding,
          match_threshold: 0.95,
          match_count: 1
        });

        if (!matchError && matches && matches.length > 0) {
          console.log(`Duplicate question detected: "${qText.substring(0, 50)}...". Skipping.`);
          skippedCount++;
          continue;
        }
      }

      // Reformat options array to A/B/C/D JSON object
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

      // Prepare question row payload
      const payload = {
        pdf_source_id: pdfSourceId || null,
        question_type: q.question_type || 'MCQ',
        question_text: qText,
        options: optionsObj,
        correct_answer: q.correct_answer || q.correct_option || '',
        explanation: q.explanation || '',
        is_ai_generated: false,
        embedding: embedding,
        attempts_count: 0,
        correct_count: 0,
        avg_time_taken: q.avg_time_seconds || 120,
        difficulty_score: q.difficulty === 'easy' ? 25.0 : q.difficulty === 'hard' ? 75.0 : 50.0,
        concept_depth: q.concept_depth || 1,
        multi_concept_level: q.multi_concept_level || 1,
        calculation_intensity: q.calculation_intensity || 1,
        trickiness_score: q.trickiness_score || 1,
        verification_status: 'APPROVED', // PDFs are our gold standard verified sources
        is_verified: true,
        subject: q.subject || subject || '',
        difficulty: q.difficulty || 'medium',
        exam_type: q.exam || exam || 'JEE_MAINS',
        // Legacy column fallbacks
        chapter_id: q.chapter || '',
        subchapter_id: q.subtopic || '',
        concept_tested: q.concept || (q.concept_tags ? q.concept_tags[0] : 'General'),
        source: source
      };

      const { data: dbData, error: dbError } = await supabaseClient
        .from('questions')
        .insert(payload)
        .select()
        .single();

      if (dbError) {
        console.error("Failed to insert question:", dbError);
        continue;
      }

      // Add concept tags
      const tags = q.concept_tags || [];
      if (dbData && tags.length > 0) {
        const tagPayload = tags.map((t: string) => ({
          question_id: dbData.id,
          tag: t.trim()
        }));

        const { error: tagError } = await supabaseClient
          .from('question_tags')
          .insert(tagPayload);

        if (tagError) {
          console.error("Failed to insert concept tags:", tagError);
        }
      }

      insertedQuestions.push(dbData);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: insertedQuestions.length, 
      skipped: skippedCount,
      data: insertedQuestions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
