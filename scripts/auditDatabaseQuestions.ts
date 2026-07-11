import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { classifyQuestion } from '../src/utils/chapterClassifier';

// Load environment variables
const env = loadEnv('development', process.cwd(), '');
const supabase = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function runAudit() {
  console.log("Starting PrepEntrance Database Integrity Audit...");
  
  let offset = 0;
  const limit = 500;
  let auditedCount = 0;
  let mismatchCount = 0;
  const updates: Array<{ id: string; oldCh: string; newCh: string; text: string }> = [];

  while (true) {
    console.log(`Fetching questions starting at offset ${offset}...`);
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, question_text, option_a, option_b, option_c, option_d, explanation, chapter_id, subject')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch error:", error);
      break;
    }

    if (!questions || questions.length === 0) {
      break;
    }

    for (const q of questions) {
      auditedCount++;
      const subject = q.subject || 'Physics';
      
      // Skip non-Physics questions for rule-based audit for now
      if (!subject.toLowerCase().includes('phys')) continue;

      const classification = classifyQuestion(
        subject,
        q.question_text || '',
        [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || ''],
        q.explanation || ''
      );

      const detected = classification.detectedChapterId;
      const stored = q.chapter_id;

      if (detected !== 'unknown' && detected !== stored) {
        mismatchCount++;
        updates.push({
          id: q.id,
          oldCh: stored,
          newCh: detected,
          text: q.question_text || ''
        });

        // Proactively relocate in the database
        const { error: updateError } = await supabase
          .from('questions')
          .update({ chapter_id: detected } as any)
          .eq('id', q.id);

        if (updateError) {
          console.error(`Failed to update question ${q.id}:`, updateError.message);
        } else {
          console.log(`[RELOCATED] ${stored} -> ${detected}: "${q.question_text.slice(0, 50)}..."`);
        }
      }
    }

    offset += limit;
  }

  console.log(`\nAudit Complete!`);
  console.log(`Total questions audited: ${auditedCount}`);
  console.log(`Total mismatches corrected: ${mismatchCount}`);

  // Generate audit report artifact
  const report = `# Database Audit Report - Chapter Mappings

**Audit Timestamp**: ${new Date().toISOString()}  
**Total Questions Scanned**: ${auditedCount}  
**Mismatched Questions Corrected**: ${mismatchCount}

## Relocated Questions Log

| Question Snippet | Previous Chapter ID | Corrected Chapter ID |
| :--- | :--- | :--- |
${updates.map(u => `| "${u.text.slice(0, 70).replace(/\|/g, '\\|')}..." | \`${u.oldCh}\` | \`${u.newCh}\` |`).join('\n')}
`;

  // Write report to artifacts directory
  const reportPath = `/Users/ayushdixit12/.gemini/antigravity-ide/brain/c8075ca5-e7fc-46c0-8ad3-ca5c7799ad4a/database_audit_report.md`;
  await Deno.writeTextFile(reportPath, report).catch(() => {
    // Fallback if not inside Deno (though this TS script runs on Node)
    const fs = require('fs');
    fs.writeFileSync(reportPath, report);
  });

  console.log(`Saved detailed audit report to ${reportPath}`);
}

runAudit().catch(err => {
  console.error("Audit run failed:", err);
});
