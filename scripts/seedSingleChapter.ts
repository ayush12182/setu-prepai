import { createClient } from '@supabase/supabase-js';

// Retry wrapper with exponential backoff
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      
      const isRateLimit = error.message?.includes('429') || error.message?.includes('503');
      if (isRateLimit) {
        const delay = Math.pow(2, attempt) * 2000;
        console.warn(`[WARN] Rate limited. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export async function seedSingleChapter(
  subject: string,
  chapterName: string,
  topics: string[],
  supabase: any,
  geminiKey: string
): Promise<{ success: boolean; inserted: number; error?: string }> {
  
  const prompt = `You are an elite IIT-JEE faculty member. Generate a comprehensive formula sheet for the chapter "${chapterName}" (Subject: ${subject}).
Topics to cover: ${topics.join(', ')}.

Requirements:
- Generate 15 to 25 highly accurate formulas, including derivations, short concepts, and memory tricks.
- Use strict LaTeX for equations (no markdown $ or $$ wrappers).
- Provide variables, units, difficulty, weightage (1-5), and common mistakes.

OUTPUT STRICTLY VALID JSON MATCHING THIS EXACT SCHEMA:
{
  "formulas": [
    {
      "title": "string",
      "latex": "string",
      "variables": [{ "symbol": "string", "meaning": "string", "unit": "string" }],
      "concept": "string",
      "derivation": "string (optional)",
      "memoryTrick": "string (optional)",
      "commonMistake": "string",
      "jeeNotes": "string",
      "difficulty": "Easy | Medium | Hard",
      "weightage": "number (1 to 5)",
      "tags": ["string"],
      "relatedFormulas": ["string"]
    }
  ]
}
NO MARKDOWN, NO EXPLANATION outside the JSON.`;

  try {
    const rawData = await withRetry(async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, response_mime_type: 'application/json' }
        })
      });
      
      if (!res.ok) throw new Error(`Gemini API Error: ${res.status}`);
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text;
    });

    if (!rawData) throw new Error("Empty response from AI");

    // Clean JSON if needed
    const cleanJson = rawData.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    if (!data.formulas || !Array.isArray(data.formulas)) {
      throw new Error("Invalid schema: missing 'formulas' array");
    }

    // Validation & Deduplication
    const validFormulas = [];
    const seenTitles = new Set();
    const seenLatex = new Set();

    for (const f of data.formulas) {
      if (!f.title || !f.latex || !f.concept || !f.variables) continue; // Required fields
      if (f.latex.includes('$')) continue; // Invalid latex syntax containing unescaped wrappers

      const titleKey = f.title.toLowerCase().trim();
      const latexKey = f.latex.replace(/\s+/g, '');
      
      if (seenTitles.has(titleKey) || seenLatex.has(latexKey)) continue; // Deduplicate
      
      seenTitles.add(titleKey);
      seenLatex.add(latexKey);
      validFormulas.push(f);
    }

    if (validFormulas.length === 0) {
      throw new Error("All generated formulas were rejected by validation");
    }

    // Upsert Metadata
    const formulaCount = validFormulas.length;
    const highPriorityCount = validFormulas.filter(f => f.weightage >= 4).length;
    const revisionTimeMins = Math.ceil(formulaCount * 1.5);

    const { data: chapterRes, error: chapErr } = await supabase
      .from('revision_chapter_metadata')
      .upsert({
        subject: subject.toLowerCase(),
        chapter_name: chapterName,
        formula_count: formulaCount,
        high_priority_formula_count: highPriorityCount,
        revision_time_mins: revisionTimeMins,
        updated_at: new Date().toISOString()
      }, { onConflict: 'subject,chapter_name' })
      .select()
      .single();

    if (chapErr || !chapterRes) throw new Error(`Metadata Upsert Failed: ${chapErr?.message}`);

    const chapterId = chapterRes.id;

    // Delete existing formulas for this chapter to ensure a clean slate and avoid accidental duplicates from past runs
    await supabase.from('revision_formulas').delete().eq('chapter_id', chapterId);

    // Prepare inserts
    const inserts = validFormulas.map(f => ({
      chapter_id: chapterId,
      subject: subject.toLowerCase(),
      chapter_name: chapterName,
      topic: f.concept,
      title: f.title,
      latex: f.latex,
      variables: f.variables,
      used_for: f.concept,
      difficulty: f.difficulty,
      importance: f.weightage,
      jee_frequency: f.weightage >= 4 ? 'High' : 'Medium',
      shortcut: f.memoryTrick || '',
      common_mistake: f.commonMistake || '',
      derivation: f.derivation || '',
      related_formulas: f.relatedFormulas || [],
      tags: f.tags || []
    }));

    const { error: insertErr } = await supabase.from('revision_formulas').insert(inserts);
    if (insertErr) throw new Error(`Formulas Insert Failed: ${insertErr.message}`);

    return { success: true, inserted: inserts.length };
    
  } catch (error: any) {
    return { success: false, inserted: 0, error: error.message };
  }
}
