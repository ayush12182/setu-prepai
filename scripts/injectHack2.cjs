const fs = require('fs');

let indexCode = fs.readFileSync('supabase/functions/generate-notes/index.ts', 'utf8');

const chem2Md = fs.readFileSync('scripts/chem-2.md', 'utf8');
const math1Md = fs.readFileSync('scripts/math-functions.md', 'utf8');

const injectionCode = `
    if (chapterId === 'chem-2') {
      finalContent = JSON.parse(${JSON.stringify(JSON.stringify(chem2Md))});
    } else if (chapterId === 'math-custom-functions' || chapterId === 'math-1' || chapterName === 'Functions & Relations') {
      finalContent = JSON.parse(${JSON.stringify(JSON.stringify(math1Md))});
    }

    if (!finalContent) {
`;

indexCode = indexCode.replace("const maxAttempts = 3;", "const maxAttempts = 3;" + injectionCode);
indexCode = indexCode.replace("if (!finalContent) {", "}\n\n    if (!finalContent) {");

fs.writeFileSync('supabase/functions/generate-notes/index.ts', indexCode);
