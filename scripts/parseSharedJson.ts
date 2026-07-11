import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync(path.join(process.cwd(), 'scripts/candidate_script.js'), 'utf8');

try {
  const parsed = JSON.parse(raw);
  console.log("Successfully parsed JSON!");
  
  // Let's dump all keys at top level
  console.log("Top-level keys:", Object.keys(parsed));
  
  // Remix or next data might contain the share data in different places
  // Let's recursively search for "content" or "parts" or "messages"
  const messages: any[] = [];
  
  function search(obj: any) {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if this looks like a chat message
    if (obj.author && obj.content && obj.content.parts) {
      messages.push(obj);
    }
    
    for (const key of Object.keys(obj)) {
      search(obj[key]);
    }
  }
  
  search(parsed);
  
  console.log(`Found ${messages.length} messages.`);
  
  // Let's log details of each message
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const text = msg.content.parts.join('\n');
    console.log(`\n--- Message ${i + 1} (${msg.author.role}) ---`);
    console.log(text.substring(0, 1000));
    fs.writeFileSync(path.join(process.cwd(), `scripts/message_${i + 1}.txt`), text);
  }
} catch (e: any) {
  console.error("Failed to parse JSON:", e.message);
}
