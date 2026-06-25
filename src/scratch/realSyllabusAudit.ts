import * as fs from 'fs';
import * as path from 'path';
import { physicsChapters, chemistryChapters, mathsChapters } from '../data/syllabus';

interface ChapterAudit {
  name: string;
  topicsCount: number;
  conceptsCount: number;
  formulaCount: number;
  misconceptionsCount: number;
  pyqCount: number;
  status: 'FOUND' | 'PARTIAL' | 'MISSING';
  missingTopics: string[];
}

function loadJson(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function runSyllabusAudit() {
  const expandedDir = path.resolve(process.cwd(), 'src/data/expanded');
  const formulasDir = path.resolve(process.cwd(), 'src/data/formulas');

  // Load expanded concepts
  const expandedPhys = loadJson(path.join(expandedDir, 'physics_expanded.json')) || [];
  const expandedChem = loadJson(path.join(expandedDir, 'chemistry_expanded.json')) || [];
  const expandedMath = loadJson(path.join(expandedDir, 'mathematics_expanded.json')) || [];

  // Load formulas
  const formulasPhys = loadJson(path.join(formulasDir, 'physics.json')) || [];
  const formulasChem = loadJson(path.join(formulasDir, 'chemistry.json')) || [];
  const formulasMath = loadJson(path.join(formulasDir, 'mathematics.json')) || [];

  // Load misconceptions
  const misconceptionsExpanded = loadJson(path.join(expandedDir, 'misconceptions_expanded.json')) || {};

  const auditReport: {
    physics: ChapterAudit[];
    chemistry: ChapterAudit[];
    maths: ChapterAudit[];
  } = { physics: [], chemistry: [], maths: [] };

  const conceptsWithoutFormulas: string[] = [];
  const chaptersWithoutFormulas: string[] = [];

  let totalPhysConcepts = 0;
  let totalChemConcepts = 0;
  let totalMathsConcepts = 0;

  let totalFormulas = formulasPhys.length + formulasChem.length + formulasMath.length;
  let totalMisconceptions = Object.keys(misconceptionsExpanded).length;
  let totalPyqs = 0;
  let conceptsWithFormulasCount = 0;
  let totalConceptsCount = 0;

  // Helper to audit a subject
  const auditSubject = (subjectName, chapters, expandedConcepts, formulasList, reportList) => {
    chapters.forEach(ch => {
      const chConcepts = expandedConcepts.filter(c => c.chapter.toLowerCase() === ch.name.toLowerCase());
      const chFormulas = formulasList.filter(f => f.chapter.toLowerCase() === ch.name.toLowerCase());
      
      if (chFormulas.length === 0) {
        chaptersWithoutFormulas.push(`${subjectName} -> ${ch.name}`);
      }

      const missingTopics = [];
      ch.topics.forEach(topic => {
        const found = chConcepts.some(c => c.topic.toLowerCase() === topic.toLowerCase());
        if (!found) missingTopics.push(topic);
      });

      chConcepts.forEach(c => {
        totalConceptsCount++;
        const hasFormula = c.formulas && c.formulas.length > 0;
        if (hasFormula) {
          conceptsWithFormulasCount++;
        } else {
          conceptsWithoutFormulas.push(`${subjectName} -> ${ch.name} -> ${c.concept_name}`);
        }
      });

      if (subjectName === 'Physics') totalPhysConcepts += chConcepts.length;
      if (subjectName === 'Chemistry') totalChemConcepts += chConcepts.length;
      if (subjectName === 'Mathematics') totalMathsConcepts += chConcepts.length;

      const pyqCount = ch.pyqData ? ch.pyqData.total : 0;
      totalPyqs += pyqCount;

      reportList.push({
        name: ch.name,
        topicsCount: ch.topics.length,
        conceptsCount: chConcepts.length,
        formulaCount: chFormulas.length,
        misconceptionsCount: chConcepts.reduce((acc, c) => acc + (c.misconceptions ? c.misconceptions.length : 0), 0),
        pyqCount,
        status: chConcepts.length === 0 ? 'MISSING' : (missingTopics.length > 0 ? 'PARTIAL' : 'FOUND'),
        missingTopics
      });
    });
  };

  auditSubject('Physics', physicsChapters, expandedPhys, formulasPhys, auditReport.physics);
  auditSubject('Chemistry', chemistryChapters, expandedChem, formulasChem, auditReport.chemistry);
  auditSubject('Mathematics', mathsChapters, expandedMath, formulasMath, auditReport.maths);

  const physPercentage = ((totalPhysConcepts / 300) * 100).toFixed(1);
  const chemPercentage = ((totalChemConcepts / 400) * 100).toFixed(1);
  const mathsPercentage = ((totalMathsConcepts / 500) * 100).toFixed(1);
  const formulaCoveragePct = totalConceptsCount > 0 ? ((conceptsWithFormulasCount / totalConceptsCount) * 100).toFixed(1) : '0.0';

  const totalChapters = physicsChapters.length + chemistryChapters.length + mathsChapters.length;
  let totalTopics = 0;
  [...physicsChapters, ...chemistryChapters, ...mathsChapters].forEach(c => totalTopics += c.topics.length);

  const reportPath = path.join(process.cwd(), 'src/scratch/real_syllabus_coverage_report.json');
  const markdownPath = path.join('/Users/ayushdixit12/.gemini/antigravity-ide/brain/1405db37-c8c4-4a16-89f1-2056d6cdcae0/', 'curriculum_coverage_report.md');

  const reportJson = {
    timestamp: new Date().toISOString(),
    metrics: {
      physicsCoverage: `${physPercentage}%`,
      chemistryCoverage: `${chemPercentage}%`,
      mathsCoverage: `${mathsPercentage}%`,
      formulaCoverage: `${formulaCoveragePct}%`,
      global: {
        totalChapters,
        totalTopics,
        totalConcepts: totalConceptsCount,
        totalFormulas,
        totalMisconceptions,
        totalPyqDna: totalPyqs
      }
    },
    conceptsWithoutFormulas,
    chaptersWithoutFormulas,
    auditReport
  };

  fs.writeFileSync(reportPath, JSON.stringify(reportJson, null, 2));

  // Build beautiful gap report markdown
  let markdown = `# PrepEntrance Real Syllabus Coverage Audit

Generated at: \`${reportJson.timestamp}\`

## Subject Coverage vs Targets

- **Physics**: \`${physPercentage}%\` (${totalPhysConcepts} / 300 Concepts)
- **Chemistry**: \`${chemPercentage}%\` (${totalChemConcepts} / 400 Concepts)
- **Mathematics**: \`${mathsPercentage}%\` (${totalMathsConcepts} / 500 Concepts)
- **Formula Coverage**: \`${formulaCoveragePct}%\` (${conceptsWithFormulasCount} / ${totalConceptsCount} Concepts mapped to formulas)

## Global Metrics

- **Total Syllabus Chapters**: ${totalChapters}
- **Total Topics**: ${totalTopics}
- **Total Concepts Linked**: ${totalConceptsCount}
- **Total Formulas Registered**: ${totalFormulas}
- **Total Misconceptions Registered**: ${totalMisconceptions}
- **Total PYQ DNA Entries**: ${totalPyqs}

---

## Detailed Chapter Audits

### Physics
| Chapter Name | Topics | Concepts | Formulas | Misconceptions | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
`;

  auditReport.physics.forEach(c => {
    markdown += `| ${c.name} | ${c.topicsCount} | ${c.conceptsCount} | ${c.formulaCount} | ${c.misconceptionsCount} | **${c.status}** |\n`;
  });

  markdown += `
### Chemistry
| Chapter Name | Topics | Concepts | Formulas | Misconceptions | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
`;

  auditReport.chemistry.forEach(c => {
    markdown += `| ${c.name} | ${c.topicsCount} | ${c.conceptsCount} | ${c.formulaCount} | ${c.misconceptionsCount} | **${c.status}** |\n`;
  });

  markdown += `
### Mathematics
| Chapter Name | Topics | Concepts | Formulas | Misconceptions | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
`;

  auditReport.maths.forEach(c => {
    markdown += `| ${c.name} | ${c.topicsCount} | ${c.conceptsCount} | ${c.formulaCount} | ${c.misconceptionsCount} | **${c.status}** |\n`;
  });

  markdown += `
---

## Syllabus & Formula Gaps (Action Required)

### Chapters without Formulas
${chaptersWithoutFormulas.length === 0 ? '_None! All chapters have formulas registered._' : chaptersWithoutFormulas.map(c => `- ${c}`).join('\n')}

### Concepts without Formulas
${conceptsWithoutFormulas.length === 0 ? '_None! All generated concepts are linked to formulas._' : conceptsWithoutFormulas.map(c => `- ${c}`).join('\n')}

`;

  fs.writeFileSync(markdownPath, markdown);
  console.log(`[Audit] Coverage report successfully written to ${markdownPath}`);
}

// Automatically invoke if run directly
if (process.argv[1] && process.argv[1].includes('realSyllabusAudit')) {
  runSyllabusAudit();
}
