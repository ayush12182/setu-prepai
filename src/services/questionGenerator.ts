import { supabase } from '@/integrations/supabase/client';
import { UnifiedQuestion, getOfflineQuestions, EMERGENCY_QUESTIONS } from '@/data/offlineQuestionBank';
import { getCachedQuestions, setCachedQuestions, generateCacheKey } from './questionCache';
import { checkAIAvailability } from '@/utils/aiAvailability';

export interface QuestionGeneratorParams {
  exam: string;             // e.g. 'JEE', 'JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUET'
  subject: string;          // e.g. 'Physics', 'Chemistry', 'Mathematics', 'Biology'
  chapter: string;          // e.g. 'Electrostatics'
  subchapter?: string;      // e.g. 'Coulomb\'s Law'
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  variantOf?: string;       // For adaptive variant generation
}

export interface TelemetryEvent {
  timestamp: number;
  question_generation_mode: 'ai' | 'offline' | 'recovery';
  question_generation_time: number; // in ms
  fallback_reason?: string;
  chapter_requested: string;
  difficulty_requested: string;
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Save telemetry event to localStorage
function logTelemetry(event: TelemetryEvent) {
  try {
    const logsStr = localStorage.getItem('prepentrance-telemetry-log') || '[]';
    const logs = JSON.parse(logsStr);
    logs.push(event);
    localStorage.setItem('prepentrance-telemetry-log', JSON.stringify(logs));
    console.log('[Telemetry Logged]', event);
  } catch (e) {
    console.error('Failed to log telemetry:', e);
  }
}

// Map database question to our UnifiedQuestion interface
function mapDbToUnified(qbItem: any, difficulty: string): UnifiedQuestion {
  const optionsObj = qbItem.content?.options || {
    A: qbItem.option_a || '',
    B: qbItem.option_b || '',
    C: qbItem.option_c || '',
    D: qbItem.option_d || ''
  };

  const ans = qbItem.answer || qbItem.correct_option || qbItem.correct_answer || 'A';

  // Quality scoring fallback calculation (deterministic)
  const diffScore = qbItem.difficulty_score || (difficulty === 'easy' ? 3.0 : difficulty === 'hard' ? 8.0 : 5.5);
  const coverage = qbItem.concept_coverage || 0.85;
  const relevance = qbItem.jee_relevance_score || 9.0;

  return {
    id: qbItem.id,
    question_id: qbItem.id,
    node_id: qbItem.chapter_id || qbItem.topic_id || 'db',
    type: qbItem.question_type || 'MCQ',
    exam_type: qbItem.exam_type || 'JEE',
    difficulty: (qbItem.difficulty || difficulty).toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: qbItem.content?.question || qbItem.question_text,
    options: optionsObj,
    option_a: optionsObj.A,
    option_b: optionsObj.B,
    option_c: optionsObj.C,
    option_d: optionsObj.D,
    answer: ans,
    correct_option: ans,
    correct_answer: ans,
    explanation: qbItem.metadata?.explanation || qbItem.explanation || qbItem.explanation_text || '',
    explanation_text: qbItem.metadata?.explanation || qbItem.explanation || qbItem.explanation_text || '',
    concept_tested: qbItem.metadata?.concept || qbItem.concept_tested || 'General',
    common_mistake: qbItem.metadata?.common_mistake || qbItem.common_mistake,
    is_verified: qbItem.is_verified || qbItem.verification_status === 'APPROVED',
    generation_model: qbItem.metadata?.model || qbItem.generation_model || 'Supabase DB',
    is_variant: qbItem.is_variant || false,
    parent_question_id: qbItem.parent_question_id || null,
    difficultyScore: diffScore,
    conceptCoverage: coverage,
    jeeRelevanceScore: relevance
  };
}

// Generate questions using direct Gemini call
async function directGeminiGenerate(
  params: QuestionGeneratorParams,
  timeoutMs: number
): Promise<UnifiedQuestion[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not configured');

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const prompt = `You are a legendary JEE exam question setter. Generate exactly ${params.count} questions on the topic "${params.chapter}" (subtopic: "${params.subchapter || 'any'}").
Difficulty level required: ${params.difficulty}.
Return ONLY a valid JSON object matching this TypeScript structure:
{
  "questions": Array<{
    "question_text": string,
    "option_a": string,
    "option_b": string,
    "option_c": string,
    "option_d": string,
    "correct_option": "A" | "B" | "C" | "D",
    "explanation": string,
    "concept_tested": string,
    "difficulty_score": number, // decimal 1.0 - 10.0
    "concept_coverage": number, // decimal 0.0 - 1.0
    "relevance_score": number // decimal 1.0 - 10.0
  }>
}
Return ONLY JSON, no markdown formatting blocks, no extra text.`;

  try {
    const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, response_mime_type: 'application/json' },
      }),
      signal: controller.signal
    });

    clearTimeout(id);
    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);

    const raw = await res.json();
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response candidate from Gemini');

    const parsed = JSON.parse(text.trim());
    const qs = parsed.questions || [];

    return qs.map((q: any, i: number) => {
      const optionsObj = {
        A: q.option_a || '',
        B: q.option_b || '',
        C: q.option_c || '',
        D: q.option_d || ''
      };
      const ans = q.correct_option || 'A';
      return {
        id: `gemini-${Date.now()}-${i}`,
        question_id: `gemini-${Date.now()}-${i}`,
        node_id: params.chapter,
        type: 'MCQ',
        exam_type: params.exam,
        difficulty: params.difficulty,
        question_text: q.question_text,
        options: optionsObj,
        option_a: optionsObj.A,
        option_b: optionsObj.B,
        option_c: optionsObj.C,
        option_d: optionsObj.D,
        answer: ans,
        correct_option: ans,
        correct_answer: ans,
        explanation: q.explanation || '',
        explanation_text: q.explanation || '',
        concept_tested: q.concept_tested || params.chapter,
        is_variant: i > 0,
        parent_question_id: null,
        difficultyScore: q.difficulty_score || (params.difficulty === 'easy' ? 3.0 : params.difficulty === 'hard' ? 8.0 : 5.5),
        conceptCoverage: q.concept_coverage || 0.85,
        jeeRelevanceScore: q.relevance_score || 9.2
      };
    });
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Main generation function with fallbacks
export async function generateQuestions(
  params: QuestionGeneratorParams
): Promise<{
  questions: UnifiedQuestion[];
  generationMode: 'ai' | 'offline' | 'recovery';
}> {
  const startTime = Date.now();
  const cacheKey = generateCacheKey(params.exam, params.subject, params.chapter, params.difficulty);

  // 1. CHECK LOCAL CACHE (TTL 24 hours)
  const cached = getCachedQuestions(cacheKey);
  if (cached && cached.length >= params.count) {
    console.log('[QuestionGenerator] Cache Hit!', cacheKey);
    const duration = Date.now() - startTime;
    logTelemetry({
      timestamp: Date.now(),
      question_generation_mode: 'ai',
      question_generation_time: duration,
      chapter_requested: params.chapter,
      difficulty_requested: params.difficulty
    });
    return {
      questions: cached.slice(0, params.count),
      generationMode: 'ai'
    };
  }

  // 2. LEVEL 1: QUERY SUPABASE DB
  try {
    const examUpper = params.exam.toUpperCase();
    let examTypes = [examUpper];
    if (examUpper === 'JEE') {
      examTypes = ['JEE_MAINS', 'JEE_ADVANCED'];
    }

    const { data: dbData, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .in('exam_type', examTypes)
      .or(`chapter_id.eq."${params.chapter}",subchapter_id.eq."${params.chapter}",concept_tested.eq."${params.chapter}"`);

    if (!dbError && dbData && dbData.length >= params.count) {
      console.log('[QuestionGenerator] Supabase DB Hit!');
      const unifiedList = dbData.map(q => mapDbToUnified(q, params.difficulty));
      
      // Store in cache for next time
      setCachedQuestions(cacheKey, unifiedList);
      
      const duration = Date.now() - startTime;
      logTelemetry({
        timestamp: Date.now(),
        question_generation_mode: 'ai',
        question_generation_time: duration,
        chapter_requested: params.chapter,
        difficulty_requested: params.difficulty
      });

      return {
        questions: unifiedList.slice(0, params.count),
        generationMode: 'ai'
      };
    }
  } catch (dbErr) {
    console.warn('[QuestionGenerator] Supabase DB query failed:', dbErr);
  }

  // 3. LEVEL 2: CALL EDGE FUNCTION / GEMINI API WITH 12-SECOND TIMEOUT
  const timeoutMs = 12000;
  const isAI = await checkAIAvailability();

  if (isAI.available) {
    // Try Edge Function first
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Choose appropriate function: generate-questions or generate-question
      const functionName = params.count === 1 ? 'generate-question' : 'generate-questions';
      
      const requestBody = params.count === 1 ? {
        exam: params.exam,
        subject: params.subject,
        topic: params.chapter,
        subtopic: params.subchapter || params.chapter,
        difficulty: params.difficulty,
        variant_of_question_id: params.variantOf
      } : {
        examMode: params.exam,
        subject: params.subject,
        chapterName: params.chapter,
        subchapterName: params.subchapter || params.chapter,
        difficulty: params.difficulty,
        count: params.count
      };

      const { data, error: fnError } = await supabase.functions.invoke(functionName, {
        body: requestBody,
        headers: {
          // Pass signal in options if possible, though supabase-js invokes usually don't support signal in options directly
        }
      });

      clearTimeout(id);

      if (!fnError && data) {
        let rawQuestions: any[] = [];
        if (params.count === 1 && data.question) {
          rawQuestions = [data.question];
        } else if (data.questions) {
          rawQuestions = data.questions;
        }

        if (rawQuestions.length > 0) {
          console.log('[QuestionGenerator] Supabase Edge Function succeeded!');
          const unifiedList = rawQuestions.map(q => mapDbToUnified(q, params.difficulty));
          setCachedQuestions(cacheKey, unifiedList);

          const duration = Date.now() - startTime;
          logTelemetry({
            timestamp: Date.now(),
            question_generation_mode: 'ai',
            question_generation_time: duration,
            chapter_requested: params.chapter,
            difficulty_requested: params.difficulty
          });

          return {
            questions: unifiedList.slice(0, params.count),
            generationMode: 'ai'
          };
        }
      }
      throw new Error(fnError?.message || 'Edge Function returned empty response');
    } catch (fnErr: any) {
      clearTimeout(id);
      console.warn('[QuestionGenerator] Supabase Edge Function failed, falling back to direct Gemini call:', fnErr);

      // Try Direct Gemini Call (as backup AI tier)
      try {
        const remainingTime = Math.max(3000, timeoutMs - (Date.now() - startTime));
        const geminiQs = await directGeminiGenerate(params, remainingTime);
        if (geminiQs.length >= params.count) {
          console.log('[QuestionGenerator] Direct Gemini API succeeded!');
          setCachedQuestions(cacheKey, geminiQs);

          const duration = Date.now() - startTime;
          logTelemetry({
            timestamp: Date.now(),
            question_generation_mode: 'ai',
            question_generation_time: duration,
            chapter_requested: params.chapter,
            difficulty_requested: params.difficulty
          });

          return {
            questions: geminiQs,
            generationMode: 'ai'
          };
        }
      } catch (geminiErr: any) {
        console.warn('[QuestionGenerator] Direct Gemini API failed:', geminiErr);
      }
    }
  }

  // 4. LEVEL 3: SMART OFFLINE QUESTION BANK
  console.log('[QuestionGenerator] Remote services unavailable/timed out. Falling back to Smart Offline Question Bank.');
  try {
    const offlineQuestions = getOfflineQuestions(params.subject, params.chapter, params.difficulty, params.count);
    
    const duration = Date.now() - startTime;
    logTelemetry({
      timestamp: Date.now(),
      question_generation_mode: 'offline',
      question_generation_time: duration,
      fallback_reason: isAI.reason || 'AI services timeout / exception',
      chapter_requested: params.chapter,
      difficulty_requested: params.difficulty
    });

    return {
      questions: offlineQuestions,
      generationMode: 'offline'
    };
  } catch (offlineErr) {
    console.error('[QuestionGenerator] Critical: Smart Offline Question Bank crashed:', offlineErr);
  }

  // 5. LEVEL 4: EMERGENCY QUESTION PACK
  console.warn('[QuestionGenerator] Emergency! Service and Offline Bank failed. Returning static Emergency Question Pack.');
  const duration = Date.now() - startTime;
  logTelemetry({
    timestamp: Date.now(),
    question_generation_mode: 'recovery',
    question_generation_time: duration,
    fallback_reason: 'Offline bank code execution crashed',
    chapter_requested: params.chapter,
    difficulty_requested: params.difficulty
  });

  return {
    questions: EMERGENCY_QUESTIONS.map((eq, i) => ({
      ...eq,
      id: `${eq.id}-${Date.now()}-${i}`,
      question_id: `${eq.question_id}-${Date.now()}-${i}`
    })).slice(0, params.count),
    generationMode: 'recovery'
  };
}
