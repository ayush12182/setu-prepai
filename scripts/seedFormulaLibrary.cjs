"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const seedSingleChapter_js_1 = require("./seedSingleChapter.cjs");
const syllabus_js_1 = require("../src/data/syllabus.js");
// 1. Load .env.local manually
const envPath = path_1.default.resolve(process.cwd(), '.env.local');
if (fs_1.default.existsSync(envPath)) {
    const envContent = fs_1.default.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"'))
                value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'"))
                value = value.slice(1, -1);
            process.env[key] = value;
        }
    }
}
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
    console.error("Missing required environment variables. Ensure .env.local is present.");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const PROGRESS_FILE = path_1.default.join(process.cwd(), 'seed_progress.json');
function loadProgress() {
    if (fs_1.default.existsSync(PROGRESS_FILE)) {
        try {
            return JSON.parse(fs_1.default.readFileSync(PROGRESS_FILE, 'utf8'));
        }
        catch {
            return {};
        }
    }
    return {};
}
function saveProgress(progress) {
    fs_1.default.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}
async function run() {
    console.log("🚀 Starting Production JEE Main Formula Seeding Pipeline...");
    const progress = loadProgress();
    const allSubjects = [
        { name: 'physics', chapters: syllabus_js_1.physicsChapters },
        { name: 'chemistry', chapters: syllabus_js_1.chemistryChapters },
        { name: 'maths', chapters: syllabus_js_1.mathsChapters },
    ];
    for (const subjectData of allSubjects) {
        console.log(`\n========================================`);
        console.log(`📚 Processing Subject: ${subjectData.name.toUpperCase()}`);
        console.log(`========================================\n`);
        for (const chapter of subjectData.chapters) {
            const progKey = `${subjectData.name}_${chapter.name}`;
            if (progress[progKey] && progress[progKey].status === 'completed') {
                console.log(`⏭️  Skipping [${chapter.name}] - Already completed on ${progress[progKey].completed_at}`);
                continue;
            }
            console.log(`\n⏳ Generating formulas for [${chapter.name}]...`);
            const { success, inserted, error } = await (0, seedSingleChapter_js_1.seedSingleChapter)(subjectData.name, chapter.name, chapter.topics || [], supabase, GEMINI_KEY);
            if (success) {
                console.log(`✅ [${chapter.name}] Success! Inserted ${inserted} formulas.`);
                progress[progKey] = {
                    chapter: chapter.name,
                    status: 'completed',
                    formulas_inserted: inserted,
                    completed_at: new Date().toISOString()
                };
            }
            else {
                console.error(`❌ [${chapter.name}] Failed: ${error}`);
                progress[progKey] = {
                    chapter: chapter.name,
                    status: 'failed',
                    error: error,
                    completed_at: new Date().toISOString()
                };
            }
            saveProgress(progress);
            // Delay to respect rate limits (2-3 seconds)
            const delay = 2000 + Math.random() * 1000;
            await new Promise(r => setTimeout(r, delay));
        }
    }
    console.log("\n🎉 Seeding pipeline completed. Check seed_progress.json for a full report.");
}
run().catch(console.error);
