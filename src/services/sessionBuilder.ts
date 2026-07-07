import { UnifiedQuestion, EMERGENCY_QUESTIONS } from '../data/offlineQuestionBank';

export interface SessionConfig {
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  count: number;
  /** The subject requested for this session (e.g. 'Physics', 'Chemistry', 'Mathematics') */
  requestedSubject?: string;
  /** The top-level chapter requested (e.g. 'Electrostatics') */
  requestedChapter?: string;
}

export interface SessionDiagnostics {
  totalGenerated: number;
  rejectedDuplicates: number;
  rejectedLowQuality: number;
  /** NEW: count of questions rejected because subject/chapter didn't match the request */
  rejectedSubjectMismatch: number;
  conceptCoverage: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  finalAccepted: number;
  topicRelevance: number;
  duplicateRate: number;
  coverageRatio: number;
  templateDiversityScore?: number;
  /** Fidelity report for runtime monitoring */
  fidelityReport?: FidelityReport;
}

/** Per-question fidelity log entry */
export interface FidelityLogEntry {
  question_id: string;
  question_text_snippet: string;
  concept_tested: string;
  node_id: string;
  requested_subject: string;
  requested_chapter: string;
  decision: 'ACCEPTED' | 'REJECTED_SUBJECT_MISMATCH' | 'REJECTED_DUPLICATE' | 'REJECTED_LOW_QUALITY' | 'REJECTED_TOPIC_MISMATCH';
  reject_reason?: string;
}

export interface FidelityReport {
  requested_subject: string;
  requested_chapter: string;
  total_in_pool: number;
  total_accepted: number;
  subject_match_rate: number;
  chapter_match_rate: number;
  topic_match_rate: number;
  entries: FidelityLogEntry[];
}

export interface SessionResult {
  questions: UnifiedQuestion[];
  diagnostics: SessionDiagnostics;
}

