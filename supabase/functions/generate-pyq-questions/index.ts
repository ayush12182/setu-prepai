import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PYQRequest {
  subject?: string;
  chapterId?: string;
  subchapterId?: string;
  subchapterName?: string;
  chapterName?: string;
  yearRange?: { start: number; end: number };
  count?: number;
  examMode?: "JEE" | "NEET" | "CUET";
}

// ─── CUET PYQ YEAR DATA ───
// CUET UG first started in 2022. Papers are NTA-official.
const CUET_YEAR_RANGE = { start: 2022, end: 2024 };

// ─── CUET SUBJECT PYQ PATTERNS (NTA verified patterns 2022-2024) ───
const CUET_PYQ_PATTERNS: Record<string, string> = {
  accountancy: `CUET ACCOUNTANCY PYQ PATTERNS (2022-2024, NCERT Class 12):
Most repeated question types from actual CUET papers:
- Partnership: "A and B are partners sharing profits in 3:2 ratio. C is admitted for 1/4 share. Find new ratio." (Calculation)
- Goodwill: "Which method of goodwill valuation gives higher value when super profits exist?" (Conceptual)
- Company accounts: "Shares of ₹10 each issued at ₹12. Pass journal entry for application money." (Entry identification)
- Cash flow: "Interest paid by a company is classified under which activity in cash flow statement?" (Classification MCQ)
- Ratio analysis: "Current Ratio = 2:1, Quick Ratio = 1.5:1. What is the value of inventory if current assets = ₹60,000?" (Calculation)
- NPO: "What is the treatment of Life Membership Fees in accounts of a Not-for-Profit Organisation?" (Conceptual)
2022-2024 trend: Heavy on Partnership (30%), Company Accounts (25%), Ratio Analysis (20%). Use these weightages.`,

  economics: `CUET ECONOMICS PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:  
- "When price of a good falls from ₹10 to ₹8 and quantity demanded rises from 100 to 140 units, PED is:" (Calculation: 2, elastic)
- "Which of the following is NOT a feature of monopolistic competition?" (MCQ: product differentiation, price maker etc.)
- "If MPC = 0.8, the value of investment multiplier is:" (K = 1/(1-MPC) = 5)
- "Fiscal deficit = Revenue deficit + ___" (Fill: Capital expenditure - Capital receipts excluding borrowings)
- Assertion: "RBI increases CRR. Reason: This will reduce money supply." (Assertion-Reason)
- "Identify the category: Taxes, Dividends from PSUs, Interest on loans given by government" (Revenue receipts)
2022-2024 trend: Macroeconomics (50%), Microeconomics (35%), Indian Economy (15%).`,

  business_studies: `CUET BUSINESS STUDIES PYQ PATTERNS (2022-2024, NCERT Class 12):
Most repeated from actual CUET papers:
- Scenario MCQ: "A manager ensures that each subordinate reports to only one superior. Which principle?" (Unity of Command)
- "Match List I (Principle) with List II (Manager's action)": Fayol principles matching
- "Vestibule training is most suitable for:": Identify the correct occupation/context
- "Which is NOT a function of financial market?" (Capital formation, liquidity, mobilisation — elimination type)
- Case-based: Mini company scenario → identify management function being performed
- "Consumer Protection Act 2019 — District Commission handles complaints up to ₹___ lakh worth"
- "Marketing mix element: Value-based pricing belongs to which P?" (Price)
2022-2024 trend: Management functions (40%), Marketing (25%), Finance (20%), Consumer Protection (15%).`,

  history: `CUET HISTORY PYQ PATTERNS (2022-2024, NCERT Themes in Indian History I, II, III):
Most repeated from actual CUET papers:
- Source-based: Short inscriptions/quotes given → identify ruler, period, significance
- "Match the historian with the source they used:" (e.g., Kautilya - Arthashastra)
- Chronological sequence: Freedom struggle events in order
- "Which of the following best describes the concept of Dhamma as propagated by Ashoka?"
- "Assertion (A): Partition of Bengal 1905 intensified nationalist feelings. Reason (R): It was seen as a deliberate attempt to divide Hindus and Muslims."
- "The practice of Sati was legally abolished by:" (William Bentinck, Bengal Sati Regulation 1829)
- Source passage from NCERT Themes → 3 MCQs about it
2022-2024 trend: Source-based (30%), Modern India/Freedom (35%), Medieval (20%), Ancient (15%).`,

  political_science: `CUET POLITICAL SCIENCE PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:
- "Which article of the Indian Constitution abolishes untouchability?" (Art. 17)
- "Assertion (A): The Indian Constitution provides for a federal system. Reason (R): There is a dual polity — Centre and State."
- Scenario → identify writ: "A person is detained without trial. Which writ can court issue?" (Habeas Corpus)
- Match: Constitutional body ↔ Related Article
- "Which Emergency provision is invoked when financial stability of India is threatened?" (Art. 360)
- "SAARC was established in the year:" (1985, Dhaka)
- Sequence: Arrange events of Cold War in chronological order
2022-2024 trend: Indian Constitution (50%), Contemporary World Politics (30%), Political Theory (20%).`,

  geography: `CUET GEOGRAPHY PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:
- "Match irrigation type with region/state where it is most common"
- "The Brahmaputra River enters India through which state?" (Arunachal Pradesh)
- "Which soil type is most suitable for cotton cultivation?" (Black/Regur soil)
- "Arrange in increasing order of HDI: India, Sri Lanka, Nepal, Pakistan"
- Map-based: "Identify the industrial region from the given description: Iron and steel, coal belt, most urbanised..."
- "Koppen's 'Aw' climate is characterised by:" (Tropical savanna with distinct dry season)
- Assertion: "Population density in Rajasthan is low. Reason: It has the largest area but desert terrain."
2022-2024 trend: India (Physical + Human) (60%), World Geography (40%).`,

  psychology: `CUET PSYCHOLOGY PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:
- "Match the psychologist with the theory": Pavlov-Classical conditioning, Skinner-Operant
- "According to Maslow, which need comes after safety needs?" (Love and Belongingness)
- "Assertion (A): IQ = MA/CA × 100. Reason (R): It is a measure of general intelligence."
- "Which of the following is a projective test of personality?" (Rorschach Inkblot / TAT)
- "The stage of concrete operational thinking in Piaget's theory is seen in age group:" (7-11 years)
- "A person who washes hands 50 times a day. Identify the disorder." (OCD)
- Case scenario → identify type of defence mechanism (Repression, Rationalisation, Projection etc.)
2022-2024: Personality (25%), Intelligence (20%), Disorders (20%), Learning (15%), Development (20%).`,

  sociology: `CUET SOCIOLOGY PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:
- "Who coined the term 'Sociology'?" (Auguste Comte)
- "Match sociologist with concept: Durkheim - Anomie, Weber - Verstehen, Marx - Class struggle"
- Case scenario → identify social institution involved
- "Assertion (A): Caste system in India is a closed system. Reason (R): Social mobility is restricted by birth."
- "Which movement is associated with the demand for women's right to property in India?"
- "Jajmani system refers to:" (Traditional exchange of services between castes)
- Passage from NCERT-style source → 3 related MCQs
2022-2024 trend: Indian Society (50%), Social Change (25%), Sociology Theory (25%).`,

  physics: `CUET PHYSICS PYQ PATTERNS (2022-2024, NCERT Class 12):
Most repeated from actual CUET papers:
- "Two charges 4μC and -2μC are separated by 30cm. What is the electric field at the midpoint?"
- "A conducting sphere of radius R has charge Q. What is the electric potential at its centre?" (= kQ/R)
- "In a series LCR circuit at resonance, impedance equals:" (Resistance R)
- "de Broglie wavelength of a particle of mass m and kinetic energy K is:" (λ = h/√(2mK))
- "In Young's double slit experiment, fringe width β = λD/d. If d is halved, β becomes:" (2β)
- Assertion-Reason: Faraday's law and Lenz's law
- "Which gate gives output 1 only when both inputs are 0?" (NOR gate)
2022-2024: Modern Physics + Electronics (30%), Electromagnetism (30%), Optics (20%), Mechanics (20%).`,

  chemistry: `CUET CHEMISTRY PYQ PATTERNS (2022-2024, NCERT Class 12):
Most repeated from actual CUET papers:
- "Which of the following is a lyophilic colloid?" (Starch, gelatin - match type)
- "The IUPAC name of CH₃-CH(OH)-CH₂-CHO is:"
- "Assertion (A): Order of reaction cannot be fractional. Reason (R): Order is determined experimentally."
- "What is the oxidation state of Cr in K₂Cr₂O₇?" (+6)
- "In an electrolytic cell, which law gives the relationship between mass deposited and charge passed?" (Faraday's 1st law)
- "Which type of isomerism is shown by [Co(NH₃)₅Br]SO₄ and [Co(NH₃)₅SO₄]Br?" (Ionisation isomerism)
- "Bakelite is formed by the reaction of phenol with:" (Formaldehyde — condensation polymer)
2022-2024: Organic (35%), Coordination/Inorganic (30%), Physical (35%).`,

  mathematics: `CUET MATHEMATICS PYQ PATTERNS (2022-2024, NCERT Class 12):
Most repeated from actual CUET papers:
- "If f(x) = x², find f⁻¹(x):" (√x, x ≥ 0)
- "Find the value of cos⁻¹(cos 7π/6):" (5π/6)
- "If A is a 3×3 matrix and |A| = 5, then |3A| =" (135, since |kA| = k³|A|)
- "∫ x/(1+x²) dx =" (½ ln(1+x²) + C)
- "Solution of dy/dx = y/x is:" (y = Cx)
- "Maximum value of Z = 5x + 4y subject to: x+y≤6, x,y≥0" (30 at x=6,y=0)
- "If vectors a and b are perpendicular, then a·b = " (0)
2022-2024: Calculus (35%), Algebra including Matrices (30%), Coordinate/3D/Vectors (25%), Misc (10%).`,

  biology: `CUET BIOLOGY PYQ PATTERNS (2022-2024, NCERT Class 11-12):
Most repeated from actual CUET papers:
- "Which type of ovule is most common in angiosperms?" (Anatropous)
- "Assertion (A): Alleles are always heterozygous. Reason (R): Alleles occupy same loci on homologous chromosomes."
- "Match the enzyme with its function in DNA replication": Ligase, Helicase, Primase, Polymerase
- "The disease caused by Entamoeba histolytica is:" (Amoebiasis)
- "Which pyramid is always upright in a forest ecosystem?" (Pyramid of energy)
- "During translation, which type of RNA acts as adaptor molecule?" (tRNA)
- Sequence: Arrange steps of meiosis in order
2022-2024: Genetics (25%), Reproduction (20%), Ecology (20%), Molecular Bio (20%), Health (15%).`,

  english: `CUET ENGLISH PYQ PATTERNS (2022-2024):
Most repeated from actual CUET papers:
- Unseen passage (literary or factual) → 5 MCQs testing: main theme, inference, vocabulary in context, author's purpose, specific detail
- "Choose the synonym of 'Ephemeral' from the options" (temporary/lasting/permanent/ancient)
- Para-jumble: 6 sentences → arrange logically (first and last given)
- Cloze test: 5 blanks in paragraph about current topic → choose best word
- Error identification: 4 underlined parts, find the one with grammatical error
- "Identify the figure of speech in: 'The wind whispered through the trees'" (Personification)
- One-word substitution, idiom meaning questions
2022-2024: Comprehension (40%), Grammar (30%), Vocabulary (20%), Verbal ability (10%).`,

  general_test: `CUET GENERAL TEST PYQ PATTERNS (2022-2024):
Most repeated from actual CUET papers:
- "If MANGO is coded as NBOHP, how is APPLE coded?" (Coding-Decoding)
- "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?" (Blood relations)
- "Series: 3, 7, 15, 31, ___" (63 — double+1 pattern)
- Data: Bar chart showing 5 years sales data → "In which year was growth maximum?"
- "A shopkeeper bought goods for ₹1200 and sold at 20% profit. Selling price?" (₹1440)
- "Average of 5 numbers is 40. If one number 75 is removed, what is new average?" (31.25)
- "Find the odd one out: Cat, Dog, Parrot, Mango" (General knowledge)
2022-2024: Reasoning (35%), Quantitative (30%), DI (20%), GK (15%).`,
};

