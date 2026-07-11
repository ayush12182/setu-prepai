import { loadEnv } from 'vite';
import { 
  physicsChapters, 
  chemistryChapters, 
  mathsChapters 
} from '../src/data/syllabus';

const syllabus = [
  { name: 'Physics', chapters: physicsChapters },
  { name: 'Chemistry', chapters: chemistryChapters },
  { name: 'Mathematics', chapters: mathsChapters },
];

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL!;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const GEMINI_KEY = env.VITE_GEMINI_API_KEY!;

async function isAlreadyPublished(chapterId: string): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/chapter_content?chapter_id=eq.${chapterId}&status=eq.published&select=id&limit=1`;
  const res = await fetch(url, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
  });
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

async function saveToDb(chapterId: string, chapterName: string, subject: string, rawContent: string): Promise<boolean> {
  const slug = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const wordCount = rawContent.split(/\s+/).length;

  const url = `${SUPABASE_URL}/functions/v1/save-local-notes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: "LOCAL_BULK_SCRIPT",
      chapter_id: chapterId,
      chapter_slug: slug,
      chapter_name: chapterName,
      subject: subject.toLowerCase(),
      exam_type: 'JEE',
      language: 'english',
      version: 1,
      version_label: '1.0',
      status: 'published',
      raw_content: rawContent,
      word_count: wordCount,
      generation_model: 'gemini-2.5-flash',
    })
  });

  return res.ok;
}

async function run() {
  const missing = [];
  for (const subj of syllabus) {
    for (const ch of subj.chapters) {
      const published = await isAlreadyPublished(ch.id);
      if (!published) {
        missing.push({ subj: mungeSubject(subj.name), ch: ch.name, id: ch.id });
      }
    }
  }

  console.log(`Found ${missing.length} missing chapters. Generating quickly...`);

  await Promise.all(missing.map(async (m) => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
      const prompt = `Generate a concise, 500-word premium study note for JEE chapter: ${m.ch} (${m.subj}). Format strictly in beautiful Markdown. Use ## headings and bullet points.`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const saved = await saveToDb(m.id, m.ch, m.subj, text);
        if (saved) {
          console.log(`✅ ${m.ch} Published!`);
        } else {
          console.log(`❌ Failed DB save for ${m.ch}`);
        }
      }
    } catch(e) {
      console.log(`❌ Failed ${m.ch}: ${e}`);
    }
  }));
}

function mungeSubject(s: string) {
  if (s.toLowerCase() === 'mathematics') return 'maths';
  return s.toLowerCase();
}

run();
