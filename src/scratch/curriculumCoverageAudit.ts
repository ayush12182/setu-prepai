import * as fs from 'fs';
import * as path from 'path';
import { UNIVERSAL_CURRICULUM_GRAPH } from '../data/curriculum';
import { UNIVERSAL_TOPIC_CATALOG } from '../services/topicCatalog';
import { FORMULA_REGISTRY } from '../data/formulas';
import { UNIVERSAL_MISCONCEPTION_REGISTRY } from '../data/misconceptions';

export interface CoverageReport {
  timestamp: string;
  metrics: {
    totalSubjects: number;
    totalChapters: number;
    totalConcepts: number;
    mappedCatalogCount: number;
    fullyMappedConcepts: number;
    coveragePercentage: number;
  };
  missingBlueprints: string[];
  unresolvedConcepts: string[];
  reportFile: string;
}

export function runCurriculumCrawler(): CoverageReport {
  let totalSubjects = 0;
  let totalChapters = 0;
  let totalConcepts = 0;
  let mappedCatalogCount = 0;
  let fullyMappedConcepts = 0;

  const missingBlueprints: string[] = [];
  const unresolvedConcepts: string[] = [];

  Object.entries(UNIVERSAL_CURRICULUM_GRAPH).forEach(([subjectName, chapters]) => {
    totalSubjects++;
    Object.entries(chapters).forEach(([chapterName, concepts]) => {
      totalChapters++;
      concepts.forEach(concept => {
        totalConcepts++;
        
        const cleanName = concept.name.toLowerCase().trim();
        const cleanChapter = concept.chapter.toLowerCase().trim();
        const cleanTopic = concept.topic.toLowerCase().trim();
        const catalogEntry = UNIVERSAL_TOPIC_CATALOG[cleanName] || 
                             UNIVERSAL_TOPIC_CATALOG[cleanChapter] ||
                             UNIVERSAL_TOPIC_CATALOG[cleanTopic] ||
                             Object.entries(UNIVERSAL_TOPIC_CATALOG).find(([k]) => cleanChapter.includes(k) || k.includes(cleanChapter))?.[1] ||
                             Object.entries(UNIVERSAL_TOPIC_CATALOG).find(([k]) => cleanTopic.includes(k) || k.includes(cleanTopic))?.[1];
        
        if (catalogEntry) {
          mappedCatalogCount++;
        } else {
          missingBlueprints.push(`${subjectName} -> ${chapterName} -> ${concept.name}`);
        }

        // Verify if both formulas and misconceptions exist
        const formulasValid = concept.formulas.every(fId => FORMULA_REGISTRY[fId] !== undefined);
        const misconceptionsValid = concept.commonMisconceptions?.every(mId => UNIVERSAL_MISCONCEPTION_REGISTRY[mId] !== undefined);

        if (formulasValid && misconceptionsValid && catalogEntry) {
          fullyMappedConcepts++;
        } else {
          unresolvedConcepts.push(`${subjectName} -> ${chapterName} -> ${concept.name} (Missing Formula or Misconception reference)`);
        }
      });
    });
  });

  const coveragePercentage = totalConcepts > 0 ? Number(((fullyMappedConcepts / totalConcepts) * 100).toFixed(1)) : 100;
  const reportPath = path.join('/Users/ayushdixit12/setu-prepai/src/scratch', 'coverage_report.json');

  const report: CoverageReport = {
    timestamp: new Date().toISOString(),
    metrics: {
      totalSubjects,
      totalChapters,
      totalConcepts,
      mappedCatalogCount,
      fullyMappedConcepts,
      coveragePercentage
    },
    missingBlueprints,
    unresolvedConcepts,
    reportFile: reportPath
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[Crawler] Coverage report written to ${reportPath} (Coverage: ${coveragePercentage}%)`);
  return report;
}

// Automatically invoke if run directly
if (process.argv[1] && process.argv[1].includes('curriculumCoverageAudit')) {
  runCurriculumCrawler();
}