// ─── JEE SYNTAX RULES ───
const JEE_SYNTAX_RULES = `
STRICT MATHEMATICAL SYNTAX (MANDATORY):
- Use Unicode: V = IR, F = ma, x², e^(x+y), v₁, v₂, ε₀, μ₀
- Greek: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
- Fractions: (a+b)/(c+d); NO LaTeX; NO verbal descriptions
- Chemistry: Fe + CuSO₄ → FeSO₄ + Cu, use → for reactions
- Solution format: Given → Step 1 → Step 2 → Final Answer: [value unit]
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subject,
      chapterId,
      subchapterId,
      subchapterName,
      chapterName,
      yearRange,
      count = 25,
      examMode = "JEE",
    }: PYQRequest = await req.json();

    const isCuet = examMode === "CUET";
    const isNeet = examMode === "NEET";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine year range
    const effectiveYearRange = yearRange ||
      (isCuet ? CUET_YEAR_RANGE :
       isNeet ? { start: 1998, end: 2024 } :
       { start: 1998, end: 2024 });

    // ─── CHECK DB CACHE ───
    let query = supabase
      .from("questions")
      .select("*")
      .not("pyq_year", "is", null)
      .gte("pyq_year", effectiveYearRange.start)
      .lte("pyq_year", effectiveYearRange.end);

    if (subject) query = query.eq("subject", subject.toLowerCase());
    if (chapterId) query = query.eq("chapter_id", chapterId);

    const { data: existingPYQs, error: fetchError } = await query.limit(count);

    if (!fetchError && existingPYQs && existingPYQs.length >= count) {
      return new Response(JSON.stringify({ questions: existingPYQs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── BUILD PROMPTS ───
    const subjectKey = (subject || "").toLowerCase().replace(/\s+/g, "_");
    const subjectContext = isCuet ? (CUET_PYQ_PATTERNS[subjectKey] || "") : "";
    const subjectFilter = subject ? `for ${subject}` : `across ${isCuet ? "all CUET domain subjects" : isNeet ? "Physics, Chemistry, Biology" : "Physics, Chemistry, Mathematics"}`;
    const topicContext = subchapterName ? ` specifically on the topic "${subchapterName}" (${chapterName})` : "";

    let systemPrompt = "";
    let userPrompt = "";

    if (isCuet) {
      systemPrompt = `You are an NTA CUET UG official question paper setter with expertise in CUET papers from 2022, 2023, and 2024.

