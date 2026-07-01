import fs from 'fs';
import path from 'path';

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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const PROGRESS_FILE = path.join(process.cwd(), 'seed_progress.json');

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function withRetry(operation, maxRetries = 5) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 4000;
      console.warn(`[WARN] Retry attempt ${attempt}/${maxRetries} after error: ${error.message} - waiting ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

async function seedSingleChapterViaEdgeFunction(subject, chapterName) {
  try {
    const rawData = await withRetry(async () => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-revision-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          type: 'formulas',
          subject: subject,
          chapter: chapterName,
          examMode: 'JEE',
          language: 'en',
        })
      });
      
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Edge Function Error ${res.status}: ${errText}`);
      }
      return await res.json();
    });

    return { success: true, response: rawData };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function run() {
  console.log("🚀 Starting Retry Pipeline (Rate Limit Safe)...");
  const progress = loadProgress();

  const subjects = ['physics', 'chemistry', 'mathematics'];

  for (const subjectName of subjects) {
    const syllabusPath = path.resolve(process.cwd(), `src/data/syllabus/${subjectName}.json`);
    if (!fs.existsSync(syllabusPath)) {
      continue;
    }
    
    let chapters = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));

    for (const chapter of chapters) {
      const dbSubjectName = subjectName === 'mathematics' ? 'maths' : subjectName;
      const progKey = `${dbSubjectName}_${chapter.name}`;
      
      if (progress[progKey] && progress[progKey].status === 'completed') {
        continue;
      }

      console.log(`\n⏳ Retrying [${chapter.name}]...`);
      
      const { success, error } = await seedSingleChapterViaEdgeFunction(
        dbSubjectName,
        chapter.name
      );

      if (success) {
        console.log(`✅ [${chapter.name}] Success!`);
        progress[progKey] = {
          chapter: chapter.name,
          status: 'completed',
          completed_at: new Date().toISOString()
        };
      } else {
        console.error(`❌ [${chapter.name}] Failed: ${error}`);
        progress[progKey] = {
          chapter: chapter.name,
          status: 'failed',
          error: error,
          completed_at: new Date().toISOString()
        };
      }
      
      saveProgress(progress);
      
      // Extremely safe delay for free tier Gemini (10 seconds)
      console.log("Sleeping 10s to respect rate limits...");
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log("\n🎉 Retry pipeline completed.");
}

run().catch(console.error);
