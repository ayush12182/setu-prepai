import * as fs from 'fs';
import * as path from 'path';
import { allChapters } from '../data/syllabus';

// Helper to normalize strings for comparison
function normalize(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Slugifier for file paths
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[,\s&]+/g, '_')   // Replace commas, spaces, & with underscores
    .replace(/[()]+/g, '')      // Remove parentheses
    .replace(/[^a-z0-9_]+/g, '') // Remove any other non-alphanumeric/non-underscore characters
    .replace(/_+/g, '_')        // Collapse consecutive underscores
    .replace(/(^_+|_+$)/g, '');  // Trim leading/trailing underscores
}

function normalizeSubject(sub: string): string {
  const normalized = (sub || '').toLowerCase();
  if (normalized === 'maths' || normalized === 'mathematics') {
    return 'mathematics';
  }
  return normalized;
}

async function run() {
  console.log('[IndexBuilder] Rebuilding repository index and dashboards...');

  const projectDir = process.cwd();
  const repoDir = path.join(projectDir, 'public/repository');
  const artifactDir = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/1405db37-c8c4-4a16-89f1-2056d6cdcae0';

  if (!fs.existsSync(repoDir)) {
    console.error(`[Error] Repository directory not found at ${repoDir}`);
    process.exit(1);
  }

  // Read existing index if it exists, to preserve statuses where appropriate,
  // but we will recalculate questions count and quality from actual files.
  let existingIndex: any = {};
  const indexFile = path.join(repoDir, 'repository_index.json');
  if (fs.existsSync(indexFile)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    } catch (e) {
      console.warn('[IndexBuilder] Failed to read existing repository_index.json, starting fresh');
    }
  }

  const indexSubjects: any = {};
  let totalTopics = 0;
  let activeTopics = 0;
  let totalQuestions = 0;

  // Flattened topic stats list for dashboards
  const topicStatsList: any[] = [];

  for (const chapter of allChapters) {
    const subjectCanonical = normalizeSubject(chapter.subject);
    const subjectSlug = slugify(subjectCanonical);
    const chapterSlug = slugify(chapter.name);

    if (!indexSubjects[subjectSlug]) {
      indexSubjects[subjectSlug] = {};
    }
    if (!indexSubjects[subjectSlug][chapter.name]) {
      indexSubjects[subjectSlug][chapter.name] = {};
    }

    for (const topic of chapter.topics) {
      totalTopics++;
      const topicSlug = slugify(topic);
      const relativeFilePath = `${subjectSlug}/${chapterSlug}/${topicSlug}.json`;
      const absoluteFilePath = path.join(repoDir, relativeFilePath);

      let questionsCount = 0;
      let avgQuality = 0;
      let eds = 0;
      let duplicateRate = 0;
      let status = 'NOT_STARTED';
      let scenarioMax = 0;
      let pathMax = 0;

      if (fs.existsSync(absoluteFilePath)) {
        try {
          const questions = JSON.parse(fs.readFileSync(absoluteFilePath, 'utf8'));
          if (Array.isArray(questions) && questions.length > 0) {
            questionsCount = questions.length;
            totalQuestions += questionsCount;
            activeTopics++;
            status = 'LIVE';

            // Calculate average quality
            const qualityScores = questions.map((q: any) => q.quality_score || 0).filter(s => s > 0);
            avgQuality = qualityScores.length > 0 ? Number((qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length).toFixed(2)) : 0;

            // Calculate EDS and concentrations
            const fingerprints = new Set<string>();
            const scenarioCounts = new Map<string, number>();
            const pathCounts = new Map<string, number>();

            for (const q of questions) {
              const fp = q.structural_fingerprint || `${q.scenario_id || 'S'}:${q.solving_path_id || 'P'}:${q.reasoning_mode_id || 'R'}:${q.difficulty || 'D'}`;
              fingerprints.add(fp);

              const sc = q.scenario_id || 'General';
              scenarioCounts.set(sc, (scenarioCounts.get(sc) || 0) + 1);

              const sp = q.solving_path_id || 'General';
              pathCounts.set(sp, (pathCounts.get(sp) || 0) + 1);
            }

            eds = Number((fingerprints.size / questionsCount).toFixed(4));

            // Concentrations
            let maxScen = 0;
            for (const count of scenarioCounts.values()) {
              if (count > maxScen) maxScen = count;
            }
            scenarioMax = Number(((maxScen / questionsCount) * 100).toFixed(1));

            let maxPath = 0;
            for (const count of pathCounts.values()) {
              if (count > maxPath) maxPath = count;
            }
            pathMax = Number(((maxPath / questionsCount) * 100).toFixed(1));
          }
        } catch (e: any) {
          console.error(`[Error] Failed to read topic file ${absoluteFilePath}:`, e.message);
          status = 'ERROR';
        }
      } else {
        // Carry over status from existing index if it's there (e.g. GENERATING, PENDING etc)
        const oldEntry = existingIndex.subjects?.[subjectSlug]?.[chapter.name]?.[topic];
        if (oldEntry && oldEntry.status) {
          status = oldEntry.status;
        }
      }

      const indexEntry = {
        file: relativeFilePath,
        questions: questionsCount,
        quality_score: avgQuality,
        duplicate_rate: duplicateRate,
        eds: eds,
        status: status
      };

      indexSubjects[subjectSlug][chapter.name][topic] = indexEntry;

      topicStatsList.push({
        subject: subjectCanonical,
        chapter: chapter.name,
        topic,
        file: relativeFilePath,
        questions: questionsCount,
        quality_score: avgQuality,
        eds,
        scenarioMax,
        pathMax,
        status
      });
    }
  }

  // Save the master index
  const newIndex = {
    generated: new Date().toISOString(),
    total_topics: totalTopics,
    total_questions: totalQuestions,
    subjects: indexSubjects
  };

  fs.writeFileSync(indexFile, JSON.stringify(newIndex, null, 2), 'utf8');
  console.log(`[IndexBuilder] Saved master index to ${indexFile}`);

  // Save the version manifest
  const manifestFile = path.join(repoDir, 'repository_manifest.json');
  const manifest = {
    version: '2.0.0',
    last_updated: new Date().toISOString(),
    total_questions: totalQuestions,
    total_topics: totalTopics,
    active_topics: activeTopics,
    status: activeTopics === totalTopics ? 'LIVE' : 'PARTIAL'
  };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[IndexBuilder] Saved manifest to ${manifestFile}`);

  // Generate 4 Dashboard Reports in the artifact directory
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  generateGrowthDashboard(artifactDir, activeTopics, totalTopics, totalQuestions, topicStatsList);
  generateCapacityDashboard(artifactDir, topicStatsList);
  generateQualityDashboard(artifactDir, topicStatsList);
  generateIndexReport(artifactDir, topicStatsList);

  console.log('[IndexBuilder] Rebuild complete! All 4 dashboard reports written.');
}

// 1. Growth Dashboard
function generateGrowthDashboard(dir: string, active: number, total: number, totalQ: number, list: any[]) {
  const percent = ((active / total) * 100).toFixed(1);
  const subjects = ['physics', 'chemistry', 'mathematics'];
  
  let md = `# Repository Growth Dashboard

