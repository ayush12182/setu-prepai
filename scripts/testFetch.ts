import { loadEnv } from 'vite';
const env = loadEnv('development', process.cwd());

async function test() {
  const url = `${env.VITE_SUPABASE_URL}/functions/v1/get-chapter-content?chapterId=phy-1&examType=JEE&language=english`;
  const res = await fetch(url, {
    headers: {
      'apikey': env.VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`
    }
  });
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Success:", json.success);
}
test();
