import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Class-specific diagnostic configuration
const CLASS_CONFIG: Record<string, {
  label: string;
  goal: string;
  subjects: string[];
  sections: { name: string; difficulty: string; count: number; focus: string }[];
  topics: string;
  style: string;
  aiDetects: string;
  '6': {
    label: 'Class 6 — Foundation Awareness',
    goal: 'Check basic thinking ability & number sense',
    subjects: ['Mathematics', 'Science', 'Logic'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 4, focus: 'Basic arithmetic, fractions, patterns' },
      { name: 'Understanding', difficulty: 'medium', count: 3, focus: 'Simple reasoning & observation' },
      { name: 'Thinking', difficulty: 'adaptive', count: 2, focus: 'Visual reasoning & curiosity' },
      { name: 'Speed', difficulty: 'mixed', count: 1, focus: 'Quick number sense checks' },
    ],
    topics: 'Fractions comparison, pattern continuation (2,4,8,__?), unit understanding (length, weight, time), everyday science reasoning (Why does ice melt? Why do shadows change?), basic shapes & symmetry, counting & grouping',
    style: 'Visual reasoning, simple arithmetic logic, basic science understanding. Questions should feel like puzzles, NOT exam pressure. Use friendly language.',
    aiDetects: 'Numerical comfort, observation ability, logical curiosity',
  },
  '7': {
    label: 'Class 7 — Concept Formation',
    goal: 'Check whether student understands relationships between concepts',
    subjects: ['Mathematics', 'Science', 'Logic'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 7, focus: 'Ratio, proportion, basic algebra' },
      { name: 'Understanding', difficulty: 'medium', count: 7, focus: 'Cause-effect & scientific reasoning' },
      { name: 'Thinking', difficulty: 'adaptive', count: 4, focus: 'Early abstraction thinking' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Quick relationship detection' },
    ],
    topics: 'Ratio & proportion, basic algebra intuition, scientific reasoning, if speed doubles what happens to time, simple equation reasoning, force & motion intuition (non-formula), heat & temperature concepts',
    style: 'Concept relationship questions. Check if student sees connections between ideas, not just memorized facts. Avoid complex formulas.',
    aiDetects: 'Early abstraction thinking, cause-effect understanding',
  },
  '8': {
    label: 'Class 8 — Pre-Algebra & Visualization',
    goal: 'Detect transition from arithmetic → algebraic thinking',
    subjects: ['Mathematics', 'Science', 'Logic'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 6, focus: 'Linear expressions, basic geometry' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Graph interpretation, physics visualization' },
      { name: 'Thinking', difficulty: 'adaptive', count: 4, focus: 'Symbol manipulation & spatial reasoning' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Quick algebraic checks' },
    ],
    topics: 'Linear expressions (find value of x), area comparison problems, motion diagrams, graph interpretation, basic physics visualization, percentage & profit-loss reasoning, exponents',
    style: 'Focus on the transition from numbers to symbols. Test if student can work with variables and interpret visual information like graphs and diagrams.',
    aiDetects: 'Symbol understanding, visualization ability',
  },
  '9': {
    label: 'Class 9 — Conceptual Learning Readiness',
    goal: 'Check readiness for real science & algebra',
    subjects: ['Mathematics', 'Science', 'Logic'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 6, focus: 'Core concept recall' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Concept application & reasoning' },
      { name: 'Thinking', difficulty: 'adaptive', count: 4, focus: 'Misconception detection' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Quick concept checks' },
    ],
    topics: 'Concept-based physics (Why heavier objects don\'t fall faster), algebra manipulation, identify chemical vs physical change, motion equations intuition, coordinate geometry basics, atomic structure reasoning',
    style: 'Concept vs memorization testing. Include common misconception traps. Check if student actually understands WHY, not just WHAT.',
    aiDetects: 'Concept vs memorization, misconception patterns',
  },
  '10': {
    label: 'Class 10 — Board + Logic Stability',
    goal: 'Measure conceptual maturity before advanced learning',
    subjects: ['Mathematics', 'Science', 'Logic'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 6, focus: 'Core concepts across subjects' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Multi-step problems' },
      { name: 'Thinking', difficulty: 'adaptive', count: 4, focus: 'Application & analysis' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Accuracy under time' },
    ],
    topics: 'Slope interpretation, current flow reasoning, probability intuition, quadratic equations, chemical bonding logic, lens/mirror concepts, trigonometry application, real-world physics problems',
    style: 'Multi-step reasoning, graph-based problems, real-world application. Test problem-solving flow and accuracy under gentle pressure.',
    aiDetects: 'Problem-solving flow, accuracy under pressure',
  },
  '11': {
    label: 'Class 11 — Competitive Readiness Scan',
    goal: 'Check transition into higher-order thinking',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 6, focus: 'Fundamental concept check' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Conceptual depth & application' },
      { name: 'Thinking', difficulty: 'adaptive', count: 4, focus: 'Analytical reasoning' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'JEE/NEET style quick checks' },
    ],
    topics: 'Relative motion reasoning, function behavior, mole concept intuition, vectors, kinematics, basic thermodynamics, sets & relations, chemical bonding, equilibrium basics',
    style: 'Conceptual physics questions, algebraic manipulation, basic derivation logic. JEE/NEET style but checking understanding, not speed alone.',
    aiDetects: 'Depth of understanding, mathematical maturity',
  },
  '12': {
    label: 'Class 12 — Advanced Concept Integration',
    goal: 'Check integration across topics',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 5, focus: 'Core concept recall' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Multi-concept integration' },
      { name: 'Thinking', difficulty: 'adaptive', count: 5, focus: 'Analytical & cross-topic' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Exam-pressure simulation' },
    ],
    topics: 'Energy conservation scenarios, calculus intuition, organic reaction logic, electromagnetic induction, integration, matrices, electrochemistry, optics, probability & statistics',
    style: 'Multi-concept questions, analytical reasoning, application-based problems. Check concept linking ability across chapters.',
    aiDetects: 'Concept linking ability, analytical thinking',
  },
  'dropper': {
    label: 'Dropper — Competitive Intelligence Check',
    goal: 'Find WHY performance previously failed',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    sections: [
      { name: 'Foundation', difficulty: 'easy', count: 4, focus: 'Foundation gap detection' },
      { name: 'Understanding', difficulty: 'medium', count: 8, focus: 'Concept depth check' },
      { name: 'Thinking', difficulty: 'adaptive', count: 6, focus: 'Trap questions & analytical' },
      { name: 'Speed', difficulty: 'mixed', count: 4, focus: 'Time-pressure performance' },
    ],
    topics: 'Mixed JEE/NEET conceptual questions, trap-based questions, time-pressure problems, frequently confused concepts, multi-step derivations, common exam mistakes',
    style: 'Include trap questions that test if mistakes come from concept gaps vs exam pressure. Mix easy foundation checks with hard analytical problems to find exact breakdown points.',
    aiDetects: 'Concept gaps vs exam pressure, speed vs accuracy imbalance, confidence breakdown points',
  },
};

// Map class string to grade_range for backward compat
function getClassFromInput(gradeRange: string, studentLevel: string, studentClass?: string): string {
  if (studentClass && CLASS_CONFIG[studentClass]) return studentClass;
  if (gradeRange === '6-8') return '7'; // default middle of range
  if (gradeRange === '9-10') return '9';
  return '11';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { gradeRange, studentLevel, count = 22, studentClass } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const classKey = getClassFromInput(gradeRange, studentLevel, studentClass);
    const config = CLASS_CONFIG[classKey] || CLASS_CONFIG['11'];
    const totalQuestions = config.sections.reduce((s, sec) => s + sec.count, 0);

    const sectionPrompt = config.sections.map(sec =>
      `Section "${sec.name}" (${sec.difficulty} difficulty): ${sec.count} questions — ${sec.focus}`
    ).join('\n');

    const prompt = `You are an expert Indian education assessment designer for SETU Learning Platform.

ASSESSMENT: ${config.label}
GOAL: ${config.goal}

Generate exactly ${totalQuestions} diagnostic questions structured in 4 sections:

${sectionPrompt}

SUBJECTS: ${config.subjects.join(', ')}
Distribute questions evenly across subjects.

TOPICS TO COVER:
${config.topics}

QUESTION STYLE:
${config.style}

AI DETECTION GOALS:
${config.aiDetects}

CRITICAL RULES:
1. Questions must be age-appropriate and match the class level exactly
2. For "adaptive" sections, include questions where wrong answers reveal prerequisite gaps
3. Include prerequisite_topic for questions that test advanced concepts
4. Each question must have EXACTLY ONE correct answer
5. Explanations should be encouraging, not judgmental (use "Think about it this way..." style)
6. For classes 6-8: NO complex formulas, keep language simple and friendly
7. For classes 9-10: Can use basic formulas but focus on conceptual understanding
8. For classes 11-12 & dropper: JEE/NEET level conceptual questions

IMPORTANT - TWO-PASS VERIFICATION:
PASS 1: Solve each question completely to find the exact answer.
PASS 2: Verify the correct_option matches your solution exactly.
If no option matches, regenerate the question. NEVER select "closest" option.

Return a JSON array of objects with these exact fields:
- subject (string)
- topic (string)
- subtopic (string or null)
- difficulty ("easy" | "medium" | "hard")
- skill_tested ("concept" | "logic" | "calculation" | "reading" | "prerequisite")
- question_text (string)
- option_a (string)
- option_b (string)
- option_c (string)
- option_d (string)
- correct_option ("A" | "B" | "C" | "D")
- explanation (string, 1-2 sentences, encouraging tone)
- prerequisite_topic (string or null - what foundational topic must be understood first)

Order questions by section: Foundation first, then Understanding, then Thinking, then Speed.
Return ONLY the JSON array, no markdown or extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert Indian education assessment designer. Generate high-quality, age-appropriate diagnostic questions. Every answer must be verified. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse generated questions");
    }

    // Add IDs and class metadata
    questions = questions.map((q: any, i: number) => ({
      ...q,
      id: `diag-${classKey}-${Date.now()}-${i}`,
      grade_range: gradeRange,
      class_level: classKey,
    }));

    return new Response(JSON.stringify({
      questions,
      meta: {
        classLevel: classKey,
        label: config.label,
        goal: config.goal,
        totalQuestions,
        sections: config.sections,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
