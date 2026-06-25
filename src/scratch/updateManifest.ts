import * as fs from 'fs';
import * as path from 'path';

const INDEX_PATH = path.join(process.cwd(), 'public', 'repository', 'repository_index.json');
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'repository', 'repository_manifest.json');

export function updateManifest() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('repository_index.json not found!');
    return;
  }

  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  let liveTopics = 0;
  let totalTopics = 0;
  let totalQuestions = 0;
  let qualitySum = 0;

  for (const subject of Object.values(index.subjects) as any[]) {
    for (const chapter of Object.values(subject)) {
      for (const topic of Object.values(chapter) as any[]) {
        totalTopics++;
        if (topic.status === 'LIVE') {
          liveTopics++;
          totalQuestions += (topic.questions || 0);
          qualitySum += (topic.quality_score || 0);
        }
      }
    }
  }

  const avgQuality = liveTopics > 0 ? Number((qualitySum / liveTopics).toFixed(2)) : 0;

  const manifest = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    generator_version: "2.0.0",
    curriculum_version: "2026.1",
    quality_gate_version: "1.0.0",
    covered_topics: liveTopics,
    total_topics: totalTopics,
    total_questions: totalQuestions,
    average_quality: avgQuality,
    repository_hash: "hash_" + Date.now().toString(36)
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Manifest updated: ${liveTopics}/${totalTopics} LIVE topics, ${totalQuestions} questions. Avg Quality: ${avgQuality}`);
}

updateManifest();
