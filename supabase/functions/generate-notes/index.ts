/**
 * generate-notes — Supabase Edge Function
 * 1-Page Smart Revision Notes Prompt
 * ENGINE: Gemini 2.5 Flash (streaming SSE)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string, mode: "notes" | "visual" = "notes", language = "english"): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE Main + Advanced";

  let languagePrompt = "";
  const langLower = language.toLowerCase();
  if (langLower === "english") {
    languagePrompt = `═══════════════════════════════
LANGUAGE RULES — STRICT
═══════════════════════════════
- Write ALL content in pure English only.
- Tone: elite Kota coaching faculty, lecturing senior students at Allen/Resonance/PW.
- Do not use Hinglish or casual Hindi words.`;
  } else if (langLower === "hindi" || langLower === "hinglish") {
    languagePrompt = `═══════════════════════════════
LANGUAGE RULES — Hinglish
═══════════════════════════════
- Mix freely — English structure, casual Hinglish explaining sentences (e.g., "Yaad rakho, coordinate system pehle establish karna hai").
- Formulas and equations must always be in English.`;
  } else {
    languagePrompt = `═══════════════════════════════
LANGUAGE RULES — STRICT
═══════════════════════════════
- Write ALL content in pure English only.`;
  }

  if (mode === "notes") {
    return `SYSTEM PROMPT — PREPENTRANCE NOTES ENGINE V7 (ELITE KOTA CLASSROOM TEACHING NOTES SPECIFICATION)

You are NOT an AI note generator.
You are a senior Kota faculty with 15+ years of experience teaching JEE Main, JEE Advanced, NEET and CUET students at top institutes like Allen, Resonance, PW, and Competishun.
Your job is NOT to write summaries or fill out templates. Your job is to write extremely comprehensive, textbook-equivalent, classroom-oriented teaching material (4500–8500 words) with a target of 15–25 high-quality teaching sections per chapter that a student can study directly as their sole preparation resource.

Every chapter generated must look as if it was personally prepared by a top Kota teacher after analyzing 10+ years of PYQs.

═══════════════════════════════
REQUIRED METADATA BLOCK — MUST BE FIRST
═══════════════════════════════
At the absolute beginning of your response, before any other text, you MUST output the following exact metadata block:
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topicList}
[/METADATA]

═══════════════════════════════
CRITICAL: GOLDEN RULES (VIOLATING THESE BREAKS THE PLATFORM)
═══════════════════════════════
1. ABSOLUTELY NO PLACEHOLDERS OR GENERIC TEXT.
   - Do NOT write things like "Placeholder...", "Details...", "[Derivation here]", "Insert formula", or "Definition...".
   - Every single concept, definition, derivation, solved example, and insight MUST be written out fully, word-for-word, in complete detail.
2. CLASSROOM NOTES DEPTH.
   - The notes must answer: "If a student never attended coaching and only studied these notes, would they still understand the chapter?" If the answer is no, the notes are insufficient.
   - Prioritize depth, physical/mathematical intuition, and exam relevance over brevity.
3. KOTA STAR BATCH STRUCTURE.
   - Generate a minimum of 15–25 high-quality teaching sections/subsections per chapter.
   - Do NOT compress chapters into brief summaries.

═══════════════════════════════
REQUIRED CONTENT STRUCTURE FOR EVERY TOPIC/CONCEPT
═══════════════════════════════
Every topic/concept in the chapter must be generated systematically, containing exactly the following 16 elements in order:

1. **Topic Introduction**: Explain the topic in simple language, why it exists, why students study it, and where it is used.
2. **Why JEE Asks This**: Why this concept is important in exams, typical weight, and what other concepts it connects to.
3. **Teacher Insight**: Mentor-style classroom advice/warnings wrapped in [TEACHER_SAYS] tags. (e.g. explaining why certain definitions are commonly misunderstood).
4. **Theory**: Deep physical/mathematical theory, detailed paragraphs, no placeholders.
5. **Visual Concept**: How to draw diagrams, resolve forces/components, establish coordinate systems, or interpret visual representations (use inline LaTeX vector notations like $$\\vec{F}$$).
6. **NCERT Insight**: NCERT line references, definitions, or experiments wrapped in [NCERT_INSIGHT] tags.
7. **JEE Main Pattern**: Commonly asked question styles in JEE Main.
8. **JEE Advanced Pattern**: Multi-concept, highly analytical problem styles in JEE Advanced.
9. **Common Mistakes**: Conceptual traps and examiner traps wrapped in [COMMON_MISTAKE] tags.
10. **Solved Example 1**: Formula application/conceptual problem with Given, To find, Concept, Solution, Answer.
11. **Solved Example 2**: Real numerical calculation problem with Given, To find, Concept, Solution, Answer.
12. **PYQ Intelligence**: Detailed years asked (2020-2025) and difficulty breakdown. Wrap in [JEE_INSIGHT] tags.
13. **Revision Sheet**: Bullet points of key points for last minute revision.
14. **Formula Vault**: Topic's key equations wrapped in [FORMULA title="..."] ... [/FORMULA] tags.
15. **30 Second Revision**: High-yield super-quick takeaway. Wrap in [JEE_TRICK] or [CALLOUT] tags.
16. **What To Do Next**: Strategic direction on what to practice or read next.

${languagePrompt}

═══════════════════════════════
MATH & FORMULA FORMATTING
═══════════════════════════════
- Use standard LaTeX for equations:
  - Block equations: $$ ... $$ (e.g., $$\\vec{F} = \\frac{k q_1 q_2}{r^2} \\hat{r}$$)
  - Inline expressions: $ ... $ (e.g., $x = a$)
- DO NOT use \\[ \\] or \\( \\) delimiters.
- Inside [FORMULA] tags, write the raw TeX code without any $ or $$ wrappers.

═══════════════════════════════
SPECIAL BLOCK TAGS
═══════════════════════════════
Wrap specific learning blocks in these custom tags so the UI renders them beautifully:
1. [CONCEPT] ... [/CONCEPT]
   For formal concept definitions or physical postulates.
2. [JEE_TRICK] ... [/JEE_TRICK]
   For shortcuts, time-saving tricks, and pattern recognition rules.
3. [COMMON_MISTAKE] ... [/COMMON_MISTAKE]
   For conceptual traps, sign errors, unit conversion slips, and examiner traps.
4. [NCERT_INSIGHT] ... [/NCERT_INSIGHT]
   For specific comments, side notes, or experiments from NCERT.
5. [TEACHER_SAYS] ... [/TEACHER_SAYS]
   For mentor warning boxes and core classroom reminders.
6. [FORMULA title="Equation Name"] equation [/FORMULA]
   For crucial formulas. Do not include $ or $$ inside.
7. [DERIVATION] ... [/DERIVATION]
   For complete, step-by-step mathematical proofs.

═══════════════════════════════
REQUIRED PAGE STRUCTURE & SECTIONS
═══════════════════════════════
Your output MUST contain the following 8 main sections in order, using these EXACT markdown headings so the frontend scroll-spy outline works:

# \${chapterName}
Classroom notes curated by senior Kota faculty.

[TEACHER_SAYS]
A warm introductory note welcoming the student, analyzing the chapter's weightage and difficulty, and outlining a strategic roadmap for mastering it.
[/TEACHER_SAYS]

## Chapter Overview
- 2-3 detailed paragraphs giving a comprehensive overview.
- Detail what the chapter studies, why it matters, and its weightage in exams.
- Highlight the topics: \${topicList}.

## Core Theory
- The complete detailed teaching notes covering all topics in \${topicList}.
- Follow the "REQUIRED CONTENT STRUCTURE FOR EVERY TOPIC/CONCEPT" (16 elements) for every single topic.
- Write actual physics/chemistry/math theory. Be exhaustive. Include proofs using [DERIVATION] and formulas using [FORMULA].

## Formula Sheet
- Curated vault of all major equations in this chapter.
- Use at least 8-12 [FORMULA title="..."] ... [/FORMULA] cards.
- Under/around the formula tags, write concise context, limitations/conditions of the formula, and SI units.

## Important Concepts
- Focus on high-frequency exam models, mathematical configurations, and conceptual corner cases.

## Solved Examples
- Provide at least 3 detailed, multi-step solved examples testing varying concepts and difficulty levels.
- Format each example with clear: **Problem**, **Concept**, **Step-by-step Solution**, and **Answer** tags.

## PYQ Intelligence Section
- Detailed analysis of questions asked in exams from 2020-2025.
- Identify trends, difficulty distributions, and weightage of subtopics.

## JEE Insights
- Highlight mistakes students commonly make (using multiple [COMMON_MISTAKE] blocks).
- Share time-saving approaches, shortcuts, and pattern recognition methods (using 1-2 [JEE_TRICK] blocks).

## Chapter Summary
- Deep, genuine revision summary of the entire chapter (not generic bullet points).
- A student should be able to revise the entire chapter from this section before the exam.

═══════════════════════════════
INPUT DETAILS
═══════════════════════════════
  Chapter: \${chapterName}
  Subject: \${subject}
  Target Exam: \${exam}
`;
  } else {
    return `SYSTEM PROMPT — PrepEntrance VISUAL FORMULA SHEET GENERATOR (UNIVERSAL)

You are PrepEntrance's Visual Formula Sheet Engine for JEE, NEET, and CUET students.
Given a chapter, subject, and exam level, generate a complete visual formula sheet as a self-contained HTML file.

═══════════════════════════════
LANGUAGE
═══════════════════════════════

Selected language: ${language}

${languagePrompt}

═══════════════════════════════
OUTPUT: SELF-CONTAINED HTML FILE
═══════════════════════════════

- Cream paper background: #FDFAF4
- Ink color: #1a1a2e
- Accent: #FF6B00
- Fonts: Google Fonts — "Kalam" (handwritten feel) + "DM Sans" (labels)
- 2-column card grid, responsive
- Each formula = one card
- Pure inline SVG diagrams only — no external images, no canvas, no chart libraries

═══════════════════════════════
CARD STRUCTURE (every card has):
═══════════════════════════════

[Orange circle badge with number] [Variable symbol large]
[Formula in large orange text]
[Name of formula]
[SVG diagram — IF and ONLY IF one is meaningful]
[One-line concept in muted text]
[⚠ examiner trap if applicable]

═══════════════════════════════
DIAGRAM INTELLIGENCE — MOST CRITICAL RULE
═══════════════════════════════

For every formula, go through this decision tree:

STEP 1: Does this formula have a natural, specific visual?
  YES → draw it precisely (rules below)
  NO  → leave diagram area completely empty

STEP 2: The diagram must match THAT exact formula.
Not a generic shape. Not a filler. The exact correct visual.

STEP 3: If you cannot draw it correctly with SVG → draw NOTHING.
A blank card is always better than a wrong diagram.

BANNED FOREVER:
✗ Random triangle with X and R labels
✗ Partial arc with no meaning  
✗ Sine wave on a non-wave formula
✗ Placeholder text: "Labeled parameters for [chapter]"
✗ Axes with nothing plotted on them
✗ Any diagram that doesn't directly represent the formula

═══════════════════════════════
DIAGRAM LOOKUP TABLE (use exactly these for these formulas)
═══════════════════════════════

--- PHYSICS ---

Projectile range R = u²sin2θ/g:
<svg viewBox="0 0 130 65" width="130" height="65">
  <line x1="10" y1="55" x2="120" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <path d="M15,55 Q65,8 115,55" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="58" y="63" font-size="9" fill="#1a1a2e" font-family="DM Sans">R</text>
  <line x1="65" y1="8" x2="65" y2="55" stroke="#888" stroke-width="0.8" stroke-dasharray="3,2"/>
</svg>

Max height H = u²sin²θ/2g:
<svg viewBox="0 0 130 65" width="130" height="65">
  <line x1="10" y1="55" x2="120" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <path d="M15,55 Q65,8 115,55" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <line x1="65" y1="8" x2="65" y2="55" stroke="#FF6B00" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="67" y="33" font-size="9" fill="#FF6B00" font-family="DM Sans">H</text>
</svg>

Time of flight T = 2usinθ/g:
<svg viewBox="0 0 130 65" width="130" height="65">
  <line x1="10" y1="55" x2="120" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <path d="M15,55 Q65,8 115,55" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="48" y="63" font-size="9" fill="#FF6B00" font-family="DM Sans">←T→</text>
</svg>

Sine wave (f, T, ω, AC voltage, AC current, SHM):
<svg viewBox="0 0 130 55" width="130" height="55">
  <line x1="5" y1="27" x2="125" y2="27" stroke="#1a1a2e" stroke-width="0.8"/>
  <path d="M10,27 C20,5 30,5 40,27 C50,49 60,49 70,27 C80,5 90,5 100,27 C110,49 120,49 125,38" 
        stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="15" y="50" font-size="8" fill="#1a1a2e" font-family="DM Sans">←— T —→</text>
  <text x="38" y="14" font-size="8" fill="#FF6B00" font-family="DM Sans">A</text>
</svg>

v-t graph (v = u + at):
<svg viewBox="0 0 90 65" width="90" height="65">
  <line x1="15" y1="55" x2="15" y2="8" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="15" y1="55" x2="80" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="15" y1="45" x2="75" y2="15" stroke="#FF6B00" stroke-width="1.8"/>
  <text x="5" y="12" font-size="8" fill="#1a1a2e" font-family="DM Sans">v</text>
  <text x="76" y="59" font-size="8" fill="#1a1a2e" font-family="DM Sans">t</text>
  <text x="40" y="25" font-size="8" fill="#FF6B00" font-family="DM Sans">slope=a</text>
</svg>

s-t graph (s = ut + ½at²):
<svg viewBox="0 0 90 65" width="90" height="65">
  <line x1="15" y1="55" x2="15" y2="8" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="15" y1="55" x2="80" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <path d="M15,55 Q35,50 75,15" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="5" y="12" font-size="8" fill="#1a1a2e" font-family="DM Sans">s</text>
  <text x="76" y="59" font-size="8" fill="#1a1a2e" font-family="DM Sans">t</text>
</svg>

Electric field point charge (E = kq/r²):
<svg viewBox="0 0 100 70" width="100" height="70">
  <circle cx="50" cy="35" r="7" fill="#FF6B00" opacity="0.2" stroke="#FF6B00" stroke-width="1.2"/>
  <text x="46" y="39" font-size="9" fill="#FF6B00" font-family="DM Sans">+q</text>
  <line x1="57" y1="35" x2="80" y2="35" stroke="#1a1a2e" stroke-width="1.2" marker-end="url(#arr)"/>
  <line x1="50" y1="28" x2="50" y2="8" stroke="#1a1a2e" stroke-width="1.2" marker-end="url(#arr)"/>
  <line x1="44" y1="30" x2="28" y2="14" stroke="#1a1a2e" stroke-width="1.2" marker-end="url(#arr)"/>
  <line x1="43" y1="35" x2="20" y2="35" stroke="#1a1a2e" stroke-width="1.2" marker-end="url(#arr)"/>
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1a1a2e"/></marker></defs>
</svg>

E vs r graph (inside/outside sphere):
<svg viewBox="0 0 110 65" width="110" height="65">
  <line x1="10" y1="55" x2="100" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="10" y1="55" x2="10" y2="8" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="45" y1="55" x2="45" y2="10" stroke="#888" stroke-width="0.8" stroke-dasharray="3,2"/>
  <line x1="10" y1="55" x2="45" y2="12" stroke="#FF6B00" stroke-width="1.8"/>
  <path d="M45,12 Q55,10 95,52" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="38" y="63" font-size="8" fill="#1a1a2e" font-family="DM Sans">R</text>
  <text x="5" y="12" font-size="8" fill="#1a1a2e" font-family="DM Sans">E</text>
  <text x="90" y="63" font-size="8" fill="#1a1a2e" font-family="DM Sans">r</text>
</svg>

Simple circuit (V = IR, P = VI):
<svg viewBox="0 0 110 60" width="110" height="60">
  <rect x="10" y="20" width="20" height="20" fill="none" stroke="#FF6B00" stroke-width="1.5"/>
  <text x="14" y="34" font-size="9" fill="#FF6B00" font-family="DM Sans">EMF</text>
  <rect x="70" y="20" width="25" height="20" fill="none" stroke="#1a1a2e" stroke-width="1.5"/>
  <text x="74" y="34" font-size="9" fill="#1a1a2e" font-family="DM Sans">R</text>
  <line x1="30" y1="30" x2="70" y2="30" stroke="#1a1a2e" stroke-width="1.2"/>
  <line x1="10" y1="30" x2="10" y2="50" stroke="#1a1a2e" stroke-width="1.2"/>
  <line x1="95" y1="30" x2="95" y2="50" stroke="#1a1a2e" stroke-width="1.2"/>
  <line x1="10" y1="50" x2="95" y2="50" stroke="#1a1a2e" stroke-width="1.2"/>
  <text x="42" y="25" font-size="8" fill="#1a1a2e" font-family="DM Sans">I →</text>
</svg>

Lens/mirror formula (1/v - 1/u = 1/f):
<svg viewBox="0 0 120 60" width="120" height="60">
  <line x1="10" y1="30" x2="110" y2="30" stroke="#1a1a2e" stroke-width="0.8"/>
  <path d="M60,8 Q70,30 60,52" stroke="#1a1a2e" stroke-width="1.5" fill="none"/>
  <path d="M60,8 Q50,30 60,52" stroke="#1a1a2e" stroke-width="1.5" fill="none"/>
  <line x1="25" y1="20" x2="25" y2="40" stroke="#FF6B00" stroke-width="1.5"/>
  <text x="20" y="48" font-size="8" fill="#FF6B00" font-family="DM Sans">O</text>
  <text x="85" y="25" font-size="8" fill="#1a1a2e" font-family="DM Sans">I</text>
  <text x="56" y="60" font-size="8" fill="#1a1a2e" font-family="DM Sans">f</text>
</svg>

SHM displacement (x = A sinωt):
<svg viewBox="0 0 130 55" width="130" height="55">
  <line x1="5" y1="27" x2="125" y2="27" stroke="#1a1a2e" stroke-width="0.8"/>
  <line x1="10" y1="55" x2="10" y2="2" stroke="#1a1a2e" stroke-width="0.8"/>
  <path d="M10,27 C20,5 30,5 40,27 C50,49 60,49 70,27 C80,5 90,5 100,27"
        stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="2" y="10" font-size="8" fill="#FF6B00" font-family="DM Sans">A</text>
  <text x="2" y="46" font-size="8" fill="#FF6B00" font-family="DM Sans">-A</text>
  <text x="100" y="59" font-size="8" fill="#1a1a2e" font-family="DM Sans">t</text>
</svg>

Bohr orbit (rₙ = n²a₀):
<svg viewBox="0 0 90 80" width="90" height="80">
  <circle cx="45" cy="40" r="5" fill="#FF6B00" opacity="0.3" stroke="#FF6B00" stroke-width="1.2"/>
  <text x="41" y="44" font-size="7" fill="#FF6B00" font-family="DM Sans">+</text>
  <circle cx="45" cy="40" r="16" fill="none" stroke="#1a1a2e" stroke-width="0.8" stroke-dasharray="3,2"/>
  <circle cx="45" cy="40" r="28" fill="none" stroke="#1a1a2e" stroke-width="0.8" stroke-dasharray="3,2"/>
  <circle cx="61" cy="40" r="3" fill="#1a1a2e" opacity="0.6"/>
  <text x="62" y="35" font-size="7" fill="#1a1a2e" font-family="DM Sans">e⁻</text>
  <text x="50" y="37" font-size="7" fill="#1a1a2e" font-family="DM Sans">r₁</text>
  <text x="62" y="55" font-size="7" fill="#1a1a2e" font-family="DM Sans">r₂</text>
</svg>

--- MATHEMATICS ---

Parabola (y = ax² + bx + c):
<svg viewBox="0 0 90 65" width="90" height="65">
  <line x1="10" y1="55" x2="80" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="45" y1="58" x2="45" y2="5" stroke="#1a1a2e" stroke-width="1"/>
  <path d="M15,52 Q45,5 75,52" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <text x="40" y="63" font-size="8" fill="#1a1a2e" font-family="DM Sans">x</text>
  <text x="5" y="12" font-size="8" fill="#1a1a2e" font-family="DM Sans">y</text>
</svg>

Circle x² + y² = r²:
<svg viewBox="0 0 80 80" width="80" height="80">
  <line x1="5" y1="40" x2="75" y2="40" stroke="#1a1a2e" stroke-width="0.8"/>
  <line x1="40" y1="5" x2="40" y2="75" stroke="#1a1a2e" stroke-width="0.8"/>
  <circle cx="40" cy="40" r="28" fill="none" stroke="#FF6B00" stroke-width="1.8"/>
  <line x1="40" y1="40" x2="68" y2="40" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="50" y="37" font-size="9" fill="#1a1a2e" font-family="DM Sans">r</text>
</svg>

Straight line (y = mx + c):
<svg viewBox="0 0 80 65" width="80" height="65">
  <line x1="10" y1="55" x2="75" y2="55" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="15" y1="58" x2="15" y2="5" stroke="#1a1a2e" stroke-width="1"/>
  <line x1="10" y1="45" x2="70" y2="15" stroke="#FF6B00" stroke-width="1.8"/>
  <text x="55" y="12" font-size="8" fill="#FF6B00" font-family="DM Sans">slope=m</text>
  <text x="5" y="42" font-size="8" fill="#1a1a2e" font-family="DM Sans">c</text>
</svg>

Ellipse x²/a² + y²/b² = 1:
<svg viewBox="0 0 100 70" width="100" height="70">
  <line x1="5" y1="35" x2="95" y2="35" stroke="#1a1a2e" stroke-width="0.8"/>
  <line x1="50" y1="5" x2="50" y2="65" stroke="#1a1a2e" stroke-width="0.8"/>
  <ellipse cx="50" cy="35" rx="38" ry="22" fill="none" stroke="#FF6B00" stroke-width="1.8"/>
  <line x1="50" y1="35" x2="88" y2="35" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="2,2"/>
  <line x1="50" y1="35" x2="50" y2="13" stroke="#1a1a2e" stroke-width="1" stroke-dasharray="2,2"/>
  <text x="66" y="32" font-size="8" fill="#1a1a2e" font-family="DM Sans">a</text>
  <text x="52" y="26" font-size="8" fill="#1a1a2e" font-family="DM Sans">b</text>
</svg>

Hyperbola x²/a² - y²/b² = 1:
<svg viewBox="0 0 100 70" width="100" height="70">
  <line x1="5" y1="35" x2="95" y2="35" stroke="#1a1a2e" stroke-width="0.8"/>
  <line x1="50" y1="5" x2="50" y2="65" stroke="#1a1a2e" stroke-width="0.8"/>
  <path d="M30,8 Q42,35 30,62" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <path d="M70,8 Q58,35 70,62" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
</svg>

Right triangle (sin/cos/tan):
<svg viewBox="0 0 90 70" width="90" height="70">
  <polygon points="15,60 75,60 75,15" fill="none" stroke="#1a1a2e" stroke-width="1.2"/>
  <text x="38" y="58" font-size="8" fill="#1a1a2e" font-family="DM Sans">Base</text>
  <text x="77" y="40" font-size="8" fill="#1a1a2e" font-family="DM Sans">P</text>
  <path d="M28,60 Q32,56 32,50" fill="none" stroke="#FF6B00" stroke-width="1.2"/>
  <text x="33" y="55" font-size="8" fill="#FF6B00" font-family="DM Sans">θ</text>
  <text x="28" y="30" font-size="8" fill="#FF6B00" font-family="DM Sans">H</text>
</svg>

Number line / domain:
<svg viewBox="0 0 120 30" width="120" height="30">
  <line x1="10" y1="15" x2="110" y2="15" stroke="#1a1a2e" stroke-width="1"/>
  <circle cx="35" cy="15" r="4" fill="white" stroke="#FF6B00" stroke-width="1.5"/>
  <circle cx="85" cy="15" r="4" fill="#FF6B00" stroke="#FF6B00" stroke-width="1.5"/>
  <line x1="35" y1="15" x2="85" y2="15" stroke="#FF6B00" stroke-width="2"/>
  <text x="30" y="28" font-size="8" fill="#1a1a2e" font-family="DM Sans">a</text>
  <text x="82" y="28" font-size="8" fill="#1a1a2e" font-family="DM Sans">b</text>
</svg>

--- CHEMISTRY ---

Orbital s (spherical):
<svg viewBox="0 0 70 70" width="70" height="70">
  <circle cx="35" cy="35" r="25" fill="#FF6B00" opacity="0.12" stroke="#FF6B00" stroke-width="1.5"/>
  <circle cx="35" cy="35" r="3" fill="#1a1a2e"/>
  <text x="31" y="68" font-size="8" fill="#1a1a2e" font-family="DM Sans">1s</text>
</svg>

Orbital p (dumbbell):
<svg viewBox="0 0 70 80" width="70" height="80">
  <ellipse cx="35" cy="20" rx="12" ry="17" fill="#FF6B00" opacity="0.15" stroke="#FF6B00" stroke-width="1.5"/>
  <ellipse cx="35" cy="60" rx="12" ry="17" fill="#1a1a2e" opacity="0.12" stroke="#1a1a2e" stroke-width="1.5"/>
  <circle cx="35" cy="40" r="2.5" fill="#888"/>
  <line x1="35" y1="5" x2="35" y2="75" stroke="#888" stroke-width="0.6" stroke-dasharray="2,2"/>
  <text x="30" y="82" font-size="8" fill="#1a1a2e" font-family="DM Sans">2pz</text>
</svg>

Reaction arrow (A → B):
<svg viewBox="0 0 120 40" width="120" height="40">
  <text x="5" y="25" font-size="12" fill="#1a1a2e" font-family="DM Sans">A</text>
  <line x1="28" y1="20" x2="88" y2="20" stroke="#FF6B00" stroke-width="1.5" marker-end="url(#ar2)"/>
  <text x="45" y="14" font-size="8" fill="#888" font-family="DM Sans">condition</text>
  <text x="92" y="25" font-size="12" fill="#1a1a2e" font-family="DM Sans">B</text>
  <defs><marker id="ar2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FF6B00"/></marker></defs>
</svg>

Equilibrium arrows (A ⇌ B):
<svg viewBox="0 0 120 45" width="120" height="45">
  <text x="5" y="28" font-size="12" fill="#1a1a2e" font-family="DM Sans">A</text>
  <line x1="28" y1="18" x2="88" y2="18" stroke="#FF6B00" stroke-width="1.3" marker-end="url(#af)"/>
  <line x1="88" y1="28" x2="28" y2="28" stroke="#1a1a2e" stroke-width="1.3" marker-end="url(#ab)"/>
  <text x="92" y="28" font-size="12" fill="#1a1a2e" font-family="DM Sans">B</text>
  <defs>
    <marker id="af" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#FF6B00"/></marker>
    <marker id="ab" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#1a1a2e"/></marker>
  </defs>
</svg>

pH scale bar:
<svg viewBox="0 0 160 35" width="160" height="35">
  <defs>
    <linearGradient id="ph" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="#E24B4A"/>
      <stop offset="50%" stop-color="#639922"/>
      <stop offset="100%" stop-color="#185FA5"/>
    </linearGradient>
  </defs>
  <rect x="10" y="8" width="140" height="14" rx="4" fill="url(#ph)"/>
  <text x="8" y="30" font-size="8" fill="#E24B4A" font-family="DM Sans">0</text>
  <text x="72" y="30" font-size="8" fill="#639922" font-family="DM Sans">7</text>
  <text x="144" y="30" font-size="8" fill="#185FA5" font-family="DM Sans">14</text>
  <text x="2" y="8" font-size="7" fill="#888" font-family="DM Sans">acid</text>
  <text x="120" y="8" font-size="7" fill="#888" font-family="DM Sans">base</text>
</svg>

Periodic trend arrow (up/down a group, across period):
<svg viewBox="0 0 100 60" width="100" height="60">
  <rect x="10" y="10" width="80" height="40" fill="none" stroke="#1a1a2e" stroke-width="0.8" rx="3"/>
  <line x1="10" y1="25" x2="90" y2="25" stroke="#ccc" stroke-width="0.5"/>
  <line x1="10" y1="40" x2="90" y2="40" stroke="#ccc" stroke-width="0.5"/>
  <line x1="35" y1="10" x2="35" y2="50" stroke="#ccc" stroke-width="0.5"/>
  <line x1="60" y1="10" x2="60" y2="50" stroke="#ccc" stroke-width="0.5"/>
  <line x1="18" y1="48" x2="82" y2="48" stroke="#FF6B00" stroke-width="1.5" marker-end="url(#pa)"/>
  <line x1="88" y1="48" x2="88" y2="14" stroke="#1a1a2e" stroke-width="1.5" marker-end="url(#pu)"/>
  <defs>
    <marker id="pa" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#FF6B00"/></marker>
    <marker id="pu" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#1a1a2e"/></marker>
  </defs>
</svg>

--- BIOLOGY (NEET) ---

Cell membrane (lipid bilayer cross-section):
<svg viewBox="0 0 130 50" width="130" height="50">
  <line x1="10" y1="18" x2="120" y2="18" stroke="#1a1a2e" stroke-width="1.2"/>
  <line x1="10" y1="32" x2="120" y2="32" stroke="#1a1a2e" stroke-width="1.2"/>
  <circle cx="25" cy="18" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="45" cy="18" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="65" cy="18" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="85" cy="18" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="105" cy="18" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="25" cy="32" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="45" cy="32" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="65" cy="32" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="85" cy="32" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <circle cx="105" cy="32" r="5" fill="#FF6B00" opacity="0.5" stroke="#FF6B00" stroke-width="1"/>
  <text x="45" y="47" font-size="8" fill="#1a1a2e" font-family="DM Sans">Lipid Bilayer</text>
</svg>

DNA double helix (simplified):
<svg viewBox="0 0 80 80" width="80" height="80">
  <path d="M20,5 C35,20 45,20 60,35 C45,50 35,50 20,65 C35,80 45,80 60,95" stroke="#FF6B00" stroke-width="1.8" fill="none"/>
  <path d="M60,5 C45,20 35,20 20,35 C35,50 45,50 60,65 C45,80 35,80 20,95" stroke="#1a1a2e" stroke-width="1.8" fill="none"/>
  <line x1="40" y1="20" x2="40" y2="20" stroke="#888" stroke-width="1"/>
  <line x1="28" y1="22" x2="52" y2="22" stroke="#888" stroke-width="0.8"/>
  <line x1="22" y1="35" x2="58" y2="35" stroke="#888" stroke-width="0.8"/>
  <line x1="28" y1="48" x2="52" y2="48" stroke="#888" stroke-width="0.8"/>
  <line x1="22" y1="60" x2="58" y2="60" stroke="#888" stroke-width="0.8"/>
</svg>

═══════════════════════════════
FORMULA CONTENT RULES
═══════════════════════════════

Generate 8–12 formula cards per chapter.
Include:
- Units after every formula: [Hz], [m/s], [J], [mol/L] etc.
- Special conditions inline: "(only when θ = 90°)", "(for ideal gas)"
- ⚠ examiner trap on cards where common mistakes occur
- Leave diagram blank if no correct SVG exists for that formula

═══════════════════════════════
HTML OUTPUT RULES
═══════════════════════════════

- Fully self-contained HTML
- No external images
- Google Fonts loaded via <link>
- Responsive: 2-col on desktop, 1-col on mobile
- Paper feel: background #FDFAF4, ink #1a1a2e, accent #FF6B00
- PrepEntrance header + chapter title + setulearning.in footer
- Output only the HTML — no explanation before or after

═══════════════════════════════
INPUT
═══════════════════════════════

Chapter: ${chapterName}
Subject: ${subject}
Level: ${exam}
`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const encoder = new TextEncoder();
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    console.error("[GenerateNotes] Missing GEMINI_API_KEY");
    return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      chapterName,
      subject = "Physics",
      topics = [],
      examMode = "JEE",
      mode = "notes",
      language = "english",
      forceRegenerate = false,
      action,
      chapterId: clearChapterId,
    } = body;

    // --- Cache Clear Action ---
    // Called by client validation layer when it detects bad/wrong cached content
    if (action === 'clearCache' && clearChapterId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabaseSvc = createClient(supabaseUrl, supabaseServiceKey);
      const { error: delError } = await supabaseSvc
        .from('chapter_standardized_notes')
        .delete()
        .eq('chapter_id', clearChapterId);
      if (delError) {
        console.error('[GenerateNotes] Cache clear failed:', delError);
        return new Response(JSON.stringify({ success: false, error: delError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('[GenerateNotes] Cache cleared for:', clearChapterId);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chapterId = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const lang = (language || "english").toLowerCase();

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only cache for standard notes mode
    if (mode === "notes" && !forceRegenerate) {
      const { data: cachedNote } = await supabase
        .from("chapter_standardized_notes")
        .select("content")
        .eq("chapter_id", chapterId)
        .eq("language", lang)
        .maybeSingle();

      if (cachedNote?.content) {
        console.log(`[GenerateNotes] Cache HIT for Chapter: ${chapterName} (${chapterId}) | Language: ${lang}`);
        const content = cachedNote.content;
        return new Response(
          new ReadableStream({
            async start(controller) {
              const chunkSize = 256;
              for (let i = 0; i < content.length; i += chunkSize) {
                const chunk = content.substring(i, i + chunkSize);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
                );
                await new Promise((r) => setTimeout(r, 10)); // simulated small streaming latency
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            }
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          }
        );
      }
      console.log(`[GenerateNotes] Cache MISS for Chapter: ${chapterName} (${chapterId}) | Language: ${lang}`);
    }

    const prompt = buildPrompt(chapterName, subject, topics, examMode, mode, language);

    console.log(`[GenerateNotes] Chapter: ${chapterName} | Mode: ${mode} | Language: ${language} | Exam: ${examMode}`);

    const model = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[GenerateNotes] Gemini API Error ${response.status}:`, errText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    if (!response.body) throw new Error("No response body from Gemini");

    let generatedContent = "";

    return new Response(
      response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          for (const line of text.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                  generatedContent += content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`)
                  );
                }
              } catch { /* partial JSON chunk, skip */ }
            }
          }
        },
        async flush(controller) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          if (mode === "notes" && generatedContent.trim()) {
            console.log(`[GenerateNotes] Saving/Updating generated notes to database for chapter ${chapterName} (${chapterId})`);
            const { error: upsertError } = await supabase
              .from("chapter_standardized_notes")
              .upsert({
                chapter_id: chapterId,
                chapter_name: chapterName,
                subject: subject,
                language: lang,
                content: generatedContent,
              }, {
                onConflict: "chapter_id,language"
              });
            if (upsertError) {
              console.error("[GenerateNotes] Cache write/upsert failed:", upsertError);
            }
          }
        },
      })),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      }
    );

  } catch (error: unknown) {
    console.error("[GenerateNotes] Fatal Error:", error);
    const msg = "The notes engine encountered an error. Please refresh and try again.";
    return new Response(
      encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: msg } }] })}\n\ndata: [DONE]\n\n`),
      { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
    );
  }
});
