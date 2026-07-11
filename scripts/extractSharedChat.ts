import fs from 'fs';
import path from 'path';

const htmlPath = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/c8075ca5-e7fc-46c0-8ad3-ca5c7799ad4a/.system_generated/steps/4184/content.md';
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1].trim();
  count++;
  console.log(`Script ${count} (length: ${content.length}): ${content.substring(0, 150).replace(/\n/g, ' ')}...`);
  
  if (content.length > 5000) {
    fs.writeFileSync(path.join(process.cwd(), `scripts/large_script_${count}.js`), content);
    console.log(`  -> Saved to large_script_${count}.js`);
  }
}
