import { loadEnv } from 'vite';
const env = loadEnv('development', process.cwd());
console.log("VITE_SUPABASE_URL =", env.VITE_SUPABASE_URL);
