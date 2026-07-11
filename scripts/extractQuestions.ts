import { readFileSync, writeFileSync } from 'fs';

const logPath = '/Users/ayushdixit12/.gemini/antigravity-ide/brain/c8075ca5-e7fc-46c0-8ad3-ca5c7799ad4a/.system_generated/logs/transcript.jsonl';

function main() {
  console.log("Parsing transcript.jsonl...");
  const content = readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  const extractedBatches: { step: number; source: string; text: string }[] = [];
  
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      const text = obj.content || '';
      // Look for question patterns
      if (text.includes("Answer: A") || text.includes("Answer: B") || text.includes("Answer: C") || text.includes("Answer: D") || text.includes("Answer: A.")) {
        extractedBatches.push({
          step: obj.step_index,
          source: obj.source,
          text: text
        });
      }
    } catch (e) {}
  }
  
  console.log(`Found ${extractedBatches.length} steps with answers.`);
  
  // Write the matching steps to a file so we can view them
  writeFileSync('/Users/ayushdixit12/setu-prepai/scripts/extracted_raw_steps.json', JSON.stringify(extractedBatches, null, 2));
  console.log("Saved to scripts/extracted_raw_steps.json");
}

main();
