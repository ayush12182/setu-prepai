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

// Main migration runner
async function run() {
  console.log('[Migration] Starting migration...');

  const projectDir = process.cwd();
  const prodQuestionsPath = path.join(projectDir, 'src/scratch/production_questions_2000.json');
  const repoDir = path.join(projectDir, 'public/repository');

  if (!fs.existsSync(prodQuestionsPath)) {
    console.error(`[Error] Monolithic database not found at ${prodQuestionsPath}`);
    process.exit(1);
  }

  const monolithData = JSON.parse(fs.readFileSync(prodQuestionsPath, 'utf8'));
  console.log(`[Migration] Loaded ${monolithData.length} questions from monolith.`);

  // Create repository base dir
  if (!fs.existsSync(repoDir)) {
    fs.mkdirSync(repoDir, { recursive: true });
  }

  // Build syllabus dictionary for fast lookup
  // Key: normalized subject + '#' + normalized chapter + '#' + normalized topic
  const syllabusMap = new Map<string, { subject: string, chapter: string, topic: string }>();
  const allSyllabusTopics: { subject: string, chapter: string, topic: string }[] = [];

  for (const chapter of allChapters) {
    const subjectCanonical = normalizeSubject(chapter.subject);
    for (const topic of chapter.topics) {
      const key = `${normalizeSubject(chapter.subject)}#${normalize(chapter.name)}#${normalize(topic)}`;
      const val = {
        subject: subjectCanonical,
        chapter: chapter.name,
        topic: topic
      };
      syllabusMap.set(key, val);
      allSyllabusTopics.push(val);
    }
  }

  console.log(`[Migration] Registered ${allSyllabusTopics.length} syllabus topics from syllabus.ts.`);

  // Group questions by matching topic
  // Key: canonical key (subject#chapter#topic)
  const groupedQuestions = new Map<string, any[]>();
  let matchedCount = 0;
  let mismatchedCount = 0;
  const mismatches = new Set<string>();

  const TOPIC_OVERRIDES: Record<string, string> = {
    "matrices": "Matrix Operations",
    "system of linear equations": "Cramer's Rule",
    "adjoints and inverses": "Inverse of Matrix"
  };

  for (const q of monolithData) {
    const qSub = normalizeSubject(q.subject);
    const qChap = normalize(q.chapter);
    
    let rawTopic = q.topic;
    const normalizedRawTopic = (q.topic || '').toLowerCase().trim();
    if (TOPIC_OVERRIDES[normalizedRawTopic]) {
      rawTopic = TOPIC_OVERRIDES[normalizedRawTopic];
    }
    const qTopic = normalize(rawTopic);
    const key = `${qSub}#${qChap}#${qTopic}`;

    const canonical = syllabusMap.get(key);
    if (canonical) {
      const groupKey = `${canonical.subject}#${canonical.chapter}#${canonical.topic}`;
      if (!groupedQuestions.has(groupKey)) {
        groupedQuestions.set(groupKey, []);
      }
      
      // Also write the mapped topic name inside the question object so it is consistent
      q.topic = canonical.topic;
      
      groupedQuestions.get(groupKey)!.push(q);
      matchedCount++;
    } else {
      mismatchedCount++;
      mismatches.add(`${q.subject} | ${q.chapter} | ${q.topic}`);
    }
  }

  console.log(`[Migration] Matched: ${matchedCount}, Mismatched: ${mismatchedCount}`);
  if (mismatches.size > 0) {
    console.warn('[Migration] Mismatched topics from question database:');
    mismatches.forEach(m => console.warn(` - ${m}`));
  }

  // Prepare repository structure and write files
  const indexSubjects: any = {};
  let totalTopicsWritten = 0;
  let totalQuestionsWritten = 0;

  for (const item of allSyllabusTopics) {
    const { subject, chapter, topic } = item;
    const subjectSlug = slugify(subject);
    const chapterSlug = slugify(chapter);
    const topicSlug = slugify(topic);

    const relativeFilePath = `${subjectSlug}/${chapterSlug}/${topicSlug}.json`;
    const absoluteFilePath = path.join(repoDir, relativeFilePath);

    const groupKey = `${subject}#${chapter}#${topic}`;
    const questions = groupedQuestions.get(groupKey) || [];

    // Ensure subject entry in index
    if (!indexSubjects[subjectSlug]) {
      indexSubjects[subjectSlug] = {};
    }
    // Ensure chapter entry in subject
    if (!indexSubjects[subjectSlug][chapter]) {
      indexSubjects[subjectSlug][chapter] = {};
    }

    if (questions.length > 0) {
      // Create subdirectories
      const destDir = path.dirname(absoluteFilePath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Write questions file
      fs.writeFileSync(absoluteFilePath, JSON.stringify(questions, null, 2), 'utf8');

      // Calculate simple stats for index
      const qualityScores = questions.map((q: any) => q.quality_score || 0).filter((s: number) => s > 0);
      const avgQuality = qualityScores.length > 0 ? Number((qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length).toFixed(2)) : 0;

      indexSubjects[subjectSlug][chapter][topic] = {
        file: relativeFilePath,
        questions: questions.length,
        quality_score: avgQuality,
        duplicate_rate: 0,
        eds: 0.85, // Default placeholder for migrated production items
        status: 'LIVE'
      };

      totalTopicsWritten++;
      totalQuestionsWritten += questions.length;
    } else {
      // Pending topic placeholder in index
      indexSubjects[subjectSlug][chapter][topic] = {
        file: relativeFilePath,
        questions: 0,
        quality_score: 0,
        duplicate_rate: 0,
        eds: 0,
        status: 'NOT_STARTED'
      };
    }
  }

  // Write master index
  const repoIndex = {
    generated: new Date().toISOString(),
    total_topics: allSyllabusTopics.length,
    total_questions: totalQuestionsWritten,
    subjects: indexSubjects
  };

  const indexOutputPath = path.join(repoDir, 'repository_index.json');
  fs.writeFileSync(indexOutputPath, JSON.stringify(repoIndex, null, 2), 'utf8');
  console.log(`[Migration] Wrote master index to ${indexOutputPath}`);

  // Write manifest file
  const manifest = {
    version: '2.0.0',
    last_updated: new Date().toISOString(),
    total_questions: totalQuestionsWritten,
    total_topics: allSyllabusTopics.length,
    active_topics: totalTopicsWritten,
    status: 'LIVE'
  };

  const manifestOutputPath = path.join(repoDir, 'repository_manifest.json');
  fs.writeFileSync(manifestOutputPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[Migration] Wrote manifest to ${manifestOutputPath}`);

  console.log(`[Migration] Success! Total Topics with questions written: ${totalTopicsWritten}/${allSyllabusTopics.length}`);
  console.log(`[Migration] Total questions written: ${totalQuestionsWritten}`);
}

run().catch(err => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
