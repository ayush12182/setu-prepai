const fs = require('fs');

let indexCode = fs.readFileSync('supabase/functions/generate-notes/index.ts', 'utf8');

const chem2Md = fs.readFileSync('scripts/chem-2.md', 'utf8');
const math1Md = fs.readFileSync('scripts/math-functions.md', 'utf8');

// Use JSON.stringify so we don't have to deal with backtick escaping in JS strings
const injectionCode = `
    let finalContent: string | null = null;
    if (chapterId === 'chem-2') {
      finalContent = JSON.parse(${JSON.stringify(JSON.stringify(chem2Md))});
    } else if (chapterId === 'math-custom-functions' || chapterId === 'math-1' || chapterName === 'Functions & Relations') {
      finalContent = JSON.parse(${JSON.stringify(JSON.stringify(math1Md))});
    }
`;

indexCode = indexCode.replace(/let finalContent: string \| null = null;[\s\S]*?if \(chapterId === 'phy-2' && hasAdminKey\) \{[\s\S]*?\[\/METADATA\]\n\n# Laws of Motion — Complete Master Notes\n/, injectionCode + '\n\n// ');

fs.writeFileSync('supabase/functions/generate-notes/index.ts', indexCode);
