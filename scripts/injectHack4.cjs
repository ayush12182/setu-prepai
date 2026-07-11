const fs = require('fs');

let indexCode = fs.readFileSync('supabase/functions/generate-notes/index.ts', 'utf8');

const phy2Md = fs.readFileSync('scripts/phy-2.md', 'utf8');

// I will just add another else if block
const newBlock = `
    } else if (chapterId === 'phy-2') {
      finalContent = JSON.parse(${JSON.stringify(JSON.stringify(phy2Md))});
`;

indexCode = indexCode.replace("} else if (chapterId === 'math-custom-functions' || chapterId === 'math-1' || chapterName === 'Functions & Relations') {", newBlock + "    } else if (chapterId === 'math-custom-functions' || chapterId === 'math-1' || chapterName === 'Functions & Relations') {");

fs.writeFileSync('supabase/functions/generate-notes/index.ts', indexCode);
