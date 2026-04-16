import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuestionRequest {
  subchapterId: string;
  subchapterName: string;
  chapterId: string;
  chapterName: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  type?: "MCQ" | "INTEGER" | "MATCH";
  count?: number;
  examMode?: "JEE" | "NEET" | "CUET";
  forceNew?: boolean;
  excludeIds?: string[];
  seed?: number;
  sessionId?: string;
}

// ─── CUET SUBJECT-SPECIFIC EXAM PATTERNS ───
const CUET_SUBJECT_CONTEXT: Record<string, string> = {
  accountancy: `ACCOUNTANCY CUET PATTERN (NCERT Class 12 Accountancy Part 1 & 2):
- Journal entries: identify the correct entry for a given transaction
- Partnership: Profit sharing ratio, Goodwill valuation methods (Average profit / Super profit / Capitalisation)
- Admission/retirement of partner: new ratio, sacrificing ratio, revaluation entries
- Company accounts: Share issue at par/premium/discount, forfeiture & reissue entries
- Cash flow: classify activities as Operating / Investing / Financing
- Ratio analysis: Liquidity (Current ratio, Quick ratio), Solvency, Activity, Profitability — compute or interpret
- Financial statements: identify revenue vs capital items`,

  economics: `ECONOMICS CUET PATTERN (NCERT Class 11 & 12):
- Microeconomics: PED = % change in Qd / % change in P; Consumer equilibrium; Law of demand/supply shifts
- Production: TP, AP, MP curves; Law of Variable Proportions stages
- Market structures: Price determination in Perfect competition vs Monopoly
- Macroeconomics: GDP = C + I + G + (X-M); methods of GDP calculation
- Money multiplier = 1/LRR; Credit creation process
- Government Budget: Fiscal deficit = Total expenditure - Revenue receipts; Revenue vs Capital
- Balance of Payments: identify Current vs Capital account items`,

  business_studies: `BUSINESS STUDIES CUET PATTERN (NCERT Class 12):
- Identify Fayol's principle from a business scenario (all 14 principles testable)
- Taylor's Scientific Management: identify principle from situation
- Planning types: Policy vs Procedure vs Programme vs Budget vs Rule — match/identify
- Organising: Delegation chain, difference between delegation and decentralisation
- Staffing: External vs Internal recruitment, training methods (Vestibule, Apprenticeship, On-the-job)
- Directing: Maslow's hierarchy level identification; Theory X vs Y; Herzberg's two-factor
- Marketing Mix 4Ps: match element to example
- Consumer Protection Act 2019: Rights of consumer, District/State/National forum jurisdiction`,

  history: `HISTORY CUET PATTERN (NCERT Themes in Indian History I, II, III):
- Source-based: Given a passage/inscription → identify era, ruler, or significance
- Sequence: Put events in chronological order (e.g., 1857, Partition of Bengal, Jallianwala Bagh, Dandi March)
- Match: Leader ↔ Movement or Book ↔ Author
- Indus Valley: Key features — town planning, script, trade, decline theories
- Maurya empire: Ashoka's Dhamma, administration structure
- Bhakti & Sufi movements: saints, teachings, regional impact
- National Movement: Key sessions of INC, Acts, significant dates`,

  political_science: `POLITICAL SCIENCE CUET PATTERN (NCERT Class 11 & 12):
- Identify constitutional article by description (Art 14, 19, 21, 32, 44, 356, 360)
- Writ petitions: Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto — identify from situation
- Match: Fundamental Right ↔ Article number
- Emergency types: National (352), State (356), Financial (360) — distinguish
- Electoral: First Past the Post vs PR; Rajya Sabha election process
- International: Cold War timeline — arrange events; identify alliance/organisation from context`,

  geography: `GEOGRAPHY CUET PATTERN (NCERT Class 11 & 12):
- Plate tectonics: Convergent/Divergent/Transform — identify landform created
- Climate: Identify Koppen climate type from data table; monsoon mechanism
- Population: DTM model — identify stage from birth/death rate data
- Human Development: HDI components; identify country tier from index
- India: Identify state/region from crop/mineral/industry description
- River systems: Match river ↔ tributary ↔ state it flows through
- Transport: Golden Quadrilateral route; port classification`,

  psychology: `PSYCHOLOGY CUET PATTERN (NCERT Class 11 & 12 Psychology):
- Identify school of psychology from description (Structuralism, Behaviourism, Gestalt, Humanistic, Psychoanalytic)
- Match psychologist ↔ theory/experiment (Pavlov-Classical conditioning, Skinner-Operant, Piaget-Cognitive stages, Freud-Psychosexual, Maslow-Hierarchy)
- Memory: Atkinson-Shiffrin model stages; types of forgetting (decay, interference, retrieval failure)
- Intelligence: Spearman's g, Thurstone's PMA, Gardner's MI — identify from description
- Personality theories: Big Five traits (OCEAN), Freudian structure (Id/Ego/Superego)
- Psychological disorders: DSM-5 categories — identify disorder from symptoms`,

  sociology: `SOCIOLOGY CUET PATTERN (NCERT Class 11 Introducing Sociology + Class 12 Indian Society):
- Identify sociologist from concept: Durkheim (anomie, collective conscience), Weber (rationalisation, ideal type), Marx (alienation, class struggle)
- Case-based: Read a social scenario → identify institution (family/religion/economy/polity/education)
- Caste: Distinguish Varna from Jati; Jajmani system; Reservation and social justice
- Family types: Nuclear vs Joint vs Extended; kinship terminology (consanguinal vs affinal)
- Social movements: Reform (Brahmo Samaj) vs Revolutionary; Old vs New social movements
- Globalisation impact on Indian society: cultural homogenisation, diaspora`,

  english: `ENGLISH CUET PATTERN (Section IA):
- Unseen passage (factual or literary, 200-250 words) → 5 MCQs: main idea, inference, vocabulary in context, factual detail, title
- Grammar: Identify error in underlined parts of sentence (tense, articles, prepositions, subject-verb agreement)
- Vocabulary: Synonym / antonym / one-word substitution / idiom meaning
- Para-jumbles: 5 sentences labelled P Q R S, find correct sequence after given first/last sentence
- Cloze test: 5 blanks in a paragraph, choose best fitting word from 4 options
NOTE: Generate standalone MCQs (not actual passages). Each question should test one specific skill.`,

  general_test: `GENERAL TEST CUET PATTERN (Section III):
- Logical Reasoning: Syllogisms (given 2 premises → which conclusion follows?), Blood relations (X is Y's... who is Z?), Seating arrangement, Direction sense
- Series: Number series (find next term); Letter series; Alphanumeric series
- Coding-Decoding: If A=1, B=2 type; Letter shift codes
- Quantitative Aptitude: Percentage, Ratio-Proportion, Profit-Loss, Time-Work, SI=PRT/100, CI, Average, Speed-Distance-Time
- Data Interpretation: Simple bar chart or table — read and calculate %
All questions: Class 8-10 level math, solvable without calculator in under 90 seconds.`,

  physics: `PHYSICS CUET PATTERN (NCERT Class 12 Physics):
- Electrostatics: F = kq₁q₂/r² calculation; E-field at a point; V at centre of dipole
- Current Electricity: Kirchhoff's laws application; Wheatstone bridge balance condition
- Magnetism: Force F = qvB; Torque on dipole; Biot-Savart law concept
- EMI: Faraday's law ε = -dΦ/dt; Lenz's law direction; AC circuit concepts
- Optics: Mirror formula 1/f = 1/v + 1/u; Lens formula; Snell's law; Young's double slit fringe width
- Modern Physics: λ = h/mv (de Broglie); E_k = hν - φ; BE/nucleon graph concept
NCERT exercise level — not JEE advanced derivations`,

  chemistry: `CHEMISTRY CUET PATTERN (NCERT Class 12 Chemistry):
- Solid state: Unit cell types (simple cubic, BCC, FCC); coordination number; packing efficiency
- Solutions: ΔTb = Kb × m; ΔTf = Kf × m; π = MRT; Henry's law KH = p/x
- Electrochemistry: Nernst equation; SHE; EMF = E°cathode - E°anode; Faraday's 1st law
- Chemical kinetics: Rate = k[A]^m[B]^n; t½ for 1st order = 0.693/k; Arrhenius equation
- Coordination: IUPAC name; EAN rule; isomerism types (geometrical, optical, linkage)
- Organic: Named reactions (identify product); mechanism (SN1 vs SN2 from substrate structure)`,

  mathematics: `MATHEMATICS CUET PATTERN (NCERT Class 12 Mathematics):
- Relations & Functions: Types of relations; Bijective function conditions; inverse function
- Matrices: Order of product AB; determinant properties; adjoint; inverse
- Differentiation: dy/dx of composite functions; Rolle's & Lagrange's theorem application
- Integration: Standard integrals; integration by parts; definite integral evaluation
- Differential Equations: Order/degree identification; variable separable solution
- Vectors: |a × b| = ab sinθ; a · b = ab cosθ; section formula in 3D
- LP: Identify feasible region from constraints; corner point values
NCERT exercise-level — NOT JEE advanced`,

  biology: `BIOLOGY CUET PATTERN (NCERT Class 11 & 12 Biology):
- Reproduction: Parts of flower and function; double fertilisation; types of pollination
- Genetics: Monohybrid/dihybrid ratios; codominance; sex-linked inheritance (haemophilia, colour blindness)
- Molecular Biology: Semi-conservative replication; RNA polymerase; codon-anticodon relationship
- Evolution: Lamarck vs Darwin; evidences (comparative anatomy, fossils); Hardy-Weinberg
- Human Health: Pathogens → disease → symptoms (malaria, TB, AIDS, typhoid); vaccines
- Ecology: Food chain vs web; pyramid of biomass/energy/numbers; biogeochemical cycle steps`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subchapterId,
      subchapterName,
      chapterId,
      chapterName,
      subject,
      difficulty,
      type = "MCQ",
      count = 5,
      examMode = "JEE",
      forceNew = false,
      excludeIds = [],
      seed = Date.now(),
      sessionId,
    }: QuestionRequest = await req.json();

    const isNeet = examMode === "NEET";
    const isCuet = examMode === "CUET";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ─── CACHE LOOKUP (skipped for forceNew) ───
    if (!forceNew) {
      let query = supabase
        .from("questions")
        .select("*")
        .eq("subchapter_id", subchapterId)
        .eq("difficulty", difficulty)
        .eq("type", type);

      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.map((id) => `"${id}"`).join(",")})`);
      }

      const { data: cachedQuestions } = await query.limit(count);
      if (cachedQuestions && cachedQuestions.length >= count) {
        return new Response(JSON.stringify({ questions: cachedQuestions.slice(0, count), cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ─── DIFFICULTY LABELS ───
    const difficultyMap: Record<string, string> = {
      easy: isCuet
        ? "NCERT direct recall, 30-45s solve time, definition/fact based"
        : isNeet
        ? "NCERT level, single-concept, direct recall"
        : "NCERT level, single-concept, 30-60s solve time",
      medium: isCuet
        ? "CUET application level, NCERT example variation, 45-75s"
        : isNeet
        ? "NEET UG level, 2-3 concepts, 1-2 min"
        : "JEE Mains level, 2-3 concepts, 1-2 min",
      hard: isCuet
        ? "CUET challenging, multi-concept NCERT, requires analysis, 60-90s"
        : isNeet
        ? "NEET advanced, multi-concept, 2-4 min"
        : "JEE Advanced level, multi-concept, 2-4 min",
    };

    const uniquenessInstruction = `SEED: ${seed}. Generate questions NOT typically seen in standard question banks. Vary the angle of testing and scenario each time.`;

    // ─── CUET QUESTION TYPE ROTATION ───
    // CUET UG uses 5 question types — rotate so students see variety
    const cuetQTypes = ["MCQ", "MCQ", "ASSERTION_REASON", "SEQUENCE", "CASE_BASED", "MCQ"] as const;
    const cuetQType = cuetQTypes[seed % cuetQTypes.length];

    const subjectKey = subject.toLowerCase().replace(/\s+/g, "_");
    const subjectContext = CUET_SUBJECT_CONTEXT[subjectKey] || "";

    // ─── BUILD PROMPTS ───
    let systemPrompt = "";
    let userPrompt = "";

    if (isCuet) {
      // CUET BASE SYSTEM
      systemPrompt = `You are an NTA official CUET UG question setter with 10 years of experience. You create questions EXACTLY as they appear in the official CUET UG paper.