This dashboard tracks the expansion progress of PrepEntrance repository from 6,000 to 63,600+ questions.

## Summary

| Metric | Target | Current | Progress |
|---|---|---|---|
| **Covered Topics** | 212 | ${active} | ${percent}% |
| **Total Questions** | 63,600 | ${totalQ} | ${((totalQ / 63600) * 100).toFixed(1)}% |
| **Database Status** | LIVE | ${active === total ? '🟢 Fully Operational' : '🟡 Expansion In-Progress'} | - |

## Breakdown by Subject

`;

  for (const sub of subjects) {
    const subList = list.filter(t => t.subject === sub);
    const subActive = subList.filter(t => t.status === 'LIVE').length;
    const subTotal = subList.length;
    const subQ = subList.reduce((sum, t) => sum + t.questions, 0);
    const subPercent = ((subActive / subTotal) * 100).toFixed(1);

    md += `### ${sub.toUpperCase()}\n\n`;
    md += `* **Topics Covered**: ${subActive} / ${subTotal} (${subPercent}%)\n`;
    md += `* **Questions Generated**: ${subQ} / ${subTotal * 300} (${((subQ / (subTotal * 300)) * 100).toFixed(1)}%)\n\n`;
    md += `| Topic | Chapter | Questions | Status |\n`;
    md += `|---|---|---|---|\n`;
    
    // Sort so LIVE is first
    const sortedSubList = [...subList].sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
      return a.chapter.localeCompare(b.chapter);
    });

    for (const t of sortedSubList) {
      const statusBadge = t.status === 'LIVE' ? '🟢 LIVE' : t.status === 'GENERATING' ? '🟡 GENERATING' : '⚪ PENDING';
      md += `| ${t.topic} | ${t.chapter} | ${t.questions} | ${statusBadge} |\n`;
    }
    md += '\n';
  }

  fs.writeFileSync(path.join(dir, 'repository_growth_dashboard.md'), md, 'utf8');
}

