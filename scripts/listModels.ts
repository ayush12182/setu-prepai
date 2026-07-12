import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const GEMINI_KEY = env.VITE_GEMINI_API_KEY;

async function run() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  data.models.forEach(m => console.log(m.name));
}
run();