// Normalized hash of question text (replaces numbers, variable names, and units for structural template detection)
export function getQuestionTextHash(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    // Strip prefix markers
    .replace(/\[question\s*#\d+\]/gi, '')
    .replace(/\([a-z0-9]+\)/gi, '')
    // Replace numbers (decimals, scientific notations, integers)
    .replace(/\b\d+(\.\d+)?(e[-+]?\d+)?\b/gi, '#')
    .replace(/\d+/g, '#')
    // Normalize units
    .replace(/\b(m\/s\^2|m\/s|m|kg|n|ohms?|µc|c|cm|seconds?|s|hours?|h|km\/h|km|v|ev|joules?|watts?|percentage|%)\b/gi, '[unit]')
    // Normalize standard JEE parameters / variables mapping
    .replace(/mapped\s*to\s*\{[^}]*\}/gi, 'mapped to [vars]')
    .replace(/formula\s*y\s*=\s*f\(x\)_\d+/gi, 'formula y = f(x)_[id]')
    .replace(/[a-z]\s*=\s*#\s*[a-z]*/gi, '')
    // Remove all punctuation and spaces
    .replace(/[^a-z[\]]+/gi, '')
    .trim();
}


import { resolveTopicCatalogEntry, validateTopicMatch, UNIVERSAL_TOPIC_CATALOG } from './topicCatalog';

// JEE/NEET Quality Validator
export function validateQuestion(q: UnifiedQuestion): { valid: boolean; reason?: string } {
  const text = q.question_text || '';

  // 1. Length check
  if (text.length < 60) {
    return { valid: false, reason: 'Question text too short (under 60 characters)' };
  }

  const lowerText = text.toLowerCase();

  // 2. Reject trivial/textbook-style formula questions
  const trivialPatterns = [
    /find acceleration if/i,
    /calculate force/i,
    /what is the speed of/i,
    /find velocity if/i,
    /calculate mass/i,
    /find the force/i,
    /if force is.*and mass is/i,
    /if mass is.*and force is/i,
    /is defined as/i
  ];
  for (const pat of trivialPatterns) {
    if (pat.test(lowerText)) {
      return { valid: false, reason: 'Trivial direct formula pattern' };
    }
  }

  // 3. Trivial arithmetic checks
  const trivialArithmeticPattern = /\b\d+\s*(?:n|kg|m\/s|m)\b.*\b\d+\s*(?:n|kg|m\/s|m)\b/i;
  if (trivialArithmeticPattern.test(lowerText) && (lowerText.includes('find') || lowerText.includes('calculate')) && text.length < 100) {
    if (lowerText.includes('acceleration') || lowerText.includes('velocity') || lowerText.includes('force') || lowerText.includes('mass')) {
      return { valid: false, reason: 'Trivial arithmetic scenario' };
    }
  }

  // 4. Ambiguous wording or broken placeholders
  if (lowerText.includes('none of the above') && lowerText.includes('all of the above')) {
    return { valid: false, reason: 'Ambiguous or conflicting option phrasing' };
  }
  if (!text.trim().endsWith('?') && !text.trim().endsWith('.') && !text.trim().endsWith(':')) {
    return { valid: false, reason: 'Incomplete or unpunctuated question text' };
  }

  // 5. Units presence check (most physics/chemistry questions need units)
  const unitPatterns = [
    /\bN\b/i, /\bkg\b/i, /\bm\/s\b/i, /\bm\/s\^2\b/i, /\bcm\b/i, /\bg\b/i,
    /\bmoles\b/i, /\bM\b/i, /\bF\b/i, /\bV\b/i, /\bT\b/i, /\beV\b/i, /\bomega\b/i,
    /\bpercent\b/i, /%/, /\bamp\b/i, /\bohms?\b/i, /\bjoules?\b/i, /\bwatt\b/i,
    /\bkm\/h\b/i, /\bs\b/i, /\bseconds?\b/i, /\bkm\b/i
  ];
  const hasUnits = unitPatterns.some(pat => pat.test(text));
  const isMathTopic = lowerText.includes('matrix') || lowerText.includes('determinant') || lowerText.includes('limit') || lowerText.includes('integral') || lowerText.includes('derivative') || lowerText.includes('tangent') || lowerText.includes('vector') || lowerText.includes('relations') || lowerText.includes('complex') || lowerText.includes('domain') || lowerText.includes('function') || lowerText.includes('matrices');

  if (!hasUnits && !isMathTopic) {
    return { valid: false, reason: 'Missing standard unit annotations' };
  }

  // 6. Options validity
  if (!q.options || Object.keys(q.options).length < 4) {
    return { valid: false, reason: 'Missing options structure' };
  }
  const optionValues = Object.values(q.options);
  if (new Set(optionValues).size !== optionValues.length) {
    return { valid: false, reason: 'Duplicate options' };
  }
  const ansStr = String(q.answer || q.correct_option || '').toUpperCase();
  if (ansStr !== 'A' && ansStr !== 'B' && ansStr !== 'C' && ansStr !== 'D') {
    return { valid: false, reason: 'Invalid or missing answer key' };
  }

  // 7. Generic LLM Output
  if (text.includes('```') || text.includes('Here is a') || text.includes('Sure!') || text.includes('[insert') || text.includes('[value]')) {
    return { valid: false, reason: 'Looks like raw or conversational LLM output template' };
  }

  // 8. Independent Validator Layer Verification (P0 CHECKS 1-11)
  if (q.id && (q.id.startsWith('gemini-') || q.is_valid_pipeline !== undefined)) {
    if (q.is_valid_pipeline === false) {
      return { valid: false, reason: `Independent validation failed: ${q.validation_reason || 'Pipeline validation check failed'}` };
    }

    if (q.faculty_review) {
      if (q.faculty_review.overall_score < 8) {
        return { valid: false, reason: `Faculty Review Score too low (${q.faculty_review.overall_score} < 8)` };
      }
      if (q.faculty_review.jee_authenticity < 8) {
        return { valid: false, reason: `JEE Authenticity Score too low (${q.faculty_review.jee_authenticity} < 8)` };
      }
      if (q.faculty_review.data_sufficiency < 8) {
        return { valid: false, reason: `Data Sufficiency / Solvability score too low (${q.faculty_review.data_sufficiency} < 8)` };
      }
    }

    // CHECK 1: Units Check
    if (q.target_quantity_units) {
      const correctOptionText = (q.options as any)[q.correct_option || 'A'] || '';
      const cleanUnits = q.target_quantity_units.toLowerCase().replace(/\\/g, '').trim();
      const cleanCorrect = correctOptionText.toLowerCase().replace(/\\/g, '').trim();
      
      const unitTokens = cleanUnits.split(/[^a-z0-9%/\^]/).filter(t => t.length > 0);
      const missingUnit = unitTokens.some(token => {
        if (token === 'mu' || token === 'c' || token === 'm' || token === 's' || token === 'kg' || token === 'n' || token === 'ev' || token === 'moles') {
          return !cleanCorrect.includes(token);
        }
        return false;
      });
      if (missingUnit) {
        return { valid: false, reason: `Units Check failed: Correct answer option "${correctOptionText}" does not carry correct units "${q.target_quantity_units}"` };
      }
    }

    // CHECK 2: Quantity Consistency
    if (q.target_quantity_units && q.options) {
      const cleanUnits = q.target_quantity_units.toLowerCase().replace(/\\/g, '').trim();
      const unitTokens = cleanUnits.split(/[^a-z0-9%/\^]/).filter(t => t.length > 0);
      const wrongOptionUnits = Object.values(q.options).some(optVal => {
        const lowerVal = String(optVal).toLowerCase();
        return unitTokens.some(token => {
          if (token === 'mu' || token === 'c' || token === 'm' || token === 's' || token === 'kg' || token === 'n' || token === 'ev' || token === 'moles') {
            return !lowerVal.includes(token);
          }
          return false;
        });
      });
      if (wrongOptionUnits) {
        return { valid: false, reason: `Quantity Consistency failed: Option values do not carry consistent units` };
      }
    }

    // CHECK 3 & 7: Explanation Match & Authenticity
    const explanationText = q.explanation || '';
    if (q.recomputed_numerical_value) {
      const cleanRecomputed = q.recomputed_numerical_value.replace(/[\$\s\{\}\\\^\(\)]/g, '').toLowerCase();
      const cleanExplanation = explanationText.replace(/[\$\s\{\}\\\^\(\)]/g, '').toLowerCase();
      if (!cleanExplanation.includes(cleanRecomputed)) {
        return { valid: false, reason: `Explanation Authenticity check failed: Explanation does not derive/contain the recomputed answer "${q.recomputed_numerical_value}"` };
      }
    }
  }

  return { valid: true };
}

// Deterministic difficulty mapping
function getTargetDifficulty(configDifficulty: string, index: number, total: number): 'easy' | 'medium' | 'hard' {
  if (total === 30) {
    if (index < 6) return 'easy';
    if (index < 21) return 'medium';
    return 'hard';
  }
  if (total === 50) {
    if (index < 10) return 'easy';
    if (index < 35) return 'medium';
    return 'hard';
  }

  const percent = index / total;
  // 20% Easy, 50% Medium (up to 70%), 30% Hard
  if (configDifficulty === 'medium' || configDifficulty === 'mixed') {
    if (percent < 0.20) return 'easy';
    if (percent < 0.70) return 'medium';
    return 'hard';
  }
  if (configDifficulty === 'hard') {
    if (percent < 0.2) return 'medium';
    if (percent < 0.7) return 'hard';
    return 'hard';
  }
  if (configDifficulty === 'easy') {
    if (percent < 0.7) return 'easy';
    return 'medium';
  }
  if (percent < 0.33) return 'easy';
  if (percent < 0.66) return 'medium';
  return 'hard';
}

// ─── Subject keyword map ──────────────────────────────────────────────────────
// Used to hard-reject questions whose text/concept belongs to a different subject.
const SUBJECT_EXCLUSION_KEYWORDS: Record<string, string[]> = {
  physics: [
    'real solutions', 'number of solutions', 'functions', 'domain', 'range',
    'matrix', 'matrices', 'determinant', 'adjoint', 'inverse matrix',
    'probability', 'permutation', 'combination', 'binomial theorem',
    'complex number', 'sequence', 'series', 'limit', 'continuity',
    'derivative', 'integral', 'integration', 'differential equation',
    'coordinate geometry', 'conic section', 'parabola', 'ellipse', 'hyperbola',
    'triangle', 'circle', 'tangent to curve', 'sets and relations',
    // Chemistry exclusions in a Physics session
    'hybridization', 'bond angle', 'molarity', 'stoichiometry',
    'organic compound', 'aldehyde', 'ketone', 'amine', 'alkane', 'alkene',
  ],
  chemistry: [
    'real solutions', 'number of solutions', 'domain', 'range',
    'matrix', 'matrices', 'determinant', 'adjoint',
    'probability', 'permutation', 'combination', 'binomial theorem',
    'complex number', 'sequence', 'series', 'limit', 'continuity',
    'derivative', 'integral', 'integration', 'differential equation',
    'coordinate geometry', 'conic section', 'parabola', 'ellipse', 'hyperbola',
    // Physics exclusions in a Chemistry session
    'projectile', 'torque', 'moment of inertia', 'angular momentum',
    'kirchhoff', 'wheatstone', 'capacitor', 'electric field', 'coulomb',
  ],
  mathematics: [
    // Physics exclusions in a Maths session
    'projectile', 'torque', 'moment of inertia', 'angular momentum',
    'kirchhoff', 'wheatstone', 'coulomb', 'electric field', 'magnetic field',
    'enthalpy', 'entropy', 'hybridization', 'bond angle', 'molarity',
    'organic compound', 'aldehyde', 'amine', 'stoichiometry',
    // Expanded physics terms
    'satellite', 'orbital velocity', 'escape velocity', 'gravitational',
    'acceleration due to gravity', 'surface gravity', 'centripetal',
    'moment of inertia', 'angular velocity', 'angular acceleration',
    'current electricity', 'resistance', 'ohms', 'voltage', 'emf',
    'capacitance', 'inductance', 'magnetic flux', 'magnetic force',
    'snells law', 'refraction', 'reflection', 'lens', 'mirror',
    'radioactivity', 'half life', 'nuclear', 'photoelectric', 'photon',
    'specific heat', 'latent heat', 'thermal conductivity',
    'spring constant', 'simple harmonic', 'damped oscillation',
    // Chemistry expanded exclusions in a Maths session
    'mole concept', 'avogadro', 'electrochemistry', 'equilibrium constant',
    'activation energy', 'arrhenius', 'coordination compound', 'ligand',
    'oxidation state', 'galvanic', 'electrolysis', 'buffer solution',
  ],
};

/**
 * Hard subject guard: returns true if the question should be REJECTED
 * because its content belongs to a different subject than what was requested.
 */
function isSubjectMismatch(q: UnifiedQuestion, requestedSubject: string): boolean {
  if (!requestedSubject) return false;
  const subjectLower = requestedSubject.toLowerCase();

  // If the question has an explicit subject field, use it as ground truth
  const qSubject = ((q as any).subject || '').toLowerCase();
  if (qSubject && !qSubject.includes(subjectLower) && !subjectLower.includes(qSubject)) {
    // Non-empty subject mismatch
    return true;
  }

  // Secondary guard: scan the question text and concept for cross-subject signals
  const text = (q.question_text || '').toLowerCase();
  const concept = (q.concept_tested || '').toLowerCase();
  const combined = text + ' ' + concept;

  const exclusions = SUBJECT_EXCLUSION_KEYWORDS[subjectLower];
  if (!exclusions) return false;

  return exclusions.some(kw => combined.includes(kw));
}

export function buildDeterministicSession(
  rawPool: UnifiedQuestion[],
  config: SessionConfig
): SessionResult {
  const requestedSubject = (config.requestedSubject || '').toLowerCase();
  const requestedChapter = config.requestedChapter || config.chapter;

  const diagnostics: SessionDiagnostics = {
    totalGenerated: rawPool.length,
    rejectedDuplicates: 0,
    rejectedLowQuality: 0,
    rejectedSubjectMismatch: 0,
    conceptCoverage: {},
    difficultyDistribution: { easy: 0, medium: 0, hard: 0 },
    finalAccepted: 0,
    topicRelevance: 0,
    duplicateRate: 0,
    coverageRatio: 0,
    templateDiversityScore: 100
  };

  // ── Runtime Fidelity Log ──────────────────────────────────────────────────
  const fidelityEntries: FidelityLogEntry[] = [];

  const validatedPool: UnifiedQuestion[] = [];
  const hashCounts = new Map<string, number>();
  const usedIds = new Set<string>();
  const conceptCounts: Record<string, number> = {};

  const catalogEntry = resolveTopicCatalogEntry(config.chapter);
  const maxPerConcept = Math.max(2, Math.ceil(config.count / Math.max(1, catalogEntry.concepts.length)), Math.ceil(config.count * 0.20));

  // Determine maximum frequency per template based on target session count:
  // - For 30 questions: max 1.
  // - For 50 questions: max 2.
  // - For 100 questions: max 5% of total questions.
  let maxAllowedPerTemplate = 1;
  if (config.count > 50) {
    maxAllowedPerTemplate = Math.max(2, Math.floor(config.count * 0.05));
  } else if (config.count > 30) {
    maxAllowedPerTemplate = 2;
  } else {
    maxAllowedPerTemplate = 1;
  }

  for (const q of rawPool) {
    const snippet = (q.question_text || '').slice(0, 80);

    if (usedIds.has(q.id)) {
      diagnostics.rejectedDuplicates++;
      fidelityEntries.push({
        question_id: q.id,
        question_text_snippet: snippet,
        concept_tested: q.concept_tested || '',
        node_id: q.node_id || '',
        requested_subject: requestedSubject,
        requested_chapter: requestedChapter,
        decision: 'REJECTED_DUPLICATE',
        reject_reason: 'Duplicate ID'
      });
      continue;
    }

    // ── P0 HARD SUBJECT GUARD ─────────────────────────────────────────────
    if (requestedSubject && isSubjectMismatch(q, requestedSubject)) {
      diagnostics.rejectedSubjectMismatch++;
      fidelityEntries.push({
        question_id: q.id,
        question_text_snippet: snippet,
        concept_tested: q.concept_tested || '',
        node_id: q.node_id || '',
        requested_subject: requestedSubject,
        requested_chapter: requestedChapter,
        decision: 'REJECTED_SUBJECT_MISMATCH',
        reject_reason: `Subject mismatch: content does not belong to ${requestedSubject}`
      });
      console.warn(`[FidelityGuard] REJECTED cross-subject question in ${requestedSubject} session: "${snippet}..." (concept: ${q.concept_tested})`);
      continue;
    }

    if (!q.is_verified) {
      const validation = validateQuestion(q);
      if (!validation.valid) {
        diagnostics.rejectedLowQuality++;
        fidelityEntries.push({
          question_id: q.id,
          question_text_snippet: snippet,
          concept_tested: q.concept_tested || '',
          node_id: q.node_id || '',
          requested_subject: requestedSubject,
          requested_chapter: requestedChapter,
          decision: 'REJECTED_LOW_QUALITY',
          reject_reason: validation.reason
        });
        continue;
      }
    }

    const topicMatch = validateTopicMatch(q, config.chapter);
    if (!topicMatch.matches) {
      fidelityEntries.push({
        question_id: q.id,
        question_text_snippet: snippet,
        concept_tested: q.concept_tested || '',
        node_id: q.node_id || '',
        requested_subject: requestedSubject,
        requested_chapter: requestedChapter,
        decision: 'REJECTED_TOPIC_MISMATCH',
        reject_reason: `Topic mismatch for chapter: ${config.chapter}`
      });
      continue;
    }

    const hash = getQuestionTextHash(q.question_text);
    const hashCount = hashCounts.get(hash) || 0;
    if (hashCount >= maxAllowedPerTemplate) {
      diagnostics.rejectedDuplicates++;
      fidelityEntries.push({
        question_id: q.id,
        question_text_snippet: snippet,
        concept_tested: q.concept_tested || '',
        node_id: q.node_id || '',
        requested_subject: requestedSubject,
        requested_chapter: requestedChapter,
        decision: 'REJECTED_DUPLICATE',
        reject_reason: 'Template hash limit reached'
      });
      continue;
    }

    const concept = q.concept_tested || 'General';
    const currentConceptCount = conceptCounts[concept] || 0;
    if (currentConceptCount >= maxPerConcept) {
      continue;
    }

    validatedPool.push(q);
    usedIds.add(q.id);
    hashCounts.set(hash, hashCount + 1);
    conceptCounts[concept] = currentConceptCount + 1;
    fidelityEntries.push({
      question_id: q.id,
      question_text_snippet: snippet,
      concept_tested: q.concept_tested || '',
      node_id: q.node_id || '',
      requested_subject: requestedSubject,
      requested_chapter: requestedChapter,
      decision: 'ACCEPTED'
    });
  }

  diagnostics.duplicateRate = Number(((diagnostics.rejectedDuplicates / rawPool.length) * 100).toFixed(1));

  const easyBucket = validatedPool.filter(q => q.difficulty === 'easy');
  const mediumBucket = validatedPool.filter(q => q.difficulty === 'medium');
  const hardBucket = validatedPool.filter(q => q.difficulty === 'hard');

  const popQuestionFromBucket = (targetDiff: 'easy' | 'medium' | 'hard'): UnifiedQuestion | null => {
    let q: UnifiedQuestion | undefined;
    if (targetDiff === 'easy') {
      q = easyBucket.shift() || mediumBucket.shift() || hardBucket.shift();
    } else if (targetDiff === 'medium') {
      q = mediumBucket.shift() || hardBucket.shift() || easyBucket.shift();
    } else {
      q = hardBucket.shift() || mediumBucket.shift() || easyBucket.shift();
    }
    return q || null;
  };

  const finalQuestions: UnifiedQuestion[] = [];
  
  for (let idx = 0; idx < config.count; idx++) {
    const assignedDiff = getTargetDifficulty(config.difficulty, idx, config.count);
    const question = popQuestionFromBucket(assignedDiff);
    if (question) {
      diagnostics.difficultyDistribution[assignedDiff]++;
      finalQuestions.push({
        ...question,
        difficulty: assignedDiff
      });
    }
  }

  // ── P0 Fallback Padding ───────────────────────────────────────────────────
  // HARD RULE: Only pad with questions that pass the subject guard.
  // Never serve a question from a different subject, even as emergency fallback.
  if (finalQuestions.length < config.count) {
    const shortfall = config.count - finalQuestions.length;
    console.warn(
      `[FidelityGuard] Pool shortfall: only ${finalQuestions.length}/${config.count} questions for chapter "${config.chapter}" subject "${requestedSubject}".` +
      ` Shortfall = ${shortfall}. NO cross-subject padding will be applied.`
    );

    // Only use questions that pass the subject guard and haven't been used yet.
    const subjectSafeFallback = rawPool.filter(q => {
      if (usedIds.has(q.id)) return false;
      // Hard subject guard — MUST pass
      if (requestedSubject && isSubjectMismatch(q, requestedSubject)) return false;
      return true;
    });

    let fallbackIdx = 0;
    while (finalQuestions.length < config.count) {
      let nextQ: UnifiedQuestion | null = null;

      if (subjectSafeFallback.length > 0) {
        nextQ = subjectSafeFallback.shift()!;
        usedIds.add(nextQ.id);
      } else if (finalQuestions.length > 0) {
        // Controlled repetition — recycle already-accepted same-subject questions
        // rather than stopping the session or serving cross-subject content.
        fallbackIdx++;
        const recycleIdx = (fallbackIdx - 1) % finalQuestions.length;
        nextQ = { ...finalQuestions[recycleIdx], id: `${finalQuestions[recycleIdx].id}-repeat-${fallbackIdx}` };
        if (import.meta.env.DEV) {
          console.warn(
            `[FidelityGuard] Controlled repetition (slot ${finalQuestions.length + 1}/${config.count}): ` +
            `recycling question "${nextQ.question_text?.slice(0, 60)}..." — repository exhausted for topic "${config.chapter}".`
          );
        }
      } else {
        // Absolute last resort — cannot serve anything for this subject/chapter.
        // Log as error but do not crash the session.
        console.error(
          `[FidelityGuard] POOL EXHAUSTED and no recyclable questions for subject "${requestedSubject}" ` +
          `chapter "${config.chapter}". Session will be shorter than requested.`
        );
        break;
      }

      const assignedDiff = getTargetDifficulty(config.difficulty, finalQuestions.length, config.count);
      finalQuestions.push({
        ...nextQ,
        difficulty: assignedDiff
      });
    }
  }


  for (let i = finalQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
  }

  for (let i = 0; i < finalQuestions.length - 1; i++) {
    if (finalQuestions[i].concept_tested === finalQuestions[i + 1].concept_tested) {
      let swapIndex = -1;
      for (let j = i + 2; j < finalQuestions.length; j++) {
        if (finalQuestions[j].concept_tested !== finalQuestions[i].concept_tested) {
          swapIndex = j;
          break;
        }
      }
      if (swapIndex !== -1) {
        [finalQuestions[i + 1], finalQuestions[swapIndex]] = [finalQuestions[swapIndex], finalQuestions[i + 1]];
      }
    }
  }

  const finalConceptCounts: Record<string, number> = {};
  finalQuestions.forEach(q => {
    const concept = q.concept_tested || 'General';
    finalConceptCounts[concept] = (finalConceptCounts[concept] || 0) + 1;
  });

  diagnostics.conceptCoverage = {};
  Object.entries(finalConceptCounts).forEach(([concept, count]) => {
    diagnostics.conceptCoverage[concept] = Number(((count / finalQuestions.length) * 100).toFixed(1));
  });
  diagnostics.finalAccepted = finalQuestions.length;

  const relevanceCount = finalQuestions.filter(q => validateTopicMatch(q, config.chapter).matches).length;
  const topicRelevance = finalQuestions.length > 0 ? (relevanceCount / finalQuestions.length) * 100 : 0;
  diagnostics.topicRelevance = topicRelevance;

  const coveredConceptsCount = Object.keys(finalConceptCounts).filter(c =>
    catalogEntry.concepts.some(cc => cc.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(cc.toLowerCase()))
  ).length;
  const potentialConcepts = Math.min(catalogEntry.concepts.length, config.count);
  const coverageRatio = potentialConcepts > 0 ? (coveredConceptsCount / potentialConcepts) * 100 : 0;
  diagnostics.coverageRatio = coverageRatio;

  // Calculate Template Diversity Score based on final accepted questions
  const finalHashes = new Set<string>();
  finalQuestions.forEach(q => {
    finalHashes.add(getQuestionTextHash(q.question_text));
  });
  const uniqueTemplates = finalHashes.size;
  const templateDiversityScore = finalQuestions.length > 0
    ? Number(((uniqueTemplates / finalQuestions.length) * 100).toFixed(1))
    : 100;
  diagnostics.templateDiversityScore = templateDiversityScore;

  // ── Fidelity Report ───────────────────────────────────────────────────────
  // subject_match_rate: directly test the final returned questions, not pool entries.
  // A question is a subject match if it does NOT trigger the exclusion keyword list.
  const subjectMatchCount = finalQuestions.filter(q => {
    if (!requestedSubject) return true; // no subject specified → always match
    return !isSubjectMismatch(q, requestedSubject);
  }).length;
  const subjectMatchRate = finalQuestions.length > 0
    ? (subjectMatchCount / finalQuestions.length) * 100
    : (rawPool.length === 0 ? 100 : 0); // empty pool = 100% because no bad Qs served

  const fidelityReport: FidelityReport = {
    requested_subject: requestedSubject,
    requested_chapter: requestedChapter,
    total_in_pool: rawPool.length,
    total_accepted: finalQuestions.length,
    subject_match_rate: Number(subjectMatchRate.toFixed(1)),
    chapter_match_rate: Number(topicRelevance.toFixed(1)),
    topic_match_rate: Number(topicRelevance.toFixed(1)),
    entries: fidelityEntries,
  };

  diagnostics.fidelityReport = fidelityReport;

  // Runtime logging for console + debug panel
  console.log('[Runtime Fidelity Report]', {
    requested_subject: requestedSubject,
    requested_chapter: requestedChapter,
    requested_topic: config.chapter,
    pool_size: rawPool.length,
    accepted: finalQuestions.length,
    rejected_subject_mismatch: diagnostics.rejectedSubjectMismatch,
    rejected_duplicates: diagnostics.rejectedDuplicates,
    rejected_low_quality: diagnostics.rejectedLowQuality,
    subject_match_rate: `${subjectMatchRate.toFixed(1)}%`,
    topic_relevance: `${topicRelevance.toFixed(1)}%`,
    templateDiversity: `${templateDiversityScore.toFixed(1)}%`,
  });

  // P0 ALERT: If any cross-subject questions slipped through, log as critical error
  if (diagnostics.rejectedSubjectMismatch > 0) {
    console.error(
      `[P0 FidelityGuard] BLOCKED ${diagnostics.rejectedSubjectMismatch} cross-subject questions` +
      ` from entering a ${requestedSubject} session (chapter: ${requestedChapter}).`
    );
  }

  if (topicRelevance < 95) {
    if (topicRelevance >= 80) {
      console.warn(`[Audit Advisory] Topic relevance warning (80-95%): ${topicRelevance.toFixed(1)}%`);
    } else if (topicRelevance >= 60) {
      console.warn(`[Audit Advisory] Topic relevance recovery generation (60-80%): ${topicRelevance.toFixed(1)}%`);
    } else {
      console.warn(`[Audit Advisory] Topic relevance low (< 60%): ${topicRelevance.toFixed(1)}%`);
    }
  }

  if (templateDiversityScore < 85) {
    console.warn(`[Audit Advisory] Template diversity score low (< 85%): ${templateDiversityScore.toFixed(1)}%`);
  }

  if (coverageRatio < 80 && catalogEntry.concepts.length > 1 && config.count >= 10) {
    console.warn(`[Audit Advisory] Concept coverage ratio is low: ${coverageRatio.toFixed(1)}% (< 80%).`);
  }

  try {
    const existingReportsStr = localStorage.getItem('prepentrance-session-reports') || '[]';
    const reports = JSON.parse(existingReportsStr);
    reports.push({
      timestamp: Date.now(),
      config,
      diagnostics,
      fidelityReport
    });
    // Keep only the last 50 session reports
    const trimmed = reports.slice(-50);
    localStorage.setItem('prepentrance-session-reports', JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[SessionBuilder] Failed to save session report to localStorage:', e);
  }

  console.log('[SessionReport Diagnostics]', diagnostics);

  return {
    questions: finalQuestions,
    diagnostics,
  };
}