CUET PYQ AUTHENTICITY RULES:
1. CUET UG started in 2022. Do NOT generate questions from before 2022.
2. Strictly NCERT Class 11-12 aligned — nothing beyond NCERT
3. Mirror the ACTUAL CUET paper question styles:
   - Standard MCQ (4 options, single correct, +5/-1 marking in CUET)
   - Assertion-Reason (NTA standard 4 options)
   - Match List I with List II (options showing correct combinations)
   - Arrange in correct order (sequence type)
   - Case/Passage-based (short NCERT passage → 3 MCQs)
4. Difficulty must match CUET (not JEE/NEET level — CUET is NCERT speed test)
5. Vary question types: ~50% standard MCQ, ~20% Assertion-Reason, ~15% Match/Sequence, ~15% Case-based
6. DO NOT mention JEE, NEET, or any non-CUET exam
7. Year range: ${effectiveYearRange.start}-${effectiveYearRange.end}

${subjectContext}`;

      userPrompt = `Generate ${count} CUET UG PYQ-style questions ${subjectFilter}${topicContext}.

Each question must be indistinguishable from an actual NTA CUET UG paper question from ${effectiveYearRange.start}-${effectiveYearRange.end}.

For Assertion-Reason questions use these EXACT option texts:
A) Both A and R are true and R is the correct explanation of A
B) Both A and R are true but R is NOT the correct explanation of A
C) A is true but R is false
D) A is false but R is true

