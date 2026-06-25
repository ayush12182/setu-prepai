import { buildDeterministicSession, resolveTopicCatalogEntry, validateTopicMatch } from '../services/sessionBuilder.ts';
import { getOfflineQuestions } from '../data/offlineQuestionBank.ts';

const topics = [
  // Physics
  { subject: 'Physics', topic: 'Units & Dimensions', chapter: 'units & dimensions' },
  { subject: 'Physics', topic: 'Kinematics', chapter: 'graphs' },
  { subject: 'Physics', topic: 'Relative Motion', chapter: 'relative motion' },
  { subject: 'Physics', topic: 'Laws of Motion', chapter: 'laws of motion' },
  { subject: 'Physics', topic: 'Work Power Energy', chapter: 'wpe' },
  { subject: 'Physics', topic: 'Rotation', chapter: 'rotational motion' },
  { subject: 'Physics', topic: 'Electrostatics', chapter: 'electrostatics' },
  // Chemistry
  { subject: 'Chemistry', topic: 'Mole Concept', chapter: 'mole concept' },
  { subject: 'Chemistry', topic: 'Chemical Bonding', chapter: 'chemical bonding' },
  // Mathematics
  { subject: 'Mathematics', topic: 'Functions', chapter: 'functions' },
  { subject: 'Mathematics', topic: 'Matrices', chapter: 'matrix operations' },
  { subject: 'Mathematics', topic: 'Limits', chapter: 'limits' }
];

console.log("=== STARTING UNIVERSAL QUESTION ENGINE PROGRAMMATIC AUDIT ===");

const results: any[] = [];
let totalFormulaErrors = 0;

for (const t of topics) {
  for (const count of [10, 25, 50, 100]) {
    try {
      const pool = getOfflineQuestions(t.subject, t.chapter, 'medium', count * 3);
      
      const sessionRes = buildDeterministicSession(pool, {
        chapter: t.chapter,
        difficulty: 'medium',
        count: count
      });
      
      const diag = sessionRes.diagnostics;
      
      sessionRes.questions.forEach(q => {
        const text = q.question_text || '';
        const explanation = q.explanation || '';
        if (text.includes('\\\\') && !text.includes('\\begin') && !text.includes('\\frac')) {
          totalFormulaErrors++;
        }
        if (explanation.includes('[insert') || text.includes('[insert')) {
          totalFormulaErrors++;
        }
      });

      results.push({
        subject: rName(t.subject),
        topic: t.topic,
        requested: count,
        generated: diag.totalGenerated,
        accepted: diag.finalAccepted,
        fidelity: diag.topicRelevance,
        duplicateRate: diag.duplicateRate,
        coverage: diag.coverageRatio,
        rejectedQuality: diag.rejectedLowQuality,
        status: diag.topicRelevance >= 95 ? 'PASS' : 'FAIL'
      });
    } catch (e: any) {
      results.push({
        subject: rName(t.subject),
        topic: t.topic,
        requested: count,
        generated: 0,
        accepted: 0,
        fidelity: 0,
        duplicateRate: 0,
        coverage: 0,
        rejectedQuality: 0,
        status: `FAIL (${e.message.split('.')[0]})`
      });
    }
  }
}

function rName(s: string) {
  return s;
}

// Generate the final Markdown report output
console.log("\n### Universal Question Engine Audit Report\n");
console.log("| Subject | Topic | Requested | Generated | Accepted | Topic Fidelity | Duplicate % | Concept Coverage % | Status |");
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
results.forEach(r => {
  console.log(`| ${r.subject} | ${r.topic} (${r.requested}) | ${r.requested} | ${r.generated} | ${r.accepted} | ${r.fidelity}% | ${r.duplicateRate}% | ${r.coverage.toFixed(1)}% | ${r.status} |`);
});

console.log(`\nFormula Errors Found: ${totalFormulaErrors}`);
console.log("=== AUDIT COMPLETED ===");