ABSOLUTE CUET RULES:
1. STRICTLY NCERT Class 11-12 only — zero content outside NCERT scope
2. Test: Definition recall (30%), Concept application (40%), NCERT example variation (20%), Identify/match (10%)
3. Each wrong option must be a genuine misconception — no obviously silly distractors
4. Speed-based exam: questions solvable in 30-90 seconds without detailed calculation
5. Difficulty: ${difficulty} — ${difficultyMap[difficulty]}
6. Topic: ${subject} → ${chapterName} → ${subchapterName}
7. DO NOT mention JEE, NEET, IIT, or any competitive exam in the content
8. ${uniquenessInstruction}

${subjectContext}`;

      if (cuetQType === "ASSERTION_REASON") {
        userPrompt = `Generate ${count} Assertion-Reason questions for "${subchapterName}" (${subject} — ${chapterName}).

FORMAT (NTA official):
Assertion (A): [A clear factual statement from NCERT]
Reason (R): [A related NCERT-based explanatory statement]

In the light of the above statements, choose the most appropriate answer from the options given below:

The 4 options are ALWAYS identical for all Assertion-Reason questions:
A) Both A and R are true and R is the correct explanation of A
B) Both A and R are true but R is NOT the correct explanation of A  
C) A is true but R is false
D) A is false but R is true