Return ONLY valid JSON array (no markdown):
[{
  "question_text": "...",
  "option_a": "...",
  "option_b": "...",
  "option_c": "...",
  "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "NCERT chapter reference + reasoning (max 100 words)",
  "concept_tested": "Specific CUET concept",
  "common_mistake": "Typical student error",
  "pyq_year": 2022/2023/2024,
  "source": "CUET UG ${effectiveYearRange.end}",
  "subject": "${subject || 'mixed'}"
}]

Quality checklist:
✅ Strictly NCERT aligned
✅ Speed-appropriate (30-90 second questions)  
✅ Varied question types (MCQ, A-R, Match, Sequence)
✅ Correct option verified
✅ No JEE/NEET terminology`;

    } else if (isNeet) {
      systemPrompt = `You are a NEET UG PYQ specialist. Generate authentic NEET-style PYQs from ${effectiveYearRange.start}-${effectiveYearRange.end}.

NEET PYQ RULES:
- Strictly NCERT-based (Class 11-12 Biology, Chemistry, Physics)
- NEET has +4/-1 marking, 4 options single correct
- Biology dominant (50%), Chemistry (25%), Physics (25%)
- Focus on NCERT diagrams, definitions, examples, numerical applications
- Difficulty: Moderate (easier than JEE, conceptually deep)`;

      userPrompt = `Generate ${count} authentic NEET PYQ-style questions ${subjectFilter}${topicContext} from ${effectiveYearRange.start}-${effectiveYearRange.end}.

