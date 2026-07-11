import { writeFileSync } from 'fs';
import { physicsChapters } from '../src/data/syllabus';

function main() {
  console.log("Syncing physics Chapters from syllabus.ts to physics.json...");
  const jsonStr = JSON.stringify(physicsChapters, null, 2);
  writeFileSync('/Users/ayushdixit12/setu-prepai/src/data/syllabus/physics.json', jsonStr);
  console.log("Success! Synchronized physics.json");
}

main();
