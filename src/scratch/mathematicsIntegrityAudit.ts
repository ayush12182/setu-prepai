import * as fs from 'fs';
import * as path from 'path';
import { mathsChapters } from '../data/syllabus';

export function runMathematicsIntegrityAudit() {
  console.log("=== STARTING MATHEMATICS CURRICULUM GRAPH INTEGRITY AUDIT ===");

  const expandedDir = path.resolve(process.cwd(), 'src/data/expanded');
  const formulasDir = path.resolve(process.cwd(), 'src/data/formulas');

  const conceptsMathPath = path.join(expandedDir, 'mathematics_expanded.json');
  const formulasMathPath = path.join(formulasDir, 'mathematics.json');
  const misconceptionsPath = path.join(expandedDir, 'misconceptions_expanded.json');

  const loadJson = (p) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
  const loadJsonObj = (p) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};

  const concepts = loadJson(conceptsMathPath);
  const formulas = loadJson(formulasMathPath);
  const misconceptions = loadJsonObj(misconceptionsPath);

  // Checks and Counters
  const duplicateConceptNames: string[] = [];
  const duplicateConceptIds: string[] = [];
  const duplicateFormulaIds: string[] = [];
  const invalidFormulaVariables: string[] = [];
  const invalidFormulaUnits: string[] = [];
  const traceabilityFailures: string[] = [];
  const invalidMisconceptionCounts: string[] = [];
  const missingMisconceptionTypes: string[] = [];
  const missingPyqFields: string[] = [];
  const orphanConcepts: string[] = [];
  const missingFormulaLinks: string[] = [];

  // Track unique keys
  const conceptNamesSeen = new Set<string>();
  const conceptIdsSeen = new Set<string>();
  const formulaIdsSeen = new Set<string>();

  // 1. Concept Uniqueness Checks
  concepts.forEach((c: any) => {
    // Check duplicate ID
    if (conceptIdsSeen.has(c.concept_id)) {
      duplicateConceptIds.push(c.concept_id);
    } else {
      conceptIdsSeen.add(c.concept_id);
    }

    // Check duplicate Name
    if (conceptNamesSeen.has(c.concept_name)) {
      duplicateConceptNames.push(c.concept_name);
    } else {
      conceptNamesSeen.add(c.concept_name);
    }
  });

  // 2. Formula Integrity Checks
  formulas.forEach((f: any) => {
    // Check duplicate formula ID
    if (formulaIdsSeen.has(f.id)) {
      duplicateFormulaIds.push(f.id);
    } else {
      formulaIdsSeen.add(f.id);
    }

    // Check variables mapping
    if (!f.variables || typeof f.variables !== 'object' || Object.keys(f.variables).length === 0) {
      invalidFormulaVariables.push(f.id);
    }

    // Check units mapping
    if (!f.units || typeof f.units !== 'object' || Object.keys(f.units).length === 0) {
      invalidFormulaUnits.push(f.id);
    }
  });

  // 3. Traceability, Misconception, and PYQ Checks per Concept
  concepts.forEach((c: any) => {
    // Traceability Audit: Subject -> Chapter -> Topic -> Subtopic -> Concept
    if (!c.subject || c.subject !== 'mathematics') {
      traceabilityFailures.push(`Concept ${c.concept_id}: missing/incorrect subject '${c.subject}'`);
    }
    
    const matchedChapter = mathsChapters.find(ch => ch.name.toLowerCase() === c.chapter?.toLowerCase());
    if (!matchedChapter) {
      traceabilityFailures.push(`Concept ${c.concept_id}: chapter '${c.chapter}' not found in static syllabus`);
      orphanConcepts.push(c.concept_id);
    } else {
      const matchedTopic = matchedChapter.topics.find(t => t.toLowerCase() === c.topic?.toLowerCase());
      if (!matchedTopic) {
        traceabilityFailures.push(`Concept ${c.concept_id}: topic '${c.topic}' not found in chapter '${c.chapter}'`);
      }
    }

    if (!c.subtopic) {
      traceabilityFailures.push(`Concept ${c.concept_id}: missing subtopic`);
    }

    // Formula Linkage
    if (!c.formulas || c.formulas.length === 0) {
      missingFormulaLinks.push(c.concept_id);
    } else {
      c.formulas.forEach((fId: string) => {
        if (!formulaIdsSeen.has(fId)) {
          missingFormulaLinks.push(`Concept ${c.concept_id}: links to non-existent formula ID ${fId}`);
        }
      });
    }

    // Misconception Audit: Verify exactly 5 misconceptions per concept of specific error types
    const conceptMis = c.misconceptions || [];
    if (conceptMis.length !== 5) {
      invalidMisconceptionCounts.push(`Concept ${c.concept_id} has ${conceptMis.length} misconceptions instead of 5`);
    }

    const mandatorySuffixes = ['CON', 'SGN', 'UNT', 'GRPH', 'FRM'];
    mandatorySuffixes.forEach(suffix => {
      const found = conceptMis.some((m: any) => m.id?.endsWith(`_${suffix}`) && misconceptions[m.id]);
      if (!found) {
        missingMisconceptionTypes.push(`Concept ${c.concept_id}: missing misconception type ${suffix}`);
      }
    });

    // PYQ DNA Audit: Verify every concept has Exam Type, Difficulty, Pattern Type, Reasoning Mode
    const pyq = c.pyq_patterns || [];
    if (pyq.length === 0) {
      missingPyqFields.push(`Concept ${c.concept_id}: no PYQ DNA mapped`);
    } else {
      pyq.forEach((p: any, idx: number) => {
        if (!p.exam) missingPyqFields.push(`Concept ${c.concept_id} [PYQ ${idx}]: missing exam type`);
        if (!p.difficulty) missingPyqFields.push(`Concept ${c.concept_id} [PYQ ${idx}]: missing difficulty`);
        if (!p.pattern_type) missingPyqFields.push(`Concept ${c.concept_id} [PYQ ${idx}]: missing pattern type`);
        if (!p.reasoning_mode) missingPyqFields.push(`Concept ${c.concept_id} [PYQ ${idx}]: missing reasoning mode`);
      });
    }
  });

  // Calculate Mathematics Integrity Score
  let score = 100;
  
  // Deductions
  score -= duplicateConceptNames.length * 2;
  score -= duplicateConceptIds.length * 2;
  score -= duplicateFormulaIds.length * 2;
  score -= (invalidFormulaVariables.length + invalidFormulaUnits.length) * 1;
  score -= traceabilityFailures.length * 1.5;
  score -= orphanConcepts.length * 2;
  score -= missingFormulaLinks.length * 2;
  score -= (invalidMisconceptionCounts.length + missingMisconceptionTypes.length) * 1;
  score -= missingPyqFields.length * 1;

  score = Math.max(0, score); // Cap at 0

  // Output Gap Report & Summary
  const mdPath = path.join('/Users/ayushdixit12/.gemini/antigravity-ide/brain/1405db37-c8c4-4a16-89f1-2056d6cdcae0/', 'mathematics_integrity_audit.md');

  const reportContent = `# Mathematics Curriculum Graph Integrity Audit Report

Generated at: \`${new Date().toISOString()}\`

## Integrity Score: \`${score.toFixed(1)} / 100\`
Status: **${score >= 95 ? 'PASSED' : 'FAILED'}** (Success Criteria $\ge 95$)

### Metrics Summary

- **Total Mathematics Concepts**: ${concepts.length}
- **Total Mathematics Formulas**: ${formulas.length}
- **Total Misconceptions Checked**: ${concepts.length * 5}
- **Duplicate Concept Names**: ${duplicateConceptNames.length}
- **Duplicate Concept IDs**: ${duplicateConceptIds.length}
- **Duplicate Formula IDs**: ${duplicateFormulaIds.length}
- **Orphan Concepts**: ${orphanConcepts.length}
- **Missing Formula Links**: ${missingFormulaLinks.length}
- **Missing Misconceptions/Types**: ${missingMisconceptionTypes.length + invalidMisconceptionCounts.length}
- **Missing PYQ DNA Fields**: ${missingPyqFields.length}

---

## Detailed Gap Report

### 1. Concept Uniqueness Gaps
${duplicateConceptIds.length === 0 && duplicateConceptNames.length === 0 ? '_None! All concepts are unique._' : ''}
${duplicateConceptIds.map(id => `- Duplicate ID: \`${id}\``).join('\n')}
${duplicateConceptNames.map(name => `- Duplicate Name: \`${name}\``).join('\n')}

