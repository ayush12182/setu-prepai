const text = `Step 1: Concept used - Vector addition and coordinate geometry.
Step 2: Formula used - Position vector is ...
Step 3: Mathematical substitution - ...
Step 4: Simplification - ...
Step 5: Final answer - The answer is 10.`;

let normalized = text;
normalized = normalized.replace(/^---\s*(#+)/gm, '$1');
normalized = normalized.replace(/---\s+(#+)/g, '\n\n$1');
normalized = normalized.replace(/^---\s*$/gm, '');
normalized = normalized.replace(/([^\n])\s+(#{1,6}\s+[A-Za-z0-9])/g, '$1\n\n$2');
normalized = normalized.replace(/([a-z0-9\)\.]|[^\n])\s+(\d+\.\s+[A-Za-z0-9\*])/g, '$1\n\n$2');
normalized = normalized.replace(/([^\n])\s+([-\*]\s+[A-Za-z0-9])/g, '$1\n\n$2');
normalized = normalized.replace(/^(#{1,6}\s+[^:\n]+:)\s+([A-Za-z0-9\*\$])/gm, '$1\n\n$2');
normalized = normalized.replace(/\\\$\$/g, '$$$$');
normalized = normalized.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
normalized = normalized.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
normalized = normalized.replace(/\$\$(.*?)\$\$/gs, (match, inner) => `\n\n$$${inner}$$\n\n`);
normalized = normalized.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/gi, '');
normalized = normalized.replace(/\*\*(Step \d+[:]?)\*\*/g, '### $1');
normalized = normalized.replace(/\n{3,}/g, '\n\n');
normalized = normalized.replace(/\\\^/g, '^').replace(/\\>/g, '>').replace(/\\</g, '<');
normalized = normalized.replace(/\^([-\+]?\w+)/g, '^{$1}');
console.log(normalized.trim());
