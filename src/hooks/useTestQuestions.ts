import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Question } from './usePracticeQuestions';
import { shuffleQuestionOptions } from '@/utils/questionUtils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { generateQuestionsGemini } from '@/lib/gemini';
import { generateQuestions as getUnifiedQuestions } from '@/services/questionGenerator';
import { getOfflineQuestions } from '@/data/offlineQuestionBank';

export const mapMockChapterIdToReal = (id: string): string => {
  const mapping: Record<string, string> = {
    // Physics
    'ph-units': 'phy-1',
    'ph-kin1d': 'phy-1',
    'ph-proj': 'phy-1',
    'ph-nlm': 'phy-2',
    'ph-wep': 'phy-3',
    'ph-com': 'phy-4',
    'ph-rot': 'phy-4',
    'ph-grav': 'phy-5',
    'ph-solids': 'phy-6',
    'ph-fluids': 'phy-7',
    'ph-shm': 'phy-8',
    'ph-waves': 'phy-8',
    'ph-thermo': 'phy-9',
    'ph-estatic': 'phy-10',
    'ph-cap': 'phy-10',
    'ph-cur': 'phy-11',
    'ph-mag': 'phy-12',
    'ph-emi': 'phy-12',
    'ph-optics': 'phy-13',
    'ph-modern': 'phy-14',
    'ph-semi': 'phy-14',

    // Chemistry
    'ch-mole': 'chem-1',
    'ch-atom': 'chem-2',
    'ch-bond': 'chem-3',
    'ch-thermo': 'chem-4',
    'ch-equil': 'chem-5',
    'ch-electro': 'chem-6',
    'ch-kinetic': 'chem-7',
    'ch-goc': 'chem-8',
    'ch-carbo': 'chem-10',
    'ch-biomol': 'chem-10',
    'ch-periodic': 'chem-11',
    'ch-pblock': 'chem-12',

    // Mathematics
    'ma-sets': 'math-1',
    'ma-trig': 'math-12',
    'ma-cplx': 'math-2',
    'ma-quad': 'math-1',
    'ma-seq': 'math-4',
    'ma-perm': 'math-4',
    'ma-binom': 'math-3',
    'ma-mat': 'math-3',
    'ma-coor': 'math-10',
    'ma-calc': 'math-6',
    'ma-integ': 'math-9',
    'ma-prob': 'math-5',
  };

  return mapping[id] || id;
};