Return ONLY valid JSON array:
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "NCERT-based explanation (max 100 words)",
  "concept_tested": "NCERT concept",
  "common_mistake": "Common NEET student error",
  "pyq_year": YYYY,
  "source": "NEET UG YYYY",
  "subject": "${subject || 'biology'}"
}]`;

    } else {
      // JEE (original)
      systemPrompt = `You are an elite JEE PYQ specialist.
${JEE_SYNTAX_RULES}

JEE ERA PATTERNS:
- Post-NTA (2019-2024): Application-heavy, assertion-reason, data interpretation
- JEE Advanced (2013-2018): Multi-concept, paragraph-based adapted to MCQ
- AIEEE (2002-2012): Formula-driven, straightforward computation
- IIT-JEE Classic (1998-2001): Tough conceptual problems, multi-step reasoning, famous "IIT level" questions

SUBJECT DISTRIBUTION:
PHYSICS: Mechanics 20%, Electrodynamics 25%, Optics 20%, Waves 15%, Magnetism 10%, Properties 10%
CHEMISTRY: Physical 35%, Organic 30%, Inorganic 35%
MATHS: Calculus 35%, Algebra 30%, Coordinate 20%, Trigonometry 10%, Vectors 5%`;

      userPrompt = `Generate ${count} authentic JEE PYQ-style questions ${subjectFilter}${topicContext} from ${effectiveYearRange.start}-${effectiveYearRange.end}.

Return ONLY valid JSON array:
[{
  "question_text": "Question with proper JEE notation (subscripts: v₁; fractions: (a−b)/c; Greek: θ, α, ω)",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "Given → Step 1 → Step 2 → Final Answer: [value unit] (max 150 words)",
  "concept_tested": "Exact concept tested",
  "common_mistake": "Error → wrong option mapping",
  "pyq_year": YYYY,
  "source": "JEE Mains YYYY / JEE Advanced YYYY",
  "subject": "${subject || 'physics'}"
}]

Quality: 60% JEE Mains, 30% JEE Advanced, 10% AIEEE (if year allows). Recent 5 years = 50%.`;
    }

    // ─── CALL AI ───
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    // ─── PARSE ───
    let questions;
    try {
      let jsonContent = content.trim();
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) jsonContent = codeBlockMatch[1].trim();
      questions = JSON.parse(jsonContent);
      if (!Array.isArray(questions)) throw new Error("Response is not an array");
    } catch {
      throw new Error("Failed to parse PYQ questions from AI");
    }

    // ─── STORE ───
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: subchapterId || chapterId || "pyq_mixed",
      chapter_id: chapterId || "pyq_mixed",
      subject: q.subject?.toLowerCase() || subject?.toLowerCase() || "mixed",
      difficulty: "medium",
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option?.toUpperCase(),
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      pyq_year: q.pyq_year || null,
      source: q.source || `${examMode}_pyq_style`,
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting PYQ questions:", insertError);
      return new Response(JSON.stringify({ questions: questionsToInsert }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: insertedQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-pyq-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
