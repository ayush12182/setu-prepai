import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const SUPABASE_URL = env.VITE_SUPABASE_URL!;
const ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY!;

async function test() {
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
      chapter_id: "math-1",
      chapter_slug: "test-slug",
      chapter_name: "Test",
      subject: "maths",
      exam_type: 'JEE',
      language: 'english',
      version: 1.1,
      version_label: '1.1',
      status: 'published',
      raw_content: "This is test content of long size.",
      word_count: 7,
      generation_model: 'gemini-2.5-flash',
    })
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

test();
