import * as fs from 'fs';
import * as path from 'path';

const REPO_DIR = path.join(process.cwd(), 'public', 'repository');

function processDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (entry.name === 'repository_index.json' || entry.name === 'repository_manifest.json') {
        continue;
      }

      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(raw);

        // Check if it's already an object with a status
        if (!Array.isArray(data) && data.status) {
          console.log(`[SKIP] Already updated: ${fullPath}`);
          continue;
        }

        let questions = data;
        // If it's an object but without status, we might have nested questions
        if (!Array.isArray(data) && Array.isArray(data.questions)) {
          questions = data.questions;
        }

        const newFormat = {
          status: 'LIVE',
          questions: questions
        };

        fs.writeFileSync(fullPath, JSON.stringify(newFormat, null, 2), 'utf8');
        console.log(`[UPDATE] Added status LIVE to ${entry.name}`);

      } catch (err: any) {
        console.error(`[ERROR] Failed to process ${fullPath}: ${err.message}`);
      }
    }
  }
}

console.log('Migrating topics to lifecycle format...');
processDirectory(REPO_DIR);
console.log('Migration complete.');