// 2. Capacity Dashboard
function generateCapacityDashboard(dir: string, list: any[]) {
  // Let's assume a "session" requests 10 questions.
  // Topic capacity is questions/10. Exhaustion rate is number of unique tests a student can take before repetition.
  let md = `# Topic Capacity & Exhaustion Dashboard

This report measures the student session capacity per topic before running into question exhaustion.

## Top Exhaustion Risks (Topics with 0 questions)

| Subject | Chapter | Topic | Questions | Sessions Before Repetition | Risk Level |
|---|---|---|---|---|---|
`;

  const pending = list.filter(t => t.questions === 0);
  const active = list.filter(t => t.questions > 0);

  for (const t of pending.slice(0, 15)) {
    md += `| ${t.subject} | ${t.chapter} | ${t.topic} | 0 | 0 | 🚨 HIGH RISK (NOT STARTED) |\n`;
  }
  if (pending.length === 0) {
    md += `| - | - | - | - | - | ✅ All topics have active capacity! |\n`;
  }

  md += `\n## Live Topic Capacity\n\n`;
  md += `| Subject | Chapter | Topic | Questions | Sessions (10 Qs/Session) | EDS (Solving Diversity) |\n`;
  md += `|---|---|---|---|---|---|\n`;

  for (const t of active) {
    const sessions = Math.floor(t.questions / 10);
    md += `| ${t.subject} | ${t.chapter} | ${t.topic} | ${t.questions} | ${sessions} | ${(t.eds * 100).toFixed(1)}% |\n`;
  }

  fs.writeFileSync(path.join(dir, 'topic_capacity_dashboard.md'), md, 'utf8');
}

// 3. Quality Dashboard
function generateQualityDashboard(dir: string, list: any[]) {
  const active = list.filter(t => t.questions > 0);
  const avgQ = active.length > 0 ? (active.reduce((sum, t) => sum + t.quality_score, 0) / active.length).toFixed(2) : '0';
  const avgEds = active.length > 0 ? ((active.reduce((sum, t) => sum + t.eds, 0) / active.length) * 100).toFixed(1) : '0';

  let md = `# Repository Quality & Fingerprint Dashboard

This dashboard tracks student-thinking structural quality gates across generated topics.

## Quality Standards Target

* **Avg Quality Score**: ≥ 8.5
* **EDS (Solving Diversity)**: ≥ 80%
* **Scenario Concentration**: ≤ 10%
* **Path Concentration**: ≤ 5%
* **Duplicate Rate**: 0%

## Overall Metrics

| Metric | Target | Current | Status |
|---|---|---|---|
| **Average Quality Score** | ≥ 8.5 | ${avgQ} | ${Number(avgQ) >= 8.5 ? '✅ PASS' : '❌ FAIL'} |
| **Average EDS (Solving Diversity)** | ≥ 80% | ${avgEds}% | ${Number(avgEds) >= 80 ? '✅ PASS' : '❌ FAIL'} |

## Topic Details

| Subject | Topic | Questions | Avg Quality | EDS | Max Scenario % | Max Path % | Status |
|---|---|---|---|---|---|---|---|
`;

  for (const t of active) {
    const edsPass = t.eds >= 0.80;
    const scenPass = t.scenarioMax <= 10;
    const pathPass = t.pathMax <= 5;
    const overallPass = edsPass && scenPass && pathPass && t.quality_score >= 8.5;

    md += `| ${t.subject} | ${t.topic} | ${t.questions} | ${t.quality_score} | ${(t.eds * 100).toFixed(1)}% | ${t.scenarioMax}% | ${t.pathMax}% | ${overallPass ? '🟢 PASS' : '🔴 GATE FAILED'} |\n`;
  }

  fs.writeFileSync(path.join(dir, 'repository_quality_dashboard.md'), md, 'utf8');
}

// 4. Index Report
function generateIndexReport(dir: string, list: any[]) {
  let md = `# Repository Index Report

Full listing of all 212 syllabus topics and their status in PrepEntrance Repository V2.

`;

  const subjects = ['physics', 'chemistry', 'mathematics'];
  for (const sub of subjects) {
    const subList = list.filter(t => t.subject === sub);
    md += `## ${sub.toUpperCase()} (${subList.filter(t => t.status === 'LIVE').length} / ${subList.length} Live)\n\n`;
    
    // Group by chapter
    const chaptersMap = new Map<string, any[]>();
    for (const t of subList) {
      if (!chaptersMap.has(t.chapter)) {
        chaptersMap.set(t.chapter, []);
      }
      chaptersMap.get(t.chapter)!.push(t);
    }

    for (const [chapName, topics] of chaptersMap.entries()) {
      md += `### Chapter: ${chapName}\n\n`;
      md += `| Topic | Status | Questions | File Path |\n`;
      md += `|---|---|---|---|\n`;
      for (const t of topics) {
        const badge = t.status === 'LIVE' ? '🟢 LIVE' : '⚪ PENDING';
        md += `| ${t.topic} | ${badge} | ${t.questions} | \`${t.file}\` |\n`;
      }
      md += '\n';
    }
  }

  fs.writeFileSync(path.join(dir, 'repository_index_report.md'), md, 'utf8');
}

run().catch(err => {
  console.error('[IndexBuilder] Failed:', err);
  process.exit(1);
});
