import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'scripts/unescaped_stream.txt'), 'utf8');
console.log("Length:", content.length);
console.log("First 1000 characters:");
console.log(JSON.stringify(content.substring(0, 1000)));