### 2. Formula Integrity Gaps
${duplicateFormulaIds.length === 0 && invalidFormulaVariables.length === 0 && invalidFormulaUnits.length === 0 ? '_None! All formulas are integral._' : ''}
${duplicateFormulaIds.map(id => `- Duplicate Formula ID: \`${id}\``).join('\n')}
${invalidFormulaVariables.map(id => `- Invalid Variables mapping in: \`${id}\``).join('\n')}
${invalidFormulaUnits.map(id => `- Invalid Units mapping in: \`${id}\``).join('\n')}

### 3. Traceability & Orphan Gaps
${traceabilityFailures.length === 0 ? '_None! 100% of concepts are traceable._' : traceabilityFailures.map(f => `- ${f}`).join('\n')}

### 4. Misconception Gaps
${invalidMisconceptionCounts.length === 0 && missingMisconceptionTypes.length === 0 ? '_None! All concepts have exactly 5 misconceptions of correct types._' : ''}
${invalidMisconceptionCounts.map(f => `- ${f}`).join('\n')}
${missingMisconceptionTypes.map(f => `- ${f}`).join('\n')}

### 5. PYQ DNA Gaps
${missingPyqFields.length === 0 ? '_None! All concepts have complete PYQ DNA._' : missingPyqFields.map(f => `- ${f}`).join('\n')}

