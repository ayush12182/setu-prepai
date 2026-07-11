import { readFileSync } from 'fs';

const logPath = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/c8075ca5-e7fc-46c0-8ad3-ca5c7799ad4a/.system_generated/logs/transcript.jsonl';

function main() {
  const content = readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if ([3504, 3505, 3512].includes(obj.step_index)) {
        console.log(`\n--- STEP ${obj.step_index} (${obj.source}) ---`);
        console.log(obj.content?.slice(0, 1000));
      }
    } catch (e) {}
  }
}

main();
