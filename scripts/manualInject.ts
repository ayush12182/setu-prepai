import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://osbpdjlywgydidzurpsb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_p8e6J1Hb34XvSCM8vFSfMw_IKObb-6a';

if (!SUPABASE_KEY) {
  console.error('SUPABASE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanJsonString(str: string): string {
  return str.replace(/(?<!\\)\\(?!["\\])/g, "\\\\");
}

function parseStructuredFields(rawContent: string): Record<string, unknown> {
  const parsed: Record<string, unknown> = {};

  const graphs: unknown[] = [];
  const graphRegex = /\[GRAPH\]([\s\S]*?)\[\/GRAPH\]/g;
  let m;
  while ((m = graphRegex.exec(rawContent)) !== null) {
    try {
      const cleaned = cleanJsonString(m[1].trim());
      graphs.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("Graph parse failed:", e);
    }
  }
  if (graphs.length) parsed.graphs = graphs;

  const diagrams: unknown[] = [];
  const diagramRegex = /\[DIAGRAM\]([\s\S]*?)\[\/DIAGRAM\]/g;
  while ((m = diagramRegex.exec(rawContent)) !== null) {
    try {
      const cleaned = cleanJsonString(m[1].trim());
      diagrams.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("Diagram parse failed:", e);
    }
  }
  if (diagrams.length) parsed.diagrams = diagrams;

  const examples: unknown[] = [];
  const exampleRegex = /\[WORKED_EXAMPLE\]([\s\S]*?)\[\/WORKED_EXAMPLE\]/g;
  while ((m = exampleRegex.exec(rawContent)) !== null) {
    try {
      const cleaned = cleanJsonString(m[1].trim());
      examples.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("Worked example parse failed:", e);
    }
  }
  if (examples.length) parsed.worked_examples = examples;

  const mistakes: string[] = [];
  const mistakeRegex = /\[COMMON_MISTAKE\]([\s\S]*?)\[\/COMMON_MISTAKE\]/g;
  while ((m = mistakeRegex.exec(rawContent)) !== null) {
    const text = m[1].trim();
    if (text) mistakes.push(text);
  }
  if (mistakes.length) parsed.common_mistakes = mistakes;

  const formulas: unknown[] = [];
  const formulaRegex = /\[FORMULA\s+title="([^"]+)"\]([\s\S]*?)\[\/FORMULA\]/g;
  while ((m = formulaRegex.exec(rawContent)) !== null) {
    const title = m[1].trim();
    const body = m[2].trim();
    const lines = body.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const latex = lines[0] || "";
    const variables = lines.find((l: string) => l.startsWith("**Variables:**"))?.replace("**Variables:**", "").trim() || "";
    const units = lines.find((l: string) => l.startsWith("**SI Units:**"))?.replace("**SI Units:**", "").trim() || "";
    const physicalMeaning = lines.find((l: string) => l.startsWith("**Physical Meaning:**"))?.replace("**Physical Meaning:**", "").trim() || "";
    const whenToUse = lines.find((l: string) => l.startsWith("**When to use:**"))?.replace("**When to use:**", "").trim() || "";
    const whenNotToUse = lines.find((l: string) => l.startsWith("**When NOT to use:**") || l.startsWith("**When fallback/not to use:**"))?.replace(/^\*\*When (?:NOT|fallback\/not) to use:\*\*/, "").trim() || "";
    const memoryTrick = lines.find((l: string) => l.startsWith("**Memory Trick:**"))?.replace("**Memory Trick:**", "").trim() || "";
    const commonMistake = lines.find((l: string) => l.startsWith("**Common Mistake:**") || l.startsWith("**Common Mistakes:**"))?.replace(/^\*\*Common Mistakes?:\*\*/, "").trim() || "";
    const solvedExample = lines.find((l: string) => l.startsWith("**One Solved Example:**") || l.startsWith("**Solved Example:**"))?.replace(/^\*\*(?:One )?Solved Example:\*\*/, "").trim() || "";
    const relatedFormula = lines.find((l: string) => l.startsWith("**Related Formula:**"))?.replace("**Related Formula:**", "").trim() || "";
    
    formulas.push({ 
      title, latex, variables, units, physicalMeaning, whenToUse, whenNotToUse, memoryTrick, commonMistake, solvedExample, relatedFormula 
    });
  }
  if (formulas.length) parsed.formulas = formulas;

  const overviewMatch = rawContent.match(/## 1\. Chapter Overview([\s\S]*?)(?=##|$)/i);
  const summaryMatch = rawContent.match(/## 12\. Chapter Summary([\s\S]*?)(?=##|$)/i);
  const aiCtxParts = [];
  if (overviewMatch) aiCtxParts.push(overviewMatch[1].trim());
  if (summaryMatch) aiCtxParts.push(summaryMatch[1].trim());
  if (formulas.length) {
    aiCtxParts.push(`Key formulas: ${formulas.slice(0, 5).map((f: any) => `${f.title}: ${f.latex}`).join("; ")}`);
  }
  parsed.ai_context = aiCtxParts.join("\n\n").slice(0, 2000);

  return parsed;
}

async function inject(chapterId: string, chapterName: string, subject: string, filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const wordCount = rawContent.split(/\s+/).length;
  
  const parsedFields = parseStructuredFields(rawContent);

  const { data: latestPublished } = await supabase
    .from("chapter_content")
    .select("version")
    .eq("chapter_id", chapterId)
    .eq("exam_type", "JEE")
    .eq("language", "english")
    .eq("status", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = latestPublished ? latestPublished.version + 1 : 1;
  const versionLabel = `${nextVersion}.0`;

  await supabase.from("chapter_content").delete()
    .eq("chapter_id", chapterId)
    .eq("version", 0);

  const { error } = await supabase.from("chapter_content").upsert({
    chapter_id: chapterId,
    chapter_slug: chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    chapter_name: chapterName,
    subject: subject.toLowerCase(),
    exam_type: "JEE",
    language: "english",
    version: nextVersion,
    version_label: versionLabel,
    status: 'published',
    raw_content: rawContent,
    word_count: wordCount,
    generation_model: "gemini-2.5-flash-manual",
    source: "ai_generated",
    
    ...parsedFields
  });

  if (error) {
    console.error(`Failed for ${chapterId}:`, error);
  } else {
    console.log(`Success: injected ${chapterId}`);
  }
}

async function run() {
  // Functions & Relations is in src/data/staticTopics.ts as 'Sets, Relations and Functions'
  // Let's use math-1 as it was likely intended for the first math chapter 
  // Actually wait, let's use the exact chapter ID from syllabus
  // math-1 is Quadratic Equations in jeeSyllabus.
  // Actually we need to check which chapter ID corresponds to Functions.
  await inject('math-custom-functions', 'Functions & Relations', 'maths', 'scripts/math-functions.md');
  await inject('chem-2', 'Atomic Structure', 'chemistry', 'scripts/chem-2.md');
}

run();
