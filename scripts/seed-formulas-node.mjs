import fs from 'fs';
import path from 'path';

// Load .env.local manually
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing required Supabase environment variables. Ensure .env.local is present.");
  process.exit(1);
}

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

async function withRetry(operation, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 2000;
      console.warn(`[WARN] Retry attempt ${attempt}/${maxRetries} after error: ${error.message}`);
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
  console.log("🚀 Starting Production JEE Main Formula Seeding Pipeline via Edge Function...");
  const progress = loadProgress();

  const subjects = ['physics', 'chemistry', 'mathematics'];

  for (const subjectName of subjects) {
    const syllabusPath = path.resolve(process.cwd(), `src/data/syllabus/${subjectName}.json`);
    if (!fs.existsSync(syllabusPath)) {
      console.error(`Missing syllabus file: ${syllabusPath}`);
      continue;
    }
    
    let chapters;
    try {
       chapters = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    } catch(e) {
       console.error(`Invalid JSON in ${syllabusPath}: ${e.message}`);
       continue;
    }

    console.log(`\n========================================`);
    console.log(`📚 Processing Subject: ${subjectName.toUpperCase()}`);
    console.log(`========================================\n`);

    for (const chapter of chapters) {
      const dbSubjectName = subjectName === 'mathematics' ? 'maths' : subjectName;
      const progKey = `${dbSubjectName}_${chapter.name}`;
      
      if (progress[progKey] && progress[progKey].status === 'completed') {
        console.log(`⏭️  Skipping [${chapter.name}] - Already completed`);
        continue;
      }

      console.log(`\n⏳ Requesting Edge Function to generate formulas for [${chapter.name}]...`);
      
      const { success, error } = await seedSingleChapterViaEdgeFunction(
        dbSubjectName,
        chapter.name
      );

      if (success) {
        console.log(`✅ [${chapter.name}] Success! Database populated.`);
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
      
      // Delay to respect rate limits (4-5 seconds since Edge function handles Gemini natively)
      const delay = 4000 + Math.random() * 2000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.log("\n🎉 Seeding pipeline completed. Check seed_progress.json for a full report.");
}

run().catch(console.error);
