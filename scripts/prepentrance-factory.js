#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually to ensure variables are loaded in local node execution
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

// CLI args parsing
const args = process.argv.slice(2);
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const hasFlag = (f) => args.includes(f);

const FILTER_SUBJECT = getArg('--subject');
const FILTER_CHAPTER = getArg('--chapter');
const LIMIT = parseInt(getArg('--limit') || '200', 10);
const DRY_RUN = hasFlag('--dry-run');

// Keys setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// Global metrics
const metrics = {
  generated_count: 0,
  validated_count: 0,
  approved_count: 0,
  rejected_count: 0,
  approval_rate: 0
};

// Chapter coverage tracker
const chapterCoverage = [];

// TARGET CURRICULUM BLUEPRINT
const CURRICULUM = [
  // Physics
  { subject: 'Physics', chapter: 'Mechanics', topic: 'Relative Motion', concepts: ['River Boat Problems', 'Rain Man Problems', 'Pursuit Problems'] },
  { subject: 'Physics', chapter: 'Mechanics', topic: 'Laws of Motion', concepts: ['Newton Laws', 'Friction', 'Pulley Systems'] },
  { subject: 'Physics', chapter: 'Electrostatics', topic: 'Electric Potential', concepts: ['Earthing concentric shells', 'Capacitors'] },
  // Chemistry
  { subject: 'Chemistry', chapter: 'Physical Chemistry', topic: 'Mole Concept', concepts: ['Molarity', 'Molality', 'Stoichiometry'] },
  { subject: 'Chemistry', chapter: 'Inorganic Chemistry', topic: 'Chemical Bonding', concepts: ['VSEPR Theory', 'Hybridization'] },
  // Mathematics
  { subject: 'Mathematics', chapter: 'Algebra', topic: 'Matrices', concepts: ['Matrix Multiplication', 'Determinants', 'Inverse Matrix'] },
  { subject: 'Mathematics', chapter: 'Calculus', topic: 'Limits', concepts: ['Indeterminate Forms', 'L\'Hospital Rule'] }
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function updateApprovalRate() {
  const total = metrics.validated_count + metrics.rejected_count;
  metrics.approval_rate = total > 0 ? ((metrics.validated_count / total) * 100).toFixed(1) : 0;
}

// Print reporting dashboards
async function printRepositoryDashboard() {
  console.log('\n\x1b[36m========== PREPENTRANCE FACTORY REPOSITORY DASHBOARD ==========\x1b[0m');
  
  // Production stats
  const { count: prodCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Total Production Questions: \x1b[32m${prodCount || 0}\x1b[0m`);

  // Staging stats
  const { count: stagingCount } = await supabase.from('staging_questions').select('*', { count: 'exact', head: true });
  console.log(`Total Staging Questions:    \x1b[33m${stagingCount || 0}\x1b[0m`);

  // Generation Metrics
  console.log('\x1b[35m--- Generation Pipeline Metrics ---\x1b[0m');
  console.log(`Generated: ${metrics.generated_count} | Validated: ${metrics.validated_count} | Approved: ${metrics.approved_count} | Rejected: ${metrics.rejected_count} | Approval Rate: ${metrics.approval_rate}%`);

  // Coverage Stats
  console.log('\x1b[35m--- Chapter Coverage Metrics ---\x1b[0m');
  for (const c of chapterCoverage) {
    console.log(`[${c.subject}] Chapter: ${c.chapter} | Topic: ${c.topic} | Concept: ${c.concept} | Question Count: ${c.count}`);
  }
  console.log('\x1b[36m================================================================\x1b[0m\n');
}

// Call Gemini API directly
async function callGemini(prompt, temperature = 0.5) {
  if (!GEMINI_KEY) {
    throw new Error('GEMINI_API_KEY / VITE_GEMINI_API_KEY is not configured.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, response_mime_type: 'application/json' }
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
  }
  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text.trim());
}

// Step 1: Generator Layer
async function generateCandidates(subject, chapter, topic, concept, count) {
  const prompt = `You are a legendary JEE faculty question setter. Generate exactly ${count} verified JEE Main-style multiple-choice questions for:
Subject: ${subject}
Chapter: ${chapter}
Topic: ${topic}
Concept: ${concept}

Rules:
- High-quality NTA-style wording only.
- No direct formula substitution. Multi-step reasoning required.
- Distractors must model actual misconceptions. Map each distractor to misconception tags (e.g. "M001", "M002").
- Source Pattern must be one of: "Inspired by JEE Main PYQ", "Inspired by JEE Advanced PYQ", "Inspired by Allen DLP", "Inspired by Resonance Module".
- Explanation must contain exactly 5 labeled sections: **Concept**, **Formula Used**, **Step-by-Step Solution**, **Shortcut**, **JEE Insight**.

Return ONLY a JSON object matching this structure:
{
  "questions": [
    {
      "question_text": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation": "string",
      "option_misconceptions": {
        "A": "string", // e.g. "M001" or "Correct Answer"
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "source_pattern": "string"
    }
  ]
}`;
  const data = await callGemini(prompt, 0.6);
  return data.questions || [];
}

// Step 2: Validator Layer
async function validateCandidates(questions) {
  const prompt = `You are an independent Senior JEE Faculty Auditor. Solve/recompute each question independently.
Here are the candidate questions:
${JSON.stringify(questions, null, 2)}

For each question:
1. Recompute the correct answer step-by-step from scratch using only the question_text.
2. Verify option authenticity (exactly one valid answer exists, options are unique).
3. Verify solvability (no missing or contradictory parameters, target quantity is computable).
4. Calibrate difficulty score (1-10) and map to: easy (30%), medium (50%), hard (20%). Easy: score <= 3, Medium: score <= 7, Hard: score > 7.
5. Grade components (1-10) for clarity, data sufficiency, JEE authenticity.

Return ONLY a JSON object:
{
  "validations": [
    {
      "valid": boolean, // true if all criteria pass
      "reason": "string",
      "difficulty_score": number, // 1-10
      "mistake_type": "Conceptual" | "Calculation" | "Silly" | "Guessed" | "None",
      "faculty_review": {
        "question_clarity": number,
        "data_sufficiency": number,
        "jee_authenticity": number,
        "overall_score": number
      }
    }
  ]
}`;
  const data = await callGemini(prompt, 0.1);
  return data.validations || [];
}

// Main execution function
async function run() {
  console.log(`Starting PrepEntrance Factory in ${DRY_RUN ? 'DRY-RUN' : 'LIVE'} mode...`);
  
  const targets = CURRICULUM.filter(c => {
    if (FILTER_SUBJECT && c.subject.toLowerCase() !== FILTER_SUBJECT.toLowerCase()) return false;
    if (FILTER_CHAPTER && 
        c.chapter.toLowerCase() !== FILTER_CHAPTER.toLowerCase() && 
        c.topic.toLowerCase() !== FILTER_CHAPTER.toLowerCase()) return false;
    return true;
  });

  if (targets.length === 0) {
    console.log('No curriculum targets matched the filters.');
    return;
  }

  for (const target of targets) {
    for (const concept of target.concepts) {
      console.log(`\nGenerating for Concept: "${concept}" (${target.subject} -> ${target.chapter} -> ${target.topic})`);
      
      let candidates = [];
      try {
        candidates = await generateCandidates(target.subject, target.chapter, target.topic, concept, LIMIT);
        metrics.generated_count += candidates.length;
        console.log(`Generated ${candidates.length} candidates.`);
      } catch (err) {
        console.error(`Generation failed for concept ${concept}:`, err.message);
        continue;
      }

      let validations = [];
      try {
        validations = await validateCandidates(candidates);
      } catch (err) {
        console.error(`Validation failed for concept ${concept}:`, err.message);
        continue;
      }

      const validatedQuestions = [];
      
      for (let i = 0; i < candidates.length; i++) {
        const q = candidates[i];
        const val = validations[i] || { valid: false, reason: 'Missing validation response' };

        const status = val.valid ? 'VALIDATED' : 'REJECTED';
        if (val.valid) {
          metrics.validated_count++;
        } else {
          metrics.rejected_count++;
        }
        updateApprovalRate();

        const diffScore = val.difficulty_score || 5.0;
        const diffMap = diffScore <= 3.0 ? 'easy' : diffScore <= 7.0 ? 'medium' : 'hard';

        const stagingRow = {
          topic: target.topic,
          subtopic: concept,
          concept: concept,
          difficulty: diffMap,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          correct_index: ['A','B','C','D'].indexOf(q.correct_answer),
          explanation: q.explanation,
          tags: [target.subject, target.chapter, concept],
          is_verified: false,
          question_quality_score: val.faculty_review?.overall_score >= 8 ? 'ELITE' : 'GOOD',
          difficulty_score: diffScore * 10,
          mistake_type: val.mistake_type || 'None',
          source: q.source_pattern || 'Inspired by JEE Main PYQ',
          verification_status: status,
          status: status,
          subject: target.subject,
          chapter: target.chapter,
          exam_type: 'JEE_MAINS'
        };

        if (DRY_RUN) {
          console.log(`[DRY-RUN] Question Staged with status: ${status}`);
          if (val.valid) {
            console.log(`[DRY-RUN] Promoted approved question to production.`);
            metrics.approved_count++;
          }
        } else {
          // 1. Insert into staging
          const { data: stagedData, error: stagingErr } = await supabase
            .from('staging_questions')
            .insert([stagingRow])
            .select();

          if (stagingErr) {
            console.error('Staging insert failed:', stagingErr.message);
            continue;
          }

          // 2. If approved/validated, copy/promote to production questions
          if (val.valid) {
            const prodRow = { ...stagingRow, is_verified: true, verification_status: 'APPROVED' };
            delete prodRow.status; // status is staging only
            
            const { error: prodErr } = await supabase
              .from('questions')
              .insert([prodRow]);

            if (prodErr) {
              console.error('Production promotion failed:', prodErr.message);
            } else {
              metrics.approved_count++;
              // Update staging status to APPROVED
              if (stagedData && stagedData[0]) {
                await supabase
                  .from('staging_questions')
                  .update({ status: 'APPROVED', verification_status: 'APPROVED' })
                  .eq('id', stagedData[0].id);
              }
            }
          }
        }
      }

      chapterCoverage.push({
        subject: target.subject,
        chapter: target.chapter,
        topic: target.topic,
        concept: concept,
        count: candidates.filter((_, i) => validations[i]?.valid).length
      });

      await printRepositoryDashboard();
    }
  }
  
  console.log('\nSeeding Run Completed Successfully.');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