---

## Verification Result against Quality Gates

- **Success Criteria: Integrity Score >= 95**: ${score >= 95 ? '✅ Yes' : '❌ No'}
- **Duplicate Concepts = 0**: ${duplicateConceptIds.length + duplicateConceptNames.length === 0 ? '✅ Yes' : '❌ No'}
- **Orphan Concepts = 0**: ${orphanConcepts.length === 0 ? '✅ Yes' : '❌ No'}
- **Missing Formula Links = 0**: ${missingFormulaLinks.length === 0 ? '✅ Yes' : '❌ No'}
- **Missing Misconceptions = 0**: ${invalidMisconceptionCounts.length + missingMisconceptionTypes.length === 0 ? '✅ Yes' : '❌ No'}
- **Missing PYQ DNA = 0**: ${missingPyqFields.length === 0 ? '✅ Yes' : '❌ No'}
`;

  fs.writeFileSync(mdPath, reportContent);
  console.log(`[Audit] Mathematics Integrity report successfully written to ${mdPath}`);
  console.log(`[Audit] Integrity Score: ${score.toFixed(1)} / 100`);

  if (score < 95 || duplicateConceptIds.length > 0 || duplicateConceptNames.length > 0 || orphanConcepts.length > 0 || missingFormulaLinks.length > 0 || invalidMisconceptionCounts.length > 0 || missingMisconceptionTypes.length > 0 || missingPyqFields.length > 0) {
    throw new Error(`Mathematics Integrity Audit Failed. Score: ${score}. Review report at ${mdPath}`);
  }
}

// Invoke automatically if run directly
if (process.argv[1] && process.argv[1].includes('mathematicsIntegrityAudit')) {
  runMathematicsIntegrityAudit();
}