const mapDbQuestionToQuestion = (dbQ: any): Question => {
  return {
    id: dbQ.id,
    node_id: dbQ.node_id || dbQ.chapter_id || dbQ.topic_id || 'chapter',
    type: (dbQ.question_type || dbQ.type || 'MCQ') as any,
    exam_type: dbQ.exam_type || 'JEE',
    difficulty: (dbQ.difficulty || 'medium').toLowerCase() as any,
    question_text: dbQ.content?.question || dbQ.question_text || '',
    options: dbQ.content?.options || dbQ.options || {
      A: dbQ.option_a || '',
      B: dbQ.option_b || '',
      C: dbQ.option_c || '',
      D: dbQ.option_d || ''
    },
    answer: dbQ.answer || dbQ.correct_option || 'A',
    explanation: dbQ.metadata?.explanation || dbQ.explanation || dbQ.explanation_text || '',
    concept_tested: dbQ.metadata?.concept || dbQ.concept_tested || 'General',
    common_mistake: dbQ.metadata?.common_mistake,
    is_verified: dbQ.is_verified,
    generation_model: dbQ.metadata?.model || dbQ.generation_model,
  };
};

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
    
    const newOptions: { A: string; B: string; C: string; D: string } = { A: '', B: '', C: '', D: '' };
    let correctKey = 'A';
    
    ['A', 'B', 'C', 'D'].forEach((key, index) => {
      const originalOpt = shuffledOptions[index];
      newOptions[key as keyof typeof newOptions] = originalOpt.text;
      if (originalOpt.key === item.ans) {
        correctKey = key;
      }
    });

    return {
      id: `offline-${Date.now()}-${i}`,
      node_id: topicName,
      type: 'MCQ',
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

export interface ChapterSelection {
  chapterId: string;
  chapterName: string;
  subject: string;
  subchapterId?: string;
  subchapterName?: string;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string = 'Operation timed out'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    promise.then(
      res => { clearTimeout(timer); resolve(res); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

export const useTestQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'ai' | 'offline' | 'recovery' | 'idle' | 'fetching'>('idle');
  const { examMode, isCuet, isNeet } = useExamMode();
  const examModeUpper = examMode.toUpperCase() as 'JEE' | 'NEET' | 'CUET';

  // Fetch questions for mixed test (multiple chapters)
  const fetchMixedTestQuestions = async (
    chapters: ChapterSelection[],
    questionsPerChapter: number = 5
  ) => {
    setLoading(true);
    setLoadingMessage('Initializing test engine...');
    setError(null);
    setQuestions([]);
    setGenerationMode('fetching');

    try {
      const allQuestions: Question[] = [];

      // Fetch questions from each chapter
      for (const chapter of chapters) {
        setLoadingMessage(`Checking cache for ${chapter.chapterName}...`);
        try {
          const invokePromise = supabase.functions.invoke('generate-test', {
            body: {
              exam: examModeUpper,
              subject: chapter.subject,
              chapter: chapter.chapterName,
              chapterId: mapMockChapterIdToReal(chapter.chapterId),
              difficulty: 'medium',
              count: questionsPerChapter
            }
          });

          const { data, error: fnError } = await withTimeout(
            invokePromise,
            30000, // Allow up to 30s for inline generation when cache is completely empty
            'Edge function generation timed out'
          );

          if (fnError) {
            console.error('generate-test edge function error:', fnError);
            throw fnError;
          }

          if (data && data.questions) {
            if (data.generationMode?.includes('ai')) {
              setLoadingMessage(`Generated new questions for ${chapter.chapterName}...`);
            } else {
              setLoadingMessage(`Loaded ${chapter.chapterName} from cache...`);
            }

            const mapped = data.questions.map((q: any) => {
              const shuffledQ = shuffleQuestionOptions(q);
              return mapDbQuestionToQuestion(shuffledQ);
            });
            allQuestions.push(...mapped);
            setGenerationMode(data.generationMode || 'ai');

            // Fire and forget background trigger if threshold met
            if (data.triggerBackground) {
              supabase.functions.invoke('generate-test', {
                body: {
                  exam: examModeUpper,
                  subject: chapter.subject,
                  chapter: chapter.chapterName,
                  difficulty: 'medium',
                  count: data.backgroundCount || 100,
                  isBackgroundJob: true
                }
              }).catch(e => console.warn("Background trigger failed:", e));
            }
          }
        } catch (genErr) {
          console.error('Generation failed for chapter:', chapter.chapterName, genErr);
          // In production, we might want to alert the user or fallback to cached ONLY.
          // For now, we will just continue to the next chapter so the test doesn't completely fail.
        }
      }

      if (!allQuestions || allQuestions.length === 0) {
        console.warn("[TestEngine] Live generation returned 0 questions. Engaging self-healing offline fallback...");
        setLoadingMessage('Engaging offline self-healing engine...');
        
        for (const chapter of chapters) {
          try {
            const offlineQs = getOfflineQuestions(chapter.subject || 'Physics', chapter.chapterName, 'medium', questionsPerChapter);
            if (offlineQs && offlineQs.length > 0) {
              const mapped = offlineQs.map((q: any) => {
                const shuffledQ = shuffleQuestionOptions(q);
                return mapDbQuestionToQuestion(shuffledQ);
              });
              allQuestions.push(...mapped);
            } else {
              const mockQs = generateOfflineMockQuestions(chapter.chapterName, examModeUpper, 'medium', questionsPerChapter);
              allQuestions.push(...mockQs);
            }
          } catch (e) {
            console.error("Failed to load fallback questions for chapter:", chapter.chapterName, e);
          }
        }
      }

      if (!allQuestions || allQuestions.length === 0) {
        throw new Error('No questions could be generated or fetched. Please try again.');
      }

      // Shuffle all questions
      const shuffledAll = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledAll);
      return shuffledAll;
    } catch (err: any) {
      console.error('fetchMixedTestQuestions failed:', err);
      setError(err.message || 'Failed to generate test');
      setGenerationMode('idle');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch PYQ (Previous Year Questions) - questions with pyq_year set
  const fetchPYQQuestions = async (
    subject?: string,
    chapterId?: string,
    yearRange?: { start: number; end: number },
    count: number = 25
  ) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setGenerationMode('fetching');

    const mappedChapterId = chapterId ? mapMockChapterIdToReal(chapterId) : undefined;

    try {
      let query = supabase
        .from('questions')
        .select('*')
        .not('pyq_year', 'is', null);

      // Filter by subject if specified
      if (subject) {
        query = query.eq('subject', subject.toLowerCase());
      }

      // Filter by chapter if specified
      if (mappedChapterId) {
        query = query.eq('chapter_id', mappedChapterId);
      }

      // Filter by year range if specified
      if (yearRange) {
        query = query.gte('pyq_year', yearRange.start).lte('pyq_year', yearRange.end);
      }

      const { data: pyqQuestions, error: fetchError } = await withTimeout(
        Promise.resolve(query.limit(count)),
        2500,
        'Database query timed out'
      );

      if (fetchError) {
        throw fetchError;
      }

      if (pyqQuestions && pyqQuestions.length > 0) {
        // Shuffle the questions order, then shuffle options per question
        const shuffled = pyqQuestions.sort(() => Math.random() - 0.5);
        const mapped = shuffled.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapDbQuestionToQuestion(shuffledQ);
        });
        setQuestions(mapped);
        setGenerationMode('ai');
        return mapped;
      }

      // If no PYQs found, generate PYQ-style questions using the correct exam mode
      const defaultYearRange = isCuet
        ? { start: 2022, end: 2024 }
        : isNeet
        ? { start: 2013, end: 2024 }
        : { start: 2004, end: 2024 };

      let generatedData = null;
      let generatedError = null;
      try {
        const invokePromise = supabase.functions.invoke('generate-pyq-questions', {
          body: {
            subject,
            chapterId: mappedChapterId,
            yearRange: yearRange || defaultYearRange,
            count,
            examMode: examModeUpper,
          }
        });
        const { data, error: fnError } = await withTimeout(
          invokePromise,
          3000,
          'Edge function invocation timed out'
        );
        generatedData = data;
        generatedError = fnError;
      } catch (invokeErr) {
        console.warn('Failed to invoke generate-pyq-questions edge function:', invokeErr);
        generatedError = invokeErr;
      }

      // If edge function invocation failed, invoke unified generator or local simulator
      if (generatedError || !generatedData?.questions?.length) {
        try {
          const genPromise = getUnifiedQuestions({
            exam: examModeUpper,
            subject: subject || examModeUpper,
            chapter: mappedChapterId || 'General',
            difficulty: 'medium',
            count
          });
          const genResult = await withTimeout(
            genPromise,
            3000,
            'Unified PYQ generation timed out'
          );
          if (genResult?.questions?.length > 0) {
            const mapped = genResult.questions.map((q: any) => {
              const shuffledQ = shuffleQuestionOptions(q);
              return mapDbQuestionToQuestion(shuffledQ);
            });
            setQuestions(mapped);
            setGenerationMode(genResult.generationMode);
            return mapped;
          }
        } catch (genErr) {
          console.warn('Unified PYQ generation failed:', genErr);
        }

        // Final fallback to getOfflineQuestions directly
        const offlineQs = getOfflineQuestions(subject || examModeUpper, mappedChapterId || 'General', 'medium', count);
        const mapped = offlineQs.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapDbQuestionToQuestion(shuffledQ);
        });
        setQuestions(mapped);
        setGenerationMode('offline');
        return mapped;
      }

      if (generatedData?.questions) {
        const mappedQuestions = generatedData.questions.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapDbQuestionToQuestion(shuffledQ);
        });
        setQuestions(mappedQuestions);
        setGenerationMode('ai');
        return mappedQuestions;
      }

      const offlineQs = getOfflineQuestions(subject || examModeUpper, chapterId || 'General', 'medium', count);
      const mapped = offlineQs.map((q: any) => {
        const shuffledQ = shuffleQuestionOptions(q);
        return mapDbQuestionToQuestion(shuffledQ);
      });
      setQuestions(mapped);
      setGenerationMode('offline');
      return mapped;
    } catch (err) {
      console.warn('fetchPYQQuestions failed, silently falling back to offline generator:', err);
      const offlineQs = getOfflineQuestions(subject || examModeUpper, chapterId || 'General', 'medium', count);
      const mapped = offlineQs.map((q: any) => {
        const shuffledQ = shuffleQuestionOptions(q);
        return mapDbQuestionToQuestion(shuffledQ);
      });
      setQuestions(mapped);
      setGenerationMode('offline');
      setError(null);
      return mapped;
    } finally {
      setLoading(false);
    }
  };

  // Fetch adaptive questions based on user's weak areas
  const fetchAdaptiveQuestions = async (count: number = 15) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setGenerationMode('fetching');

    try {
      let generatedData = null;
      let generatedError = null;
      try {
        const invokePromise = supabase.functions.invoke('generate-adaptive-test', {
          body: { count }
        });
        const { data, error: fnError } = await withTimeout(
          invokePromise,
          3000,
          'Adaptive edge function timed out'
        );
        generatedData = data;
        generatedError = fnError;
      } catch (invokeErr) {
        console.warn('Failed to invoke generate-adaptive-test edge function:', invokeErr);
        generatedError = invokeErr;
      }

      if (generatedError || generatedData?.error || !generatedData?.questions?.length) {
        try {
          const genPromise = getUnifiedQuestions({
            exam: examModeUpper,
            subject: examModeUpper,
            chapter: 'Adaptive Practice',
            difficulty: 'medium',
            count
          });
          const genResult = await withTimeout(
            genPromise,
            3000,
            'Unified adaptive generation timed out'
          );
          if (genResult?.questions?.length > 0) {
            const mapped = genResult.questions.map((q: any) => {
              const shuffledQ = shuffleQuestionOptions(q);
              return mapDbQuestionToQuestion(shuffledQ);
            });
            setQuestions(mapped);
            setGenerationMode(genResult.generationMode);
            return mapped;
          }
        } catch (genErr) {
          console.warn('Unified adaptive generation failed:', genErr);
        }

        // Final fallback to getOfflineQuestions directly
        const offlineQs = getOfflineQuestions(examModeUpper, 'Adaptive Practice', 'medium', count);
        const mapped = offlineQs.map((q: any) => {
          const shuffledQ = shuffleQuestionOptions(q);
          return mapDbQuestionToQuestion(shuffledQ);
        });
        setQuestions(mapped);
        setGenerationMode('offline');
        return mapped;
      }

      const mappedQuestions = (generatedData.questions as any[]).map((q: any) => {
        const shuffledQ = shuffleQuestionOptions(q);
        return mapDbQuestionToQuestion(shuffledQ);
      });
      setQuestions(mappedQuestions);
      setGenerationMode('ai');
      return mappedQuestions;
    } catch (err) {
      console.warn('fetchAdaptiveQuestions failed, silently falling back to offline generator:', err);
      const offlineQs = getOfflineQuestions(examModeUpper, 'Adaptive Practice', 'medium', count);
      const mapped = offlineQs.map((q: any) => {
        const shuffledQ = shuffleQuestionOptions(q);
        return mapDbQuestionToQuestion(shuffledQ);
      });
      setQuestions(mapped);
      setGenerationMode('offline');
      setError(null);
      return mapped;
    } finally {
      setLoading(false);
    }
  };

  const recordAttempt = async (
    questionId: string,
    selectedOption: 'A' | 'B' | 'C' | 'D',
    isCorrect: boolean,
    timeTakenSeconds: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('question_attempts').insert({
        user_id: user.id,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        time_taken_seconds: timeTakenSeconds
      });
    } catch (err) {
      console.error('Failed to record attempt:', err);
    }
  };

  return {
    questions,
    loading,
    loadingMessage,
    error,
    generationMode,
    fetchMixedTestQuestions,
    fetchPYQQuestions,
    fetchAdaptiveQuestions,
    recordAttempt,
    setQuestions
  };
};