Vary the correct answer across your questions (not all A).

Return ONLY valid JSON array:
[{
  "question_text": "Assertion (A): ...\\nReason (R): ...\\n\\nIn the light of the above statements, choose the most appropriate answer from the options given below:",
  "option_a": "Both A and R are true and R is the correct explanation of A",
  "option_b": "Both A and R are true but R is NOT the correct explanation of A",
  "option_c": "A is true but R is false",
  "option_d": "A is false but R is true",
  "correct_option": "A/B/C/D",
  "explanation": "Whether A is true/false, whether R is true/false, and if R explains A",
  "concept_tested": "specific concept",
  "common_mistake": "why students pick wrong option"
}]`;

      } else if (cuetQType === "SEQUENCE") {
        userPrompt = `Generate ${count} Arrange-in-Correct-Order questions for "${subchapterName}" (${subject}).

FORMAT (NTA official):
Question: "Arrange the following ... in the correct order:"
(i) [item]  (ii) [item]  (iii) [item]  (iv) [item]
Options show sequences like: (i)-(iii)-(iv)-(ii)

Return ONLY valid JSON array:
[{
  "question_text": "Arrange the following [events/steps/stages/concepts] in the correct [chronological/logical/process] order:\\n(i) [item]\\n(ii) [item]\\n(iii) [item]\\n(iv) [item]",
  "option_a": "(i)-(ii)-(iii)-(iv)",
  "option_b": "(ii)-(i)-(iv)-(iii)",
  "option_c": "(iii)-(i)-(ii)-(iv)",
  "option_d": "(iv)-(iii)-(ii)-(i)",
  "correct_option": "A/B/C/D",
  "explanation": "Brief reason for each step in the correct sequence",
  "concept_tested": "specific concept/process",
  "common_mistake": "which two steps students commonly swap and why"
}]`;

      } else if (cuetQType === "CASE_BASED") {
        userPrompt = `Generate a Case/Passage-based question set for "${subchapterName}" (${subject} — ${chapterName}).

