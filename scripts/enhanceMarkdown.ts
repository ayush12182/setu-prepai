import fs from 'fs';
import path from 'path';

export function enhanceMarkdown(content: string): string {
  let enhanced = content;

  // 1. Wrap "Why [Chapter] matters" into TEACHER_SAYS
  enhanced = enhanced.replace(/\*\*Why (.*?) matters\*\*\n\n([\s\S]*?)(?=\n\*\*|\n##)/g, 
    (match, title, text) => `[TEACHER_SAYS]\n**Why ${title} matters**\n\n${text.trim()}\n[/TEACHER_SAYS]\n\n`);

  // 2. Convert ### subheadings in Theory to CONCEPT blocks
  // We need to be careful. Let's just wrap sections that look like theory.
  // Not perfect without an LLM, but we can do some basic replacements.
  enhanced = enhanced.replace(/### \d+\.\d+ (.*?)\n\n([\s\S]*?)(?=\n### |\n## )/g, 
    (match, title, text) => `[CONCEPT title="${title}"]\n${text.trim()}\n[/CONCEPT]\n\n`);

  // 3. Wrap Exam lens / Pro tip
  enhanced = enhanced.replace(/Exam lens: (.*?)(?=\n|$)/g, 
    (match, text) => `[TEACHER_SAYS]\n**Exam Lens:** ${text}\n[/TEACHER_SAYS]`);
    
  enhanced = enhanced.replace(/Common mistake: (.*?)(?=\n|$)/g, 
    (match, text) => `[COMMON_MISTAKE]\n${text}\n[/COMMON_MISTAKE]`);

  return enhanced;
}

// Test it on Gravitation
const gravPath = '/Users/ayushdixit12/Downloads/PrepEntrance_Physics_Chapters_01_to_07_Master_Notes/07_Gravitation_Complete_Master_Notes.md';
const text = fs.readFileSync(gravPath, 'utf8');
console.log(enhanceMarkdown(text).substring(0, 1500));
