import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { physicsChapters, chemistryChapters, mathsChapters } from '../src/data/syllabus.ts';
import { neetBiologyChapters } from '../src/data/neetSyllabus.ts';

const env = loadEnv('development', process.cwd());
console.log("Subjects:", {
  physics: physicsChapters.length,
  chemistry: chemistryChapters.length,
  maths: mathsChapters.length,
  biology: neetBiologyChapters.length
});