Write ${Math.min(count, 4)} MCQs based on ONE short NCERT-aligned passage (max 80 words). The passage must be realistic and directly from NCERT content.

Return ONLY valid JSON array (the passage appears in the first question_text, subsequent ones reference "the passage above"):
[{
  "question_text": "Read the following passage carefully and answer the questions that follow:\\n\\n[60-80 words NCERT-aligned passage about ${subchapterName}]\\n\\nQ: [First specific question about the passage]",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "Which part of the passage supports this answer",
  "concept_tested": "${subchapterName}",
  "common_mistake": "..."
},
{
  "question_text": "Based on the passage above, [second question]",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "...",
  "concept_tested": "${subchapterName}",
  "common_mistake": "..."
}]`;

      } else {
        // Standard CUET MCQ
        userPrompt = `Generate exactly ${count} CUET UG standard MCQs for "${subchapterName}" (${subject} — ${chapterName}).

CUET MCQ STANDARDS:
- Stem: 1-2 sentences, directly from NCERT language
- Mix: direct recall (35%), concept application (35%), match/identify pairs (20%), NCERT example variation (10%)
- All 4 options plausible — wrong options from real NCERT misconceptions
- At least ${Math.floor(count / 3)} "Match List I with List II" or "Identify the correct pair" type questions
- At least ${Math.floor(count / 4)} "Which of the following statements is/are correct? (i) (ii) (iii)" type
- Avoid repeating the same question structure consecutively

