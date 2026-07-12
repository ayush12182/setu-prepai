import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { logStudentActivity } from '@/lib/studentActivity';
import { recordStudentAttempt } from '@/services/studentIntelligence';

import { JEE_PROMPT_CONSTRAINTS } from '@/lib/gemini';
import { generateQuestions as getUnifiedQuestions } from '@/services/questionGenerator';
import { getOfflineQuestions } from '@/data/offlineQuestionBank';
import { mapMockChapterIdToReal, classifyQuestion } from '@/utils/chapterClassifier';
import { trackQuestionAttempt } from '@/utils/activityTracker';
import { getChapterQuestionLimit, resolveSubscriptionTier } from '@/hooks/useQuestionEntitlement';

// The interface expected by QuizInterface components
export type QuestionType = 'MCQ' | 'AR' | 'NUMERICAL';

export interface Question {
  id: string;
  node_id: string;
  type: QuestionType;
  exam_type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  chapter_id?: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string | number | { min: number; max: number };
  explanation: string;
  concept_tested: string;
  common_mistake?: string;
  is_verified?: boolean;
  generation_model?: string;
  option_misconceptions?: Record<string, string>;
  misconception_id?: string;
}

export interface SimilarQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  difficulty_note: string;
}

const mapQuestionBankToInterface = (qbItem: any): Question => {
  // Adaptation for the new 'questions' table
  return {
    id: qbItem.id,
    node_id: qbItem.topic_id || 'adaptive',
    type: (qbItem.question_type || 'MCQ') as QuestionType,
    exam_type: qbItem.exam_type || 'JEE',
    difficulty: (qbItem.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: qbItem.content?.question || qbItem.question_text,
    chapter_id: qbItem.chapter_id || '',
    options: qbItem.options || qbItem.content?.options || {
      A: qbItem.option_a || '',
      B: qbItem.option_b || '',
      C: qbItem.option_c || '',
      D: qbItem.option_d || ''
    },
    answer: (qbItem.answer || qbItem.correct_option || 'A').toUpperCase(),
    explanation: qbItem.metadata?.explanation || qbItem.explanation || '',
    concept_tested: qbItem.metadata?.concept || qbItem.concept_tested || 'General',
    common_mistake: qbItem.metadata?.common_mistake,
    option_misconceptions: qbItem.option_misconceptions || qbItem.metadata?.option_misconceptions,
    misconception_id: qbItem.misconception_id || qbItem.metadata?.misconception_id,
    is_verified: qbItem.is_verified,
    generation_model: qbItem.metadata?.model,
  };
};


export type GenerationStatus = 'idle' | 'fetching' | 'generating' | 'polling' | 'completed' | 'failed';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function generateOfflineMockQuestions(
  topicName: string,
  exam: string,
  difficulty: string,
  count: number
): Question[] {
  // High-fidelity database of authentic JEE Main / JEE Advanced style questions
  const unitsDb = [
    {
      q: "A student measures the mass of a solid sphere to be (10.0 ± 0.1) g and its radius to be (2.00 ± 0.02) cm. The percentage error in the measurement of its density is:",
      a: "4.0%", b: "3.0%", c: "1.5%", d: "5.0%", ans: "A",
      exp: `Step 1: Concept used - Relative error propagation in density calculation.
Step 2: Formula used - Density d = M / V = M / ((4/3) * pi * R^3). Relative error is delta_d/d = delta_M/M + 3 * delta_R/R.
Step 3: Mathematical substitution - delta_d/d = 0.1/10.0 + 3 * (0.02/2.00).
Step 4: Simplification - delta_d/d = 0.01 + 3 * 0.01 = 0.04. Percentage error is 0.04 * 100 = 4.0%.
Step 5: Final answer - The percentage error in density is 4.0%.`,
      concept: "Error propagation in density"
    },
    {
      q: "The main scale of a Vernier Caliper has n divisions per cm. n divisions of the main scale coincide with (n+1) divisions of the vernier scale. The least count of the caliper is:",
      a: "1 / (n*(n+1)) cm", b: "1 / n² cm", c: "1 / (n*(n-1)) cm", d: "n / (n+1) cm", ans: "A",
      exp: `Step 1: Concept used - Vernier caliper least count principles.
Step 2: Formula used - Least count = 1 MSD - 1 VSD.
Step 3: Mathematical substitution - 1 MSD = 1/n cm. (n+1) VSD = n MSD => 1 VSD = (n/(n+1)) MSD. Least count = (1 - n/(n+1)) * (1/n) cm.
Step 4: Simplification - LC = (1/(n+1)) * (1/n) = 1 / (n*(n+1)) cm.
Step 5: Final answer - Least count is 1 / (n*(n+1)) cm.`,
      concept: "Vernier least count"
    }
  ];

  const kinematicsDb = [
    {
      q: "A boat starts from one bank of a river of width d with constant speed u relative to the water. The river flows with velocity v(y) = v0 * (y/d) * (1 - y/d) where y is the distance from the starting bank. If the boat is steered perpendicular to the stream at all times, the drift of the boat when it reaches the opposite bank is:",
      a: "v0 * d / (6 * u)", b: "v0 * d / (3 * u)", c: "v0 * d / (2 * u)", d: "v0 * d / u", ans: "A",
      exp: `Step 1: Concept used - Relative velocity 2D drift integration.
Step 2: Formula used - dx = v_x * dt where v_x = v(y), and dy = u * dt => dt = dy/u. Drift x = integral from 0 to d of (v(y)/u) dy.
Step 3: Mathematical substitution - x = integral from 0 to d of (v0 * y * (1 - y/d) / (u * d)) dy.
Step 4: Simplification - x = (v0 / (u * d)) * [y^2/2 - y^3/(3*d)] from 0 to d = (v0 / (u * d)) * (d^2/2 - d^2/3) = v0 * d / (6 * u).
Step 5: Final answer - The drift of the boat is v0 * d / (6 * u).`,
      concept: "Relative Velocity River Boat"
    },
    {
      q: "A projectile is projected with velocity v0 at an angle alpha with an inclined plane of inclination beta. If the projectile strikes the inclined plane perpendicularly, then the relation between alpha and beta is:",
      a: "cot(beta) = 2 * tan(alpha)", b: "tan(beta) = 2 * tan(alpha)", c: "cot(beta) = tan(alpha)", d: "tan(beta) = cot(alpha)", ans: "A",
      exp: `Step 1: Concept used - Projectile motion on an inclined plane. Perpendicular strike implies velocity component along incline is zero at time of flight T.
Step 2: Formula used - Time of flight T = 2*v0*sin(alpha) / (g*cos(beta)). Velocity along incline v_x = v0*cos(alpha) - g*sin(beta)*T. Set v_x = 0.
Step 3: Mathematical substitution - v0*cos(alpha) - g*sin(beta) * (2*v0*sin(alpha) / (g*cos(beta))) = 0.
Step 4: Simplification - cos(alpha) = 2*tan(beta)*sin(alpha) => cot(alpha) = 2*tan(beta) => cot(beta) = 2*tan(alpha).
Step 5: Final answer - The correct relationship is cot(beta) = 2 * tan(alpha).`,
      concept: "Projectile on Inclined Plane"
    }
  ];

  const nlmDb = [
    {
      q: "Two blocks of masses m1 = 2 kg and m2 = 3 kg are connected by a light string over a friction-free pulley. Block m1 lies on a rough inclined plane of angle 30° and coefficient of static friction mu = 0.5. The maximum mass M that can be suspended to keep the system at rest is (take g = 10 m/s²):",
      a: "1.87 kg", b: "2.50 kg", c: "3.20 kg", d: "1.00 kg", ans: "A",
      exp: `Step 1: Concept used - Static equilibrium of blocks under limiting friction.
Step 2: Formula used - For limiting case of upward slip: T = M*g = m1*g*sin(theta) + mu*m1*g*cos(theta).
Step 3: Mathematical substitution - M * 10 = 2 * 10 * sin(30°) + 0.5 * 2 * 10 * cos(30°) => M = 2 * 0.5 + 0.5 * 2 * 0.866.
Step 4: Simplification - M = 1.0 + 0.866 = 1.866 kg ≈ 1.87 kg.
Step 5: Final answer - The maximum suspended mass is 1.87 kg.`,
      concept: "Pulley Incline Equilibrium"
    }
  ];

  const wpeDb = [
    {
      q: "A block of mass m = 1 kg is attached to a spring of constant k = 100 N/m. The block is at rest on a frictionless horizontal surface. A variable horizontal force F(x) = F0 * (1 - x/d) where F0 = 10 N and d = 0.1 m is applied. The maximum speed (in m/s) achieved by the block during its subsequent motion is:",
      a: "0.5", b: "1.0", c: "1.5", d: "2.0", ans: "A",
      exp: `Step 1: Concept used - Work-Energy theorem. Velocity is maximum where net force is zero.
Step 2: Formula used - F_net = F(x) - k*x = 0 to find x0. Work done W = integral from 0 to x0 of F(x) dx - 0.5 * k * x0^2 = 0.5 * m * v_max^2.
Step 3: Mathematical substitution - 10*(1 - x0/0.1) - 100*x0 = 0 => 10 - 200*x0 = 0 => x0 = 0.05 m.
W = integral from 0 to 0.05 of 10*(1 - 10*x) dx - 0.5 * 100 * (0.05)^2.
Step 4: Simplification - W = [10*x - 50*x^2] from 0 to 0.05 - 0.125 = (0.5 - 0.125) - 0.125 = 0.25 - 0.125 = 0.125 J.
0.5 * 1 * v_max^2 = 0.125 => v_max^2 = 0.25 => v_max = 0.5 m/s.
Step 5: Final answer - The maximum speed achieved is 0.5 m/s.`,
      concept: "Spring system variable force"
    }
  ];

  const electrostaticsDb = [
    {
      q: "Three concentric conducting spherical shells of radii R, 2R, and 3R carry charges q, 2q, and 3q respectively. If the middle shell is earthed, the final charge on the middle shell becomes:",
      a: "-3q", b: "-2q", c: "-5q/3", d: "-q", ans: "A",
      exp: `Step 1: Concept used - Earthing concentric shells forces the earthed shell's potential to zero.
Step 2: Formula used - Potential of middle shell V2 = (1/(4*pi*epsilon0)) * (q/r2 + q2'/r2 + q3/r3) = 0.
Step 3: Mathematical substitution - q/(2*R) + q2'/(2*R) + 3*q/(3*R) = 0.
Step 4: Simplification - (q + q2')/(2*R) + q/R = 0 => q + q2' + 2*q = 0 => q2' = -3q.
Step 5: Final answer - The final charge is -3q.`,
      concept: "Earthing concentric shells"
    }
  ];

  const functionsDb = [
    {
      q: "Find the domain of the real-valued function f(x) = sqrt( log_0.5( (x^2 - 5*x + 6) / (x^2 - 1) ) ):",
      a: "[7/5, 2) U (3, infinity)", b: "(1, 2) U (3, infinity)", c: "[7/5, 3)", d: "(-1, 2) U (3, infinity)", ans: "A",
      exp: `Step 1: Concept used - Inside square root argument must be non-negative; argument of log must be positive.
Step 2: Formula used - For base 0.5 < 1, sqrt(log_0.5(A)) >= 0 requires 0 < A <= 1.
Step 3: Mathematical substitution - 0 < (x^2 - 5*x + 6)/(x^2 - 1) <= 1.
First part: (x-2)(x-3)/((x-1)(x+1)) > 0 => x in (-infinity, -1) U (1, 2) U (3, infinity).
Second part: (x^2 - 5*x + 6)/(x^2 - 1) - 1 <= 0 => (-5*x + 7)/(x^2 - 1) <= 0 => x in (-1, 1) U [7/5, infinity).
Step 4: Simplification - Intersecting the intervals gives x in [7/5, 2) U (3, infinity).
Step 5: Final answer - The domain is [7/5, 2) U (3, infinity).`,
      concept: "Domain of composite function"
    }
  ];

  const calculusDb = [
    {
      q: "Evaluate the limit: L = lim (x -> 0) of (sin(x) / x)^(1 / x^2):",
      a: "e^(-1/6)", b: "e^(-1/3)", c: "e^(-1/2)", d: "1", ans: "A",
      exp: `Step 1: Concept used - Indeterminate form 1^infinity.
Step 2: Formula used - L = e^k where k = lim (x -> 0) of (sin(x)/x - 1) / x^2.
Step 3: Mathematical substitution - Using Taylor series expansion: sin(x) = x - x^3/6 + x^5/120 - ...
Step 4: Simplification - k = lim (x -> 0) of ((x - x^3/6 - x)/x) / x^2 = lim (x -> 0) of (-x^3/(6*x)) / x^2 = -1/6. Thus, L = e^(-1/6).
Step 5: Final answer - The limit is e^(-1/6).`,
      concept: "Limits indeterminate 1^inf"
    }
  ];

  const coordinateDb = [
    {
      q: "Find the equations of the common tangents to the circle x^2 + y^2 = 2 and the parabola y^2 = 8*x:",
      a: "y = ±(x + 2)", b: "y = ±(2*x + 1)", c: "y = ±(x + 1)", d: "y = ±(x - 2)", ans: "A",
      exp: `Step 1: Concept used - Combined tangent conditions for parabola and circle.
Step 2: Formula used - Tangent to y^2 = 8*x is y = m*x + 2/m. Distance from center (0,0) of x^2 + y^2 = 2 to this line must equal radius r = sqrt(2).
Step 3: Mathematical substitution - |2/m| / sqrt(m^2 + 1) = sqrt(2) => 4/m^2 = 2*(m^2 + 1).
Step 4: Simplification - 2 = m^4 + m^2 => m^4 + m^2 - 2 = 0 => (m^2 - 1)(m^2 + 2) = 0 => m = ±1. Substituting m = ±1 gives y = ±(x + 2).
Step 5: Final answer - The equations of common tangents are y = ±(x + 2).`,
      concept: "Common Tangent to Conics"
    }
  ];

  const physicalChemistryDb = [
    {
      q: "The cell potential of the concentration cell Pt | H2(1 atm) | HA(0.1 M) || H+(1 M) | H2(1 atm) | Pt at 298 K is 0.236 V. Determine the pKa of the weak acid HA. (Take 2.303 * R * T / F = 0.059 V)",
      a: "7.0", b: "5.0", c: "3.0", d: "4.0", ans: "A",
      exp: `Step 1: Concept used - Nernst equation for concentration cell and pH of a weak acid.
Step 2: Formula used - E_cell = 0.059 * pH_anode (since [H+]_cathode = 1 M). pH = 0.5 * (pKa - log(C)).
Step 3: Mathematical substitution - 0.236 = 0.059 * pH => pH = 4.0.
4.0 = 0.5 * (pKa - log(0.1)).
Step 4: Simplification - 8.0 = pKa - (-1) => 8.0 = pKa + 1 => pKa = 7.0.
Step 5: Final answer - The pKa of HA is 7.0.`,
      concept: "Nernst equation pH dissociation"
    }
  ];

  const organicChemistryDb = [
    {
      q: "The reaction of optically active (S)-2-bromobutane with sodium hydroxide in acetone/water solvent gives (R)-butan-2-ol. The mechanism and stereochemical course of this reaction are:",
      a: "SN2 with inversion of configuration", b: "SN1 with partial racemization", c: "SN2 with retention of configuration", d: "SN1 with complete retention", ans: "A",
      exp: `Step 1: Concept used - Nucleophilic substitution mechanism and stereochemistry.
Step 2: Formula used - Walden inversion bimolecular rate law Rate = k[R-X][OH-].
Step 3: Mathematical substitution - Active (S)-bromobutane undergoes back-side attack by strong nucleophile OH-.
Step 4: Simplification - Pentacoordinate transition state collapses to invert the stereocenter to (R)-butan-2-ol.
Step 5: Final answer - The reaction proceeds via SN2 mechanism with inversion of configuration.`,
      concept: "SN2 stereocenter inversion"
    }
  ];

  const inorganicChemistryDb = [
    {
      q: "Which of the following coordination complex ions exhibits the highest spin-only magnetic moment?",
      a: "[Fe(H2O)6]3+", b: "[Fe(CN)6]3-", c: "[Co(NH3)6]3+", d: "[CoF6]3-", ans: "A",
      exp: `Step 1: Concept used - Crystal Field Theory (CFT) spin-only magnetic moment.
Step 2: Formula used - mu = sqrt(n*(n+2)) B.M. where n is the number of unpaired electrons.
Step 3: Mathematical substitution -
- [Fe(H2O)6]3+ is d5 high spin (n=5) => mu = sqrt(35) ≈ 5.92 B.M.
- [Fe(CN)6]3- is d5 low spin (n=1) => mu = sqrt(3) ≈ 1.73 B.M.
- [Co(NH3)6]3+ is d6 low spin (n=0) => mu = 0 B.M.
- [CoF6]3- is d6 high spin (n=4) => mu = sqrt(24) ≈ 4.90 B.M.
Step 4: Simplification - Maximum unpaired electrons occurs in [Fe(H2O)6]3+ with n=5.
Step 5: Final answer - [Fe(H2O)6]3+ has the highest magnetic moment of ≈ 5.92 B.M.`,
      concept: "Magnetic moment CFT"
    }
  ];

  const defaultDb = [...kinematicsDb, ...nlmDb, ...wpeDb, ...electrostaticsDb, ...functionsDb, ...calculusDb, ...coordinateDb, ...physicalChemistryDb, ...organicChemistryDb, ...inorganicChemistryDb];

  const name = topicName.toLowerCase();
  let db = defaultDb;

  if (name.includes('unit') || name.includes('dimension') || name.includes('error')) {
    db = unitsDb;
  } else if (name.includes('kin-1d') || name.includes('kin-2d') || name.includes('kinematics') || name.includes('motion')) {
    db = kinematicsDb;
  } else if (name.includes('nlm') || name.includes('law') || name.includes('pulley') || name.includes('friction') || name.includes('constraint')) {
    db = nlmDb;
  } else if (name.includes('wpe') || name.includes('work') || name.includes('power') || name.includes('energy') || name.includes('spring')) {
    db = wpeDb;
  } else if (name.includes('electrostatics') || name.includes('field') || name.includes('potential') || name.includes('charge') || name.includes('capacitor') || name.includes('conductor')) {
    db = electrostaticsDb;
  } else if (name.includes('function') || name.includes('relation') || name.includes('composition') || name.includes('domain') || name.includes('range')) {
    db = functionsDb;
  } else if (name.includes('calculus') || name.includes('limit') || name.includes('continuity') || name.includes('differentiability') || name.includes('integration') || name.includes('area') || name.includes('aod')) {
    db = calculusDb;
  } else if (name.includes('coordinate') || name.includes('tangent') || name.includes('normal') || name.includes('circle') || name.includes('parabola') || name.includes('ellipse') || name.includes('hyperbola') || name.includes('conic')) {
    db = coordinateDb;
  } else if (name.includes('physical') || name.includes('mole') || name.includes('thermodynamics') || name.includes('equilibrium') || name.includes('electrochemistry')) {
    db = physicalChemistryDb;
  } else if (name.includes('organic') || name.includes('reaction') || name.includes('sn1') || name.includes('sn2') || name.includes('mechanism') || name.includes('rearrangement') || name.includes('product')) {
    db = organicChemistryDb;
  } else if (name.includes('inorganic') || name.includes('coordination') || name.includes('isomer') || name.includes('trend') || name.includes('exception') || name.includes('assertion')) {
    db = inorganicChemistryDb;
  }

  return Array.from({ length: count }, (_, i) => {
    const item = db[i % db.length];
    
    // Shuffle options so it's not always A.
    const originalOptions = [
      { key: 'A', text: item.a },
      { key: 'B', text: item.b },
      { key: 'C', text: item.c },
      { key: 'D', text: item.d }
    ];
    
    const shuffledOptions = [...originalOptions];
    const shuffleSeed = (i * 7) % 4;
    for (let k = 0; k < shuffleSeed; k++) {
      shuffledOptions.push(shuffledOptions.shift()!);
    }
    
    const newOptions: Record<string, string> = {};
    let correctKey = 'A';
    
    ['A', 'B', 'C', 'D'].forEach((key, index) => {
      const originalOpt = shuffledOptions[index];
      newOptions[key] = originalOpt.text;
      if (originalOpt.key === item.ans) {
        correctKey = key;
      }
    });

    return {
      id: `offline-${Date.now()}-${i}`,
      node_id: topicName,
      type: 'MCQ' as QuestionType,
      exam_type: exam,
      difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
      question_text: item.q,
      options: newOptions,
      answer: correctKey,
      explanation: item.exp,
      concept_tested: item.concept,
      option_a: newOptions['A'],
      option_b: newOptions['B'],
      option_c: newOptions['C'],
      option_d: newOptions['D'],
      correct_option: correctKey
    };
  });
}

async function geminiGenerateQuestions(
  topicName: string,
  exam: string,
  difficulty: string,
  count: number
): Promise<Question[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');

  const isJee = exam.toUpperCase().includes('JEE');
  const systemPrompt = isJee
    ? `You are an expert JEE exam question setter. Generate questions indistinguishable from authentic JEE Main and JEE Advanced questions. Avoid school-level, textbook-level, and direct formula-substitution questions. Reject any question that can be solved instantly without conceptual reasoning. Return ONLY a JSON object with a "questions" array. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.

${JEE_PROMPT_CONSTRAINTS}`
    : `You are an expert ${exam} exam question setter. Generate exactly ${count} high-quality MCQs for the topic "${topicName}". Difficulty: ${difficulty}. Return ONLY a JSON object with a "questions" array. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

  const userPrompt = `Generate exactly ${count} MCQs on "${topicName}" for ${exam}. Difficulty: ${difficulty}. Each question must have: question_text, option_a, option_b, option_c, option_d, correct_option (A/B/C/D), explanation, concept_tested.`;

  const res = await fetch(`${GEMINI_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.4, response_mime_type: 'application/json' },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const raw = await res.json();
  const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  const parsed: { questions: any[] } = JSON.parse(text);

  return (parsed.questions || []).map((q: any, i: number) => ({
    id: `gemini-${Date.now()}-${i}`,
    node_id: topicName,
    type: 'MCQ' as QuestionType,
    exam_type: exam,
    difficulty: (q.difficulty || difficulty).toLowerCase() as 'easy' | 'medium' | 'hard',
    question_text: q.question_text,
    options: { A: q.option_a || '', B: q.option_b || '', C: q.option_c || '', D: q.option_d || '' },
    answer: q.correct_option,
    explanation: q.explanation || '',
    concept_tested: q.concept_tested || topicName,
  }));
}
export const usePracticeQuestions = () => {
  const [questions, setQuestions]           = useState<Question[]>([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [generationMode, setGenerationMode] = useState<'ai' | 'offline' | 'recovery' | 'idle' | 'fetching'>('idle');
  const [sessionDiagnostics, setSessionDiagnostics] = useState<any | null>(null);

  const generateQuestions = async (
    nodeId: string,
    difficulty: 'easy' | 'medium' | 'hard' | undefined,
    count: number = 10,
    exam: string = 'JEE',
    nodeName?: string,
    subject?: string
  ) => {
    const topicName = nodeName || nodeId;
    const effectiveDifficulty = difficulty || 'medium';

    setLoading(true);
    setError(null);
    setGenerationStatus('fetching');
    setGenerationMode('fetching');

    try {
      // Fetch attempt history from localStorage cache
      let excludeQuestionIds: string[] = [];
      try {
        const cachedAttemptsStr = localStorage.getItem('prepentrance_student_attempts');
        if (cachedAttemptsStr) {
          const cachedAttempts = JSON.parse(cachedAttemptsStr);
          excludeQuestionIds = cachedAttempts.map((a: any) => a.questionId || a.question_id).filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to load attempts for question generator:', e);
      }

      const rawChapterId = nodeId.split('-').slice(0, 2).join('-');
      const realChapterId = mapMockChapterIdToReal(rawChapterId);

      // ─── Subscription Entitlement ───────────────────────────────────────
      // Resolve the student's plan tier and compute the per-chapter question cap
      // so question access is balanced across all chapters (not just first N rows).
      const rawTier =
        localStorage.getItem('subscription_tier') ||
        localStorage.getItem('batch_id');
      const tier = resolveSubscriptionTier(rawTier);
      const chapterQuestionLimit = getChapterQuestionLimit(tier, exam);
      // ─────────────────────────────────────────────────────────────────────

      const result = await getUnifiedQuestions({
        exam,
        subject: subject || exam,
        chapter: topicName,
        chapterId: realChapterId,
        subchapter: nodeId,
        difficulty: effectiveDifficulty,
        count,
        excludeQuestionIds,
        chapterQuestionLimit,  // ← enforces balanced subscription cap
      });

      const mapped = result.questions.map((q: any) => shuffleQuestionOptions(q));
      
      let validated = mapped.filter((q: any) => {
        const classified = classifyQuestion(subject || 'Physics', q.question_text || q.content?.question, [q.option_a || q.options?.A || '', q.option_b || q.options?.B || '', q.option_c || q.options?.C || '', q.option_d || q.options?.D || ''], q.explanation || q.explanation_text || '');
        if (classified.detectedChapterId !== realChapterId && (subject || 'Physics').toLowerCase().includes('phys')) {
          console.warn(`[VALIDATOR REJECT PRACTICE] Question: "${(q.question_text || '').slice(0, 60)}..." | Requested: ${realChapterId} | Classified: ${classified.detectedChapterId}`);
          return false;
        }
        return true;
      });

      // Self-Healing Deficit Refilling for Practice mode
      if (validated.length < count) {
        const deficit = count - validated.length;
        console.log(`[Self-Healing Practice] Refilling ${deficit} questions for ${topicName}`);
        const offlineQs = getOfflineQuestions(subject || 'Physics', topicName, effectiveDifficulty, deficit * 3);
        const mappedOffline = offlineQs.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapQuestionBankToInterface(shuffledQ);
        });
        const validatedOffline = mappedOffline.filter((q: Question) => {
          const classified = classifyQuestion(subject || 'Physics', q.question_text, [q.options?.A || '', q.options?.B || '', q.options?.C || '', q.options?.D || ''], q.explanation);
          return classified.detectedChapterId === realChapterId || !(subject || 'Physics').toLowerCase().includes('phys');
        }).slice(0, deficit);
        validated.push(...validatedOffline);

        // If still deficit, generate mock offline questions
        if (validated.length < count) {
          const remainingDeficit = count - validated.length;
          const mockQs = generateOfflineMockQuestions(topicName, exam, effectiveDifficulty, remainingDeficit);
          validated.push(...mockQs);
        }
      }

      setQuestions(validated);
      setSessionDiagnostics(result.diagnostics || null);
      setGenerationStatus('completed');
      setGenerationMode(result.generationMode);
      return validated;
    } catch (err: any) {
      console.warn('Unified question generation failed, silently falling back to offline bank:', err);
      try {
        // Fetch attempts again for fallback filtering
        let excludeQuestionIds: string[] = [];
        try {
          const cachedAttemptsStr = localStorage.getItem('prepentrance_student_attempts');
          if (cachedAttemptsStr) {
            const cachedAttempts = JSON.parse(cachedAttemptsStr);
            excludeQuestionIds = cachedAttempts.map((a: any) => a.questionId || a.question_id).filter(Boolean);
          }
        } catch (e) {}

        const offlineQs = getOfflineQuestions(exam, topicName, effectiveDifficulty, count * 3);
        const mapped = offlineQs.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapQuestionBankToInterface(shuffledQ);
        });

        const filteredMapped = mapped.filter((q: Question) => !excludeQuestionIds.includes(q.id)).slice(0, count);

        if (filteredMapped.length > 0) {
          const { buildDeterministicSession } = await import('../services/sessionBuilder');
          const sessionRes = buildDeterministicSession(filteredMapped, {
            chapter: topicName,
            difficulty: effectiveDifficulty,
            count
          });
          setQuestions(sessionRes.questions);
          setSessionDiagnostics(sessionRes.diagnostics || null);
          setGenerationStatus('completed');
          setGenerationMode('offline');
          return sessionRes.questions;
        }

        console.warn('[PracticeGenerator] Offline fallback also failed. Initiating auto-retry...');
        setGenerationStatus('polling');
        setTimeout(() => {
          generateQuestions(nodeId, difficulty, count, exam, nodeName, subject);
        }, 2000);
        return [];
      } catch (fallbackErr) {
        console.error('Offline bank fallback failed, loading emergency questions:', fallbackErr);
        // Fall back to EMERGENCY_QUESTIONS
        try {
          let excludeQuestionIds: string[] = [];
          try {
            const cachedAttemptsStr = localStorage.getItem('prepentrance_student_attempts');
            if (cachedAttemptsStr) {
              const cachedAttempts = JSON.parse(cachedAttemptsStr);
              excludeQuestionIds = cachedAttempts.map((a: any) => a.questionId || a.question_id).filter(Boolean);
            }
          } catch (e) {}

          const emergencyQs = getOfflineQuestions(exam, 'General', 'medium', count * 3);
          const mapped = emergencyQs.map((q: any) => {
            const shuffledQ = shuffleQuestionOptions(q);
            return mapQuestionBankToInterface(shuffledQ);
          });

          let filteredMapped = mapped.filter(q => !excludeQuestionIds.includes(q.id));
          if (filteredMapped.length < count) {
            filteredMapped = [...filteredMapped, ...mapped.filter(q => excludeQuestionIds.includes(q.id))];
          }

          const { buildDeterministicSession } = await import('../services/sessionBuilder');
          const sessionRes = buildDeterministicSession(filteredMapped, {
            chapter: topicName,
            difficulty: effectiveDifficulty,
            count
          });
          setQuestions(sessionRes.questions);
          setSessionDiagnostics(sessionRes.diagnostics || null);
          setGenerationStatus('completed');
          setGenerationMode('recovery');

          return sessionRes.questions;
        } catch (eqErr: any) {
          console.error('Ultimate emergency pack fetch failed:', eqErr);

          // Last resort: generate offline mock questions so the session is never blocked
          try {
            const mockQs = generateOfflineMockQuestions(topicName, exam, effectiveDifficulty, count);
            if (mockQs.length > 0) {
              setQuestions(mockQs);
              setGenerationStatus('completed');
              setGenerationMode('recovery');
              if (import.meta.env.DEV) {
                console.warn(
                  `[Repository] Only returned 0/${count} verified questions. ` +
                  `Filled all ${count} using offline fallback strategy. Session continues uninterrupted.`
                );
              }
              return mockQs;
            }
          } catch (mockErr) {
            console.error('Offline mock generation also failed:', mockErr);
          }

          // If even mocks fail, report the error but don't block indefinitely
          setError(eqErr.message || 'Unable to load questions. Please try again.');
          setQuestions([]);
          setGenerationStatus('failed');
          setGenerationMode('recovery');
          return [];
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionsForNode = async (
    nodeId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
    count: number = 10,
    exam: string = 'JEE',
    nodeName?: string,
    subject?: string
  ) => {
    return generateQuestions(nodeId, difficulty === 'mixed' ? 'medium' : difficulty, count, exam, nodeName, subject);
  };

  const submitPracticeReport = async (
    exam: string,
    subject: string,
    chapter: string,
    subtopic: string | undefined,
    totalQuestions: number,
    correctCount: number,
    timeSpentSeconds: number,
    answers: Array<{ topic: string; subtopic: string; isCorrect: boolean }>,
    taskId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('submit-practice-report', {
        body: {
          exam, subject, chapter, subtopic,
          total_questions: totalQuestions,
          correct_count: correctCount,
          time_spent_seconds: timeSpentSeconds,
          answers,
          task_id: taskId
        }
      });
      if (error) console.error("Submit Practice Report edge function error:", error);
    } catch (e) {
      console.error("Submit practice report failed:", e);
    }
  };

  const getSimilarQuestions = async (
    conceptTested: string,
    chapterId: string,
    originalQuestionId: string,
    difficulty: string,
    examType: string = 'JEE_MAINS'
  ): Promise<SimilarQuestion[] | null> => {
    try {
      // The edge function already does a direct DB query using the service role to bypass RLS.
      // It does NOT use AI.
      const { data, error: fnError } = await supabase.functions.invoke('get-similar-questions', {
        body: {
          chapterId,
          conceptTested,
          originalQuestionId,
          difficulty,
          examType,
          count: 5
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (!data?.questions || data.questions.length === 0) {
        console.warn('[getSimilarQuestions] No similar questions found in DB for chapter:', chapterId);
        return null;
      }

      return (data.questions as SimilarQuestion[]).map(q =>
        shuffleQuestionOptions(q as any) as unknown as SimilarQuestion
      );
    } catch (err) {
      console.error('[getSimilarQuestions] Failed:', err);
      return null;
    }
  };


  const recordAttempt = async (
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D',
    isCorrect: boolean,
    timeTakenSeconds: number,
    confidenceLevel: 'low' | 'medium' | 'high',
    context?: {
      subject?: string;
      topic?: string;
      subtopic?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      exam_stage?: 'practice' | 'mock_test' | 'chapter_test' | 'previous_year';
      batch_id?: string;
      organization_id?: string;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const qObj = questions.find(q => q.id === questionId);
      const correctOpt = qObj ? (qObj.answer as string) : 'A';
      const concept = qObj ? qObj.concept_tested : (context?.topic || 'General');
      const miscId = qObj ? qObj.misconception_id : undefined;

      await recordStudentAttempt(user.id, {
        questionId,
        concept,
        isCorrect,
        selectedOption,
        correctOption: correctOpt,
        misconceptionId: miscId,
        timeSpentSeconds: timeTakenSeconds
      });

      await supabase.from('user_mcq_attempts' as any).insert({
        user_id: user.id,
        question_id: questionId,
        is_correct: isCorrect,
        time_taken_ms: timeTakenSeconds * 1000,
        confidence_level: confidenceLevel,
        user_selected_mistake: 'none',
        ai_predicted_mistake: 'none'
      });


      if (context?.subject && context?.topic) {
        logStudentActivity({
          question_id:        questionId,
          subject:            context.subject,
          topic:              context.topic,
          subtopic:           context.subtopic,
          difficulty:         context.difficulty === 'easy' ? 'Easy' : context.difficulty === 'hard' ? 'Hard' : 'Medium',
          exam_stage:         context.exam_stage ?? 'practice',
          is_correct:         isCorrect,
          time_spent_seconds: timeTakenSeconds,
          question_type:      'MCQ',
          batch_id:           context.batch_id,
          organization_id:    context.organization_id
        });
      }

      // ✅ Update dashboard stats in real-time (localStorage + DOM event)
      const chapterId = qObj?.chapter_id || context?.subtopic || '';
      trackQuestionAttempt(isCorrect, context?.subject, chapterId);

    } catch (err) {
      console.error('Failed to record attempt:', err);
    }
  };

  return {
    questions,
    loading,
    error,
    generationStatus,
    generationMode,
    sessionDiagnostics,
    generateQuestions,
    generateQuestionsForNode,
    submitPracticeReport,
    getSimilarQuestions,
    recordAttempt
  };
};

export const usePracticeStats = () => {
  const [stats, setStats] = useState({
    totalQuestionsSolved: 0,
    accuracy: 0,
    avgTimeSeconds: 0,
    chaptersPracticed: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from('user_practice_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const accuracy = data.total_questions_solved > 0
          ? Math.round((data.total_correct / data.total_questions_solved) * 100)
          : 0;
        const avgTime = data.total_questions_solved > 0
          ? Math.round(data.total_time_seconds / data.total_questions_solved)
          : 0;

        setStats({
          totalQuestionsSolved: data.total_questions_solved,
          accuracy,
          avgTimeSeconds: avgTime,
          chaptersPracticed: data.chapters_practiced?.length || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, fetchStats };
};
