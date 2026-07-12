import { supabase } from '@/integrations/supabase/client';
import { UnifiedQuestion, getOfflineQuestions, EMERGENCY_QUESTIONS } from '@/data/offlineQuestionBank';
import { getCachedQuestions, setCachedQuestions, generateCacheKey } from './questionCache';
import { buildDeterministicSession, SessionDiagnostics } from './sessionBuilder';
import { resolveTopicCatalogEntry } from './topicCatalog';
import { getAdaptiveConceptSelection } from './studentIntelligence';

export interface QuestionGeneratorParams {
  exam: string;
  subject: string;
  chapter: string;
  chapterId?: string;
  subchapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  variantOf?: string;
  excludeQuestionIds?: string[];
  /**
   * Per-chapter question cap derived from the student's subscription tier.
   * Set by useQuestionEntitlement.getLimit() before calling generateQuestions.
   * If not provided, the edge function defaults to its own safe limit.
   */
  chapterQuestionLimit?: number;
}

export interface TelemetryEvent {
  timestamp: number;
  question_generation_mode: 'ai' | 'offline' | 'recovery';
  question_generation_time: number;
  fallback_reason?: string;
  chapter_requested: string;
  difficulty_requested: string;
}

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

function mapDbToUnified(qbItem: any, difficulty: string): UnifiedQuestion {
  const optionsObj = qbItem.options || qbItem.content?.options || {
    A: qbItem.option_a || '',
    B: qbItem.option_b || '',
    C: qbItem.option_c || '',
    D: qbItem.option_d || ''
  };

  const ans = qbItem.answer || qbItem.correct_option || qbItem.correct_answer || 'A';
  const diffScore = qbItem.difficulty_score || (difficulty === 'easy' ? 3.0 : difficulty === 'hard' ? 8.0 : 5.5);
  const coverage = qbItem.concept_coverage || 0.85;
  const relevance = qbItem.jee_relevance_score || 9.0;

  return {
    id: qbItem.id || qbItem.question_id || `db-${(qbItem.question_text || '').slice(0, 50).replace(/[^a-z0-9]/gi, '')}`,
    question_id: qbItem.id || qbItem.question_id,
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
    jeeRelevanceScore: relevance,
    option_misconceptions: qbItem.metadata?.option_misconceptions || qbItem.option_misconceptions,
    source_pattern: qbItem.metadata?.source_pattern || qbItem.source_pattern
  };
}

export async function generateQuestions(
  params: QuestionGeneratorParams
): Promise<{
  questions: UnifiedQuestion[];
  generationMode: 'ai' | 'offline' | 'recovery';
  diagnostics?: SessionDiagnostics;
}> {
  const startTime = Date.now();
  const cacheKey = generateCacheKey(params.exam, params.subject, params.chapter, params.difficulty);
  const errors: string[] = [];

  const catalogEntry = resolveTopicCatalogEntry(params.chapter);
  const targetConcepts = getAdaptiveConceptSelection(catalogEntry.concepts, params.count);

  const tryBuild = (pool: UnifiedQuestion[], mode: 'ai' | 'offline' | 'recovery') => {
    try {
      const sortedPool = [...pool].sort((a, b) => {
        const aIndex = targetConcepts.indexOf(a.concept_tested);
        const bIndex = targetConcepts.indexOf(b.concept_tested);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });

      const sessionRes = buildDeterministicSession(sortedPool, {
        chapter: params.chapter,
        difficulty: params.difficulty,
        count: params.count,
        requestedSubject: params.subject,
        requestedChapter: params.chapter,
      });
      return {
        questions: sessionRes.questions,
        generationMode: mode,
        diagnostics: sessionRes.diagnostics
      };
    } catch (e: any) {
      console.warn(`[Self-Healing Recovery] Audit failed for source "${mode}":`, e.message);
      errors.push(`${mode.toUpperCase()}: ${e.message}`);
      return null;
    }
  };

  // TIER 1: LIVE AI EDGE FUNCTION (Handles DB Cache + AI Gen)
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: {
        examMode: params.exam,
        subject: params.subject,
        chapterId: params.chapterId || params.chapter,
        chapterName: params.chapter,
        subchapterId: params.subchapter,
        subchapterName: params.chapter,
        difficulty: params.difficulty,
        count: params.count,
        excludeQuestionIds: params.excludeQuestionIds,
        // Subscription-based per-chapter limit: enforces balanced entitlement
        chapterQuestionLimit: params.chapterQuestionLimit,
      }
    });

    if (error) throw error;
    if (data && data.questions && data.questions.length > 0) {
      const unifiedList = data.questions.map((q: any) => mapDbToUnified(q, params.difficulty));
      const built = tryBuild(unifiedList, 'ai');
      if (built) {
        console.log('[QuestionGenerator] Live AI Edge Function Hit & Audited successfully!');
        setCachedQuestions(cacheKey, unifiedList);
        logTelemetry({ timestamp: Date.now(), question_generation_mode: 'ai', question_generation_time: Date.now() - startTime, chapter_requested: params.chapter, difficulty_requested: params.difficulty });
        return built;
      }
    }
  } catch (err: any) {
    console.warn('[QuestionGenerator] Edge Function Failed:', err.message || err);
    errors.push(`EDGE_FUNCTION: ${err.message}`);
  }

  // TIER 2: CHECK LOCAL CACHE
  const cached = getCachedQuestions(cacheKey);
  if (cached && cached.length >= params.count) {
    const excludes = params.excludeQuestionIds || [];
    let filteredCached = cached.filter(q => !excludes.includes(q.id));
    if (filteredCached.length < params.count) {
      filteredCached = [...filteredCached, ...cached.filter(q => excludes.includes(q.id))];
    }
    const built = tryBuild(filteredCached, 'ai');
    if (built) {
      console.log('[QuestionGenerator] Local Cache Hit & Audited successfully!');
      return built;
    }
  }

  // TIER 3: SMART OFFLINE QUESTION BANK
  try {
    const offlineQuestions = getOfflineQuestions(params.subject, params.chapterId || params.chapter, params.difficulty, params.count * 3);
    const built = tryBuild(offlineQuestions, 'offline');
    if (built) {
      console.log('[QuestionGenerator] Smart Offline Bank succeeded & Audited!');
      logTelemetry({ timestamp: Date.now(), question_generation_mode: 'offline', question_generation_time: Date.now() - startTime, chapter_requested: params.chapter, difficulty_requested: params.difficulty, fallback_reason: errors.join(', ') });
      return built;
    }
  } catch (offlineErr: any) {
    console.warn('[QuestionGenerator] Offline Bank failed:', offlineErr.message);
  }

  // TIER 4: EMERGENCY QUESTION PACK
  console.error(`[QuestionGenerator] All tiers failed for "${params.chapter}". Falling back to emergency.`);
  const rawEmergency = EMERGENCY_QUESTIONS.slice(0, params.count).map((eq, i) => ({
    ...eq,
    id: `raw-emergency-${eq.id}-${Date.now()}-${i}`,
    question_id: `raw-emergency-${eq.question_id}-${Date.now()}-${i}`
  }));
  
  logTelemetry({ timestamp: Date.now(), question_generation_mode: 'recovery', question_generation_time: Date.now() - startTime, chapter_requested: params.chapter, difficulty_requested: params.difficulty, fallback_reason: 'All tiers failed' });
  
  return { questions: rawEmergency, generationMode: 'recovery' };
}