Return ONLY valid JSON array (no markdown, no code fence):
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "NCERT chapter/page reference + reasoning (max 80 words)",
  "concept_tested": "precise sub-concept from ${chapterName}",
  "common_mistake": "specific student error from NCERT misconception"
}]`;
      }

    } else if (isNeet) {
      systemPrompt = `You are an expert NEET UG question designer. Create authentic NEET-style MCQs.

NEET STANDARDS:
- Strictly NCERT-based, no questions beyond NCERT scope
- Biology: diagrams, definitions, organisms, functions, processes
- Chemistry: reactions, mechanisms, properties as per NCERT
- Physics: numericals and conceptual questions from NCERT
- Each wrong option must stem from a real NCERT misconception
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Topic: ${subject} > ${chapterName} > ${subchapterName}
- ${uniquenessInstruction}`;

      userPrompt = `Generate exactly ${count} NEET UG MCQs for "${subchapterName}" (${subject} — ${chapterName}) at ${difficulty} difficulty.

Return ONLY a valid JSON array (no markdown):
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "NCERT-based explanation (max 100 words)",
  "concept_tested": "Concept name",
  "common_mistake": "Common NCERT-based error"
}]

Rules: All 4 options must be plausible. No obviously incorrect distractors.`;

    } else {
      // JEE
      systemPrompt = `You are an expert JEE question designer. Create authentic JEE-style MCQs for ${subject}.

JEE STANDARDS:
- NUMERICAL: Use real values (mass=2kg, force=10N). State GIVEN and REQUIRED clearly.
- NO vague theory. Test measurable relationships.
- NOTATION: F=ma, V=IR, x². Unicode symbols (α β θ λ μ ρ ω ε Δ π).
- SOLUTIONS: Step1 → Step2 → Answer: [value with unit]
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Topic: ${subject} > ${chapterName} > ${subchapterName}
- ${uniquenessInstruction}`;

      userPrompt = `Generate exactly ${count} JEE-style MCQs for "${subchapterName}" (${subject} — ${chapterName}) at ${difficulty} difficulty.

Return ONLY a valid JSON array (no markdown):
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "Step-by-step: Given → Formula → Calculation → Answer (max 120 words)",
  "concept_tested": "Concept name",
  "common_mistake": "Error → wrong option"
}]

Rules: Unicode notation only. Explanations under 120 words. All options plausible.`;
    }

    // ─── CALL AI ───
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: forceNew ? 0.85 : 0.6,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    // ─── PARSE JSON ───
    let questions;
    try {
      let jsonContent = content.trim();
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) jsonContent = codeBlockMatch[1].trim();

      try {
        questions = JSON.parse(jsonContent);
      } catch {
        let sanitized = "";
        let inString = false;
        let escaped = false;
        for (let i = 0; i < jsonContent.length; i++) {
          const ch = jsonContent[i];
          if (escaped) { sanitized += ch; escaped = false; continue; }
          if (ch === "\\" && inString) { sanitized += ch; escaped = true; continue; }
          if (ch === '"') { inString = !inString; sanitized += ch; continue; }
          if (inString) {
            if (ch === "\n") { sanitized += "\\n"; continue; }
            if (ch === "\r") continue;
            if (ch === "\t") { sanitized += "\\t"; continue; }
          }
          sanitized += ch;
        }
        questions = JSON.parse(sanitized);
      }

      if (!Array.isArray(questions)) throw new Error("Response is not an array");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content.substring(0, 300));
      throw new Error("Failed to parse questions from AI");
    }

    // ─── STORE IN DB ───
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: subchapterId,
      chapter_id: chapterId,
      subject: subjectKey,
      difficulty,
      type,
      question_text: q.question_text,
      option_a: q.option_a || null,
      option_b: q.option_b || null,
      option_c: q.option_c || null,
      option_d: q.option_d || null,
      correct_option: q.correct_option ? q.correct_option.toUpperCase() : null,
      integer_answer: q.integer_answer !== undefined ? q.integer_answer : null,
      tolerance: q.tolerance !== undefined ? q.tolerance : 0,
      match_pairs: q.match_pairs || null,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      source: forceNew ? "ai_b2b" : "ai_generated",
      ...(sessionId ? { session_id: sessionId } : {}),
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      return new Response(JSON.stringify({ questions: questionsToInsert.map((q: any, i: number) => ({ ...q, id: `temp-${seed}-${i}` })), cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: insertedQuestions, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
