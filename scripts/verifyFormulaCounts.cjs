"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const syllabus_1 = require("../src/data/syllabus");
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
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
async function verify() {
    console.log("🔍 Verifying JEE Main Formula Library Database...");
    const allExpectedChapters = [
        ...syllabus_1.physicsChapters.map(c => ({ ...c, subject: 'physics' })),
        ...syllabus_1.chemistryChapters.map(c => ({ ...c, subject: 'chemistry' })),
        ...syllabus_1.mathsChapters.map(c => ({ ...c, subject: 'maths' }))
    ];
    const totalExpected = allExpectedChapters.length;
    const { data: dbMetadata, error: metaErr } = await supabase
        .from('revision_chapter_metadata')
        .select('*');
    if (metaErr)
        throw new Error("Failed to fetch metadata: " + metaErr.message);
    const { count: totalFormulas, error: formErr } = await supabase
        .from('revision_formulas')
        .select('*', { count: 'exact', head: true });
    if (formErr)
        throw new Error("Failed to fetch formulas: " + formErr.message);
    let missingCount = 0;
    let populatedCount = 0;
    let invalidFormulasCount = 0;
    console.log("\n--- Verification Report ---");
    console.log(`Expected Chapters: ${totalExpected}`);
    console.log(`Populated Chapters (in Metadata): ${dbMetadata.length}`);
    console.log(`Total Formulas Inserted: ${totalFormulas}\n`);
    for (const ch of allExpectedChapters) {
        const meta = dbMetadata.find(m => m.chapter_name === ch.name && m.subject === ch.subject);
        if (!meta) {
            console.log(`❌ Missing Chapter: [${ch.subject.toUpperCase()}] ${ch.name}`);
            missingCount++;
        }
        else {
            populatedCount++;
            if (meta.formula_count < 5) {
                console.warn(`⚠️ Warning: [${ch.subject.toUpperCase()}] ${ch.name} has only ${meta.formula_count} formulas.`);
            }
        }
    }
    console.log("\n---------------------------");
    if (missingCount === 0) {
        console.log("✅ 100% POPULATED! No missing chapters.");
    }
    else {
        console.error(`❌ ${missingCount} chapters are missing or not seeded.`);
    }
    if (totalFormulas && totalFormulas > 800) {
        console.log(`✅ Total formula count is excellent: ${totalFormulas} formulas.`);
    }
    else {
        console.warn(`⚠️ Total formula count (${totalFormulas}) is lower than the target 800-1200.`);
    }
}
verify().catch(console.error);
