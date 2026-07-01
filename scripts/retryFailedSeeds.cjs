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
    console.error("Missing required environment variables.");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const PROGRESS_FILE = path_1.default.join(process.cwd(), 'seed_progress.json');
function loadProgress() {
    if (fs_1.default.existsSync(PROGRESS_FILE)) {
        return JSON.parse(fs_1.default.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {};
}
function saveProgress(progress) {
    fs_1.default.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}
function getChapterTopics(subject, chapterName) {
    let chapters = [];
    if (subject === 'physics')
        chapters = syllabus_js_1.physicsChapters;
    if (subject === 'chemistry')
        chapters = syllabus_js_1.chemistryChapters;
    if (subject === 'maths')
        chapters = syllabus_js_1.mathsChapters;
    const chap = chapters.find(c => c.name === chapterName);
    return chap?.topics || [];
}
async function run() {
    console.log("🔄 Starting Retry Pipeline for Failed Chapters...");
    const progress = loadProgress();
    let failedCount = 0;
    for (const [key, data] of Object.entries(progress)) {
        if (data.status === 'failed') {
            failedCount++;
            const [subject, ...chapterParts] = key.split('_');
            const chapterName = chapterParts.join('_');
            console.log(`\n⏳ Retrying [${chapterName}] in ${subject}...`);
            const topics = getChapterTopics(subject, chapterName);
            const { success, inserted, error } = await (0, seedSingleChapter_js_1.seedSingleChapter)(subject, chapterName, topics, supabase, GEMINI_KEY);
            if (success) {
                console.log(`✅ [${chapterName}] Success! Inserted ${inserted} formulas.`);
                progress[key] = {
                    chapter: chapterName,
                    status: 'completed',
                    formulas_inserted: inserted,
                    completed_at: new Date().toISOString()
                };
            }
            else {
                console.error(`❌ [${chapterName}] Still Failed: ${error}`);
                progress[key] = {
                    ...progress[key],
                    retry_error: error,
                    retry_at: new Date().toISOString()
                };
            }
            saveProgress(progress);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    if (failedCount === 0) {
        console.log("✨ No failed chapters found to retry.");
    }
    else {
        console.log("\n🎉 Retry pipeline completed.");
    }
}
run().catch(console.error);
