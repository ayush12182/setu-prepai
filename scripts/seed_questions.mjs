#!/usr/bin/env node
/**
 * PrepEntrance Question Bank Mega Seeder
 * ───────────────────────────────
 * Generates 30,000+ MCQs across all 104 curriculum topics.
 * Runs locally (no timeout), calls Gemini directly, bulk-inserts into Supabase.
 *
 * Usage: node seed_questions.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://osbpdjlywgydidzurpsb.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ Set SUPABASE_SERVICE_KEY env var");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ Set GEMINI_API_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const QUESTIONS_PER_TOPIC = 300;      // target per topic (60 batches × 5 = 300)
const BATCH_SIZE = 5;                 // 5 per Gemini call — safe within token limits
const INSERT_BATCH = 100;             // DB insert batch size
const RETRY_LIMIT = 3;
const DELAY_MS = 200;                 // ms between Gemini calls

// ─── Full 104-topic curriculum ────────────────────────────────────────────────
const CURRICULUM = [
  // JEE_MAINS — Physics (12)
  { exam:"JEE_MAINS", subject:"Physics", topic:"Mechanics",         subtopic:"Kinematics — 1D & 2D" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Mechanics",         subtopic:"Laws of Motion & Friction" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Mechanics",         subtopic:"Work, Energy & Power" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Mechanics",         subtopic:"Rotational Motion" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Current Electricity",subtopic:"Ohm's Law & Circuits" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Current Electricity",subtopic:"Kirchhoff's Laws" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Electrostatics",    subtopic:"Coulombs Law & Electric Field" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Electrostatics",    subtopic:"Potential & Capacitance" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Optics",            subtopic:"Ray Optics — Mirrors & Lenses" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Optics",            subtopic:"Wave Optics — Interference" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Modern Physics",    subtopic:"Photoelectric Effect" },
  { exam:"JEE_MAINS", subject:"Physics", topic:"Modern Physics",    subtopic:"Atomic Models & Nuclear Physics" },
  // JEE_MAINS — Chemistry (9)
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Physical Chemistry",  subtopic:"Mole Concept & Stoichiometry" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Physical Chemistry",  subtopic:"Chemical Equilibrium" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Physical Chemistry",  subtopic:"Electrochemistry" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Inorganic Chemistry", subtopic:"Periodic Table & Properties" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Inorganic Chemistry", subtopic:"Chemical Bonding" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Inorganic Chemistry", subtopic:"D-Block & Coordination Compounds" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Organic Chemistry",   subtopic:"Hydrocarbons" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Organic Chemistry",   subtopic:"Alcohols, Phenols & Ethers" },
  { exam:"JEE_MAINS", subject:"Chemistry", topic:"Organic Chemistry",   subtopic:"Carbonyl Compounds" },
  // JEE_MAINS — Mathematics (11)
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Algebra",             subtopic:"Complex Numbers" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Algebra",             subtopic:"Matrices & Determinants" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Algebra",             subtopic:"Probability" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Calculus",            subtopic:"Limits & Continuity" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Calculus",            subtopic:"Differentiation" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Calculus",            subtopic:"Integration" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Calculus",            subtopic:"Differential Equations" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Coordinate Geometry", subtopic:"Straight Lines & Circles" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Coordinate Geometry", subtopic:"Parabola, Ellipse & Hyperbola" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Vectors & 3D",        subtopic:"Vector Algebra" },
  { exam:"JEE_MAINS", subject:"Mathematics", topic:"Vectors & 3D",        subtopic:"3D Geometry" },
  // NEET — Biology (11)
  { exam:"NEET", subject:"Biology", topic:"Cell Biology",       subtopic:"Cell Structure & Organelles" },
  { exam:"NEET", subject:"Biology", topic:"Cell Biology",       subtopic:"Cell Division — Mitosis & Meiosis" },
  { exam:"NEET", subject:"Biology", topic:"Genetics",           subtopic:"Mendel's Laws" },
  { exam:"NEET", subject:"Biology", topic:"Genetics",           subtopic:"Molecular Basis of Inheritance" },
  { exam:"NEET", subject:"Biology", topic:"Human Physiology",   subtopic:"Digestion & Absorption" },
  { exam:"NEET", subject:"Biology", topic:"Human Physiology",   subtopic:"Circulation & Respiration" },
  { exam:"NEET", subject:"Biology", topic:"Human Physiology",   subtopic:"Excretion" },
  { exam:"NEET", subject:"Biology", topic:"Ecology",            subtopic:"Ecosystems & Food Chains" },
  { exam:"NEET", subject:"Biology", topic:"Ecology",            subtopic:"Biodiversity & Conservation" },
  { exam:"NEET", subject:"Biology", topic:"Reproduction",       subtopic:"Reproduction in Flowering Plants" },
  { exam:"NEET", subject:"Biology", topic:"Reproduction",       subtopic:"Human Reproduction" },
  // NEET — Chemistry (3)
  { exam:"NEET", subject:"Chemistry", topic:"Physical Chemistry",  subtopic:"Solutions & Colligative Properties" },
  { exam:"NEET", subject:"Chemistry", topic:"Inorganic Chemistry", subtopic:"p-Block Elements" },
  { exam:"NEET", subject:"Chemistry", topic:"Organic Chemistry",   subtopic:"Biomolecules" },
  // NEET — Physics (3)
  { exam:"NEET", subject:"Physics", topic:"Mechanics",      subtopic:"Laws of Motion" },
  { exam:"NEET", subject:"Physics", topic:"Modern Physics", subtopic:"Dual Nature & Photoelectric Effect" },
  { exam:"NEET", subject:"Physics", topic:"Optics",         subtopic:"Ray & Wave Optics" },
  // CUET — Accounts (12)
  { exam:"CUET", subject:"Accounts", topic:"Accounting Basics",        subtopic:"Accounting Principles & Concepts" },
  { exam:"CUET", subject:"Accounts", topic:"Accounting Basics",        subtopic:"Journal & Ledger" },
  { exam:"CUET", subject:"Accounts", topic:"Accounting Basics",        subtopic:"Trial Balance" },
  { exam:"CUET", subject:"Accounts", topic:"Partnership Accounts",     subtopic:"Partnership Deed & Capital" },
  { exam:"CUET", subject:"Accounts", topic:"Partnership Accounts",     subtopic:"Admission & Retirement" },
  { exam:"CUET", subject:"Accounts", topic:"Partnership Accounts",     subtopic:"Dissolution of Partnership" },
  { exam:"CUET", subject:"Accounts", topic:"Company Accounts",         subtopic:"Share Capital" },
  { exam:"CUET", subject:"Accounts", topic:"Company Accounts",         subtopic:"Debentures" },
  { exam:"CUET", subject:"Accounts", topic:"Financial Statements",     subtopic:"P&L Account & Balance Sheet" },
  { exam:"CUET", subject:"Accounts", topic:"Financial Statements",     subtopic:"Cash Flow Statement" },
  { exam:"CUET", subject:"Accounts", topic:"Analysis of Statements",   subtopic:"Ratio Analysis" },
  { exam:"CUET", subject:"Accounts", topic:"Analysis of Statements",   subtopic:"Comparative & Common Size" },
  // CUET — Business Studies (10)
  { exam:"CUET", subject:"Business Studies", topic:"Management",       subtopic:"Nature & Principles of Management" },
  { exam:"CUET", subject:"Business Studies", topic:"Management",       subtopic:"Planning & Organizing" },
  { exam:"CUET", subject:"Business Studies", topic:"Management",       subtopic:"Directing & Controlling" },
  { exam:"CUET", subject:"Business Studies", topic:"Business Finance", subtopic:"Financial Markets" },
  { exam:"CUET", subject:"Business Studies", topic:"Business Finance", subtopic:"Sources of Business Finance" },
  { exam:"CUET", subject:"Business Studies", topic:"Marketing",        subtopic:"Marketing Mix" },
  { exam:"CUET", subject:"Business Studies", topic:"Marketing",        subtopic:"Consumer Protection" },
  { exam:"CUET", subject:"Business Studies", topic:"HR",               subtopic:"Staffing & Recruitment" },
  { exam:"CUET", subject:"Business Studies", topic:"HR",               subtopic:"Training & Development" },
  { exam:"CUET", subject:"Business Studies", topic:"Entrepreneurship", subtopic:"Business Environment" },
  // CUET — Economics (9)
  { exam:"CUET", subject:"Economics", topic:"Microeconomics",  subtopic:"Demand & Supply" },
  { exam:"CUET", subject:"Economics", topic:"Microeconomics",  subtopic:"Elasticity" },
  { exam:"CUET", subject:"Economics", topic:"Microeconomics",  subtopic:"Market Structures" },
  { exam:"CUET", subject:"Economics", topic:"Macroeconomics",  subtopic:"National Income" },
  { exam:"CUET", subject:"Economics", topic:"Macroeconomics",  subtopic:"Money & Banking" },
  { exam:"CUET", subject:"Economics", topic:"Macroeconomics",  subtopic:"Government Budget" },
  { exam:"CUET", subject:"Economics", topic:"Indian Economy",  subtopic:"Economic Development" },
  { exam:"CUET", subject:"Economics", topic:"Indian Economy",  subtopic:"Poverty & Employment" },
  { exam:"CUET", subject:"Economics", topic:"Statistics",      subtopic:"Measures of Central Tendency" },
  // CUET — English (12)
  { exam:"CUET", subject:"English", topic:"Reading Comprehension", subtopic:"Unseen Passage Analysis" },
  { exam:"CUET", subject:"English", topic:"Reading Comprehension", subtopic:"Inference & Main Idea" },
  { exam:"CUET", subject:"English", topic:"Grammar",               subtopic:"Tenses & Verb Forms" },
  { exam:"CUET", subject:"English", topic:"Grammar",               subtopic:"Prepositions & Conjunctions" },
  { exam:"CUET", subject:"English", topic:"Grammar",               subtopic:"Subject-Verb Agreement" },
  { exam:"CUET", subject:"English", topic:"Vocabulary",            subtopic:"Synonyms & Antonyms" },
  { exam:"CUET", subject:"English", topic:"Vocabulary",            subtopic:"Idioms & Phrases" },
  { exam:"CUET", subject:"English", topic:"Vocabulary",            subtopic:"One-Word Substitution" },
  { exam:"CUET", subject:"English", topic:"Writing Skills",        subtopic:"Formal & Informal Letters" },
  { exam:"CUET", subject:"English", topic:"Writing Skills",        subtopic:"Notice & Report Writing" },
  { exam:"CUET", subject:"English", topic:"Literature",            subtopic:"Prose & Poetry Analysis" },
  { exam:"CUET", subject:"English", topic:"Literature",            subtopic:"Character & Theme" },
  // CUET — General Test (12)
  { exam:"CUET", subject:"General Test", topic:"Logical Reasoning",    subtopic:"Syllogisms" },
  { exam:"CUET", subject:"General Test", topic:"Logical Reasoning",    subtopic:"Blood Relations" },
  { exam:"CUET", subject:"General Test", topic:"Logical Reasoning",    subtopic:"Seating Arrangements" },
  { exam:"CUET", subject:"General Test", topic:"Logical Reasoning",    subtopic:"Coding-Decoding" },
  { exam:"CUET", subject:"General Test", topic:"Quantitative Aptitude",subtopic:"Percentages & Profit-Loss" },
  { exam:"CUET", subject:"General Test", topic:"Quantitative Aptitude",subtopic:"Time, Speed & Distance" },
  { exam:"CUET", subject:"General Test", topic:"Quantitative Aptitude",subtopic:"Ratios & Proportions" },
  { exam:"CUET", subject:"General Test", topic:"Quantitative Aptitude",subtopic:"Number Series & Patterns" },
  { exam:"CUET", subject:"General Test", topic:"General Knowledge",    subtopic:"Indian History & Polity" },
  { exam:"CUET", subject:"General Test", topic:"General Knowledge",    subtopic:"Geography & Environment" },
  { exam:"CUET", subject:"General Test", topic:"General Knowledge",    subtopic:"Science & Technology" },
  { exam:"CUET", subject:"General Test", topic:"General Knowledge",    subtopic:"Current Affairs" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildPrompt(node, batchSize, batchIndex, totalBatches) {
  const examLabel = node.exam === "JEE_MAINS" ? "JEE" : node.exam === "JEE_ADVANCED" ? "JEE" : node.exam;
  const easy = Math.round(batchSize * 0.4);
  const medium = Math.round(batchSize * 0.4);
  const hard = batchSize - easy - medium;

  return `You are a ${examLabel} question bank generator. Generate exactly ${batchSize} unique MCQs.

Exam: ${examLabel} | Subject: ${node.subject} | Topic: ${node.topic} | Subtopic: ${node.subtopic}
Batch ${batchIndex + 1}/${totalBatches} — generate DIFFERENT questions from other batches.
Difficulty: ${easy} easy, ${medium} medium, ${hard} hard.

Rules:
- 4 options (A/B/C/D), 1 correct, all plausible
- Explanation: concise (max 60 words), step-by-step
- No repeated question stems or values
${examLabel === "NEET" ? "- Strictly NCERT Class 11-12" : ""}
${examLabel === "JEE" ? "- Multi-step problems, proper notation" : ""}

Return ONLY a JSON array of exactly ${batchSize} objects:
[{"question_text":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct_answer":"A","difficulty":"easy|medium|hard","explanation":"...","tags":["concept"],"quality_score":0.9,"estimated_time_seconds":60}]`;
}

function extractJsonArray(raw) {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON array brackets found in response`);
  }
  return raw.slice(start, end + 1);
}

async function callGemini(prompt, attempt = 1) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65 + attempt * 0.05,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    // Exponential backoff for rate limits / overload
    if (res.status === 503 || res.status === 429) {
      await sleep(3000 * attempt);
    }
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = await res.json();

  // Check for finish reason issues
  const candidate = json.candidates?.[0];
  if (!candidate) throw new Error("No candidate in Gemini response");

  // Check for truncation
  if (candidate.finishReason === "MAX_TOKENS") {
    throw new Error("Response truncated (MAX_TOKENS) — reduce batch size or explanation length");
  }

  const raw = (candidate.content?.parts?.[0]?.text ?? "").trim();
  if (!raw) throw new Error("Empty text in Gemini response");

  const jsonStr = extractJsonArray(raw);

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON parse failed: ${e.message}. Snippet: ${jsonStr.slice(0, 200)}`);
  }

  return Array.isArray(parsed) ? parsed : [parsed];
}


function mapToRow(q, node, existingTexts) {
  const examNorm = node.exam === "JEE_MAINS" ? "JEE" : node.exam === "JEE_ADVANCED" ? "JEE" : node.exam;
  const diff = (q.difficulty || "medium").toLowerCase();
  const diffFmt = diff.charAt(0).toUpperCase() + diff.slice(1);
  const timeMap = { easy: 45, medium: 75, hard: 150 };

  // Duplicate check
  const textKey = q.question_text?.trim().toLowerCase().slice(0, 100);
  if (!textKey || existingTexts.has(textKey)) return null;
  existingTexts.add(textKey);

  // Validate structure
  if (!q.options?.A || !q.options?.B || !q.options?.C || !q.options?.D) return null;
  if (!["A","B","C","D"].includes((q.correct_answer || "").toUpperCase())) return null;

  return {
    question_id: `${examNorm}_${node.subject.replace(/\s+/g,"")}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    exam: examNorm,
    subject: node.subject,
    topic: node.topic,
    subtopic: node.subtopic,
    ncert_chapter: node.topic,
    difficulty: diffFmt,
    question_type: "TYPE_A",
    exam_stage: "practice",
    question_text: q.question_text,
    options: q.options,
    correct_option: q.correct_answer.toUpperCase().charAt(0),
    explanation: {
      short: (q.explanation || "").slice(0, 150),
      detailed_steps: [q.explanation || ""],
      ncert_reference: `${node.subject} — ${node.topic}`,
    },
    tags: q.tags || [examNorm, node.subject, node.topic, node.subtopic],
    ai_quality_score: q.quality_score || 0.9,
    quality_gate_passed: (q.quality_score || 0.9) >= 0.7,
    estimated_time_seconds: q.estimated_time_seconds || timeMap[diff] || 75,
    pyq_similar: false,
    is_verified: false,
    generation_model: "gemini-2.5-flash",
    micro_concept: node.subtopic,
    source: "ai",
  };
}

async function insertBatch(rows) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    const { error } = await supabase.from("questions_bank").insert(rows);
    if (!error) return rows.length;
    console.warn(`   ⚠ Insert attempt ${attempt} failed: ${error.message}`);
    if (attempt < RETRY_LIMIT) await sleep(1000 * attempt);
  }
  return 0;
}

async function seedTopic(node, existingTexts, topicIndex) {
  const totalBatches = Math.ceil(QUESTIONS_PER_TOPIC / BATCH_SIZE);
  let topicTotal = 0;
  const tag = `[${topicIndex+1}/104] ${node.exam}/${node.subject}/${node.subtopic}`;

  console.log(`\n🔵 ${tag}`);

  let pendingRows = [];

  for (let b = 0; b < totalBatches; b++) {
    let questions = [];
    let success = false;

    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
      try {
        const prompt = buildPrompt(node, BATCH_SIZE, b, totalBatches);
        questions = await callGemini(prompt, attempt - 1);
        success = true;
        break;
      } catch (err) {
        console.warn(`   ⚠ Batch ${b+1} attempt ${attempt}: ${err.message}`);
        if (attempt < RETRY_LIMIT) await sleep(2000 * attempt);
      }
    }

    if (!success) { console.error(`   ✗ Batch ${b+1} failed after ${RETRY_LIMIT} attempts`); continue; }

    const rows = questions.map((q) => mapToRow(q, node, existingTexts)).filter(Boolean);
    pendingRows.push(...rows);

    // Insert when we have a full INSERT_BATCH
    while (pendingRows.length >= INSERT_BATCH) {
      const toInsert = pendingRows.splice(0, INSERT_BATCH);
      const inserted = await insertBatch(toInsert);
      topicTotal += inserted;
      console.log(`   ✓ Batch ${b+1}: +${rows.length} generated, +${inserted} inserted (topic total: ${topicTotal})`);
    }

    await sleep(DELAY_MS);
  }

  // Insert remaining
  if (pendingRows.length > 0) {
    const inserted = await insertBatch(pendingRows);
    topicTotal += inserted;
    console.log(`   ✓ Final flush: +${inserted} inserted (topic total: ${topicTotal})`);
  }

  return topicTotal;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  PrepEntrance Question Bank Mega Seeder");
  console.log(`  Target: ${CURRICULUM.length} topics × ${QUESTIONS_PER_TOPIC} questions = ${CURRICULUM.length * QUESTIONS_PER_TOPIC} questions`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Load existing question texts for dedup
  console.log("📋 Loading existing questions for dedup check...");
  const { data: existing } = await supabase.from("questions_bank").select("question_text");
  const existingTexts = new Set(
    (existing || []).map((q) => q.question_text?.trim().toLowerCase().slice(0, 100))
  );
  console.log(`   ${existingTexts.size} existing questions loaded.\n`);

  let grandTotal = 0;
  const startTime = Date.now();
  const topicResults = [];

  for (let i = 0; i < CURRICULUM.length; i++) {
    const node = CURRICULUM[i];
    try {
      const count = await seedTopic(node, existingTexts, i);
      grandTotal += count;
      topicResults.push({ subtopic: node.subtopic, count, status: "ok" });
    } catch (err) {
      console.error(`✗ Topic ${node.subtopic} failed: ${err.message}`);
      topicResults.push({ subtopic: node.subtopic, count: 0, status: "error", error: err.message });
    }

    const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
    const remaining = CURRICULUM.length - i - 1;
    const avgPerTopic = grandTotal / (i + 1);
    const etaMin = remaining > 0 ? ((remaining * (Date.now() - startTime) / (i + 1)) / 60000).toFixed(0) : 0;
    console.log(`\n📊 Progress: ${i+1}/${CURRICULUM.length} topics | ${grandTotal} questions | ${elapsed}min elapsed | ~${etaMin}min remaining`);
  }

  // Final count
  const { count: finalCount } = await supabase.from("questions_bank").select("*", { count: "exact", head: true });

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  ✅ SEEDING COMPLETE");
  console.log(`  Total generated this run : ${grandTotal}`);
  console.log(`  Total in DB now          : ${finalCount}`);
  console.log(`  Topics covered           : ${topicResults.filter(t => t.status === "ok").length}/${CURRICULUM.length}`);
  console.log(`  Time elapsed             : ${elapsed} minutes`);
  console.log("═══════════════════════════════════════════════════════════");

  console.log("\n📦 Final summary JSON:");
  console.log(JSON.stringify({
    total_questions_generated: grandTotal,
    total_in_db: finalCount,
    topics_covered: topicResults.filter(t => t.status === "ok").length,
    topics_failed: topicResults.filter(t => t.status === "error").length,
    status: finalCount >= 30000 ? "success" : "partial",
    elapsed_minutes: elapsed,
  }, null, 2));
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
