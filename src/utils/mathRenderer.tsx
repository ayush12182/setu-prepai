import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ─── KaTeX renderer ───────────────────────────────────────────────────────────

function katexToHtml(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode,
      strict: 'ignore',
      trust: true,
      output: 'html',
    });
  } catch {
    return tex
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\vec\{([^}]*)\}/g, '→$1')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '');
  }
}

// ─── Delimiter normalisation ──────────────────────────────────────────────────

/** Convert every AI LaTeX delimiter style → unified $$ / $ */
export function normalizeMathDelimiters(text: string): string {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$${inner.trim()}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner.trim()}$`)
    .replace(/\*\*([^*\n]+)\*\*/g, '$1'); // strip markdown bold
}

// ─── Chunk parser ─────────────────────────────────────────────────────────────

interface MathChunk {
  type: 'text' | 'inline' | 'display';
  value: string;
}

function chunkText(text: string): MathChunk[] {
  const chunks: MathChunk[] = [];
  const re = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) chunks.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1] !== undefined) {
      chunks.push({ type: 'display', value: m[1].trim() });
    } else {
      chunks.push({ type: 'inline', value: (m[2] ?? '').trim() });
    }
    last = re.lastIndex;
  }
  if (last < text.length) chunks.push({ type: 'text', value: text.slice(last) });
  return chunks;
}

// ─── Components ───────────────────────────────────────────────────────────────

/**
 * MathLine — renders a single line/sentence that may contain inline $…$ math.
 * Handles ALL AI delimiter styles. Never shows raw LaTeX.
 */
export const MathLine: React.FC<{ children: string }> = ({ children }) => {
  const normalized = normalizeMathDelimiters(children);
  const chunks = chunkText(normalized);
  return (
    <>
      {chunks.map((chunk, i) => {
        if (chunk.type === 'inline') {
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: katexToHtml(chunk.value, false) }}
            />
          );
        }
        if (chunk.type === 'display') {
          return (
            <span
              key={i}
              className="block text-center my-3 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: katexToHtml(chunk.value, true) }}
            />
          );
        }
        return <span key={i}>{chunk.value}</span>;
      })}
    </>
  );
};

/** Centred display-math block (for $$…$$ expressions) */
export const DisplayMath: React.FC<{ tex: string }> = ({ tex }) => (
  <div
    className="my-5 py-2 overflow-x-auto flex justify-center"
    dangerouslySetInnerHTML={{ __html: katexToHtml(tex, true) }}
  />
);

// ─── Full-content processor ───────────────────────────────────────────────────

/**
 * processNotesContent — processes a full AI-generated markdown string:
 *  1. Normalises all delimiter styles
 *  2. Splits out $$…$$ display blocks
 *  3. Passes text segments line-by-line to `lineRenderer`
 *  4. Renders display blocks with KaTeX (displayMode: true)
 *
 * Used by: OnePageNotes, ChapterNotesPage, LecturePrepEntrance, AskPrepEntrance, AITeachingRoom
 */
export function processNotesContent(
  content: string,
  lineRenderer: (line: string, key: number) => React.ReactNode
): React.ReactNode[] {
  const normalized = normalizeMathDelimiters(content);
  const elements: React.ReactNode[] = [];
  let keyIdx = 0;

  const blockRe = /\$\$([\s\S]*?)\$\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRe.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      normalized.slice(lastIndex, match.index).split('\n').forEach((line) => {
        elements.push(lineRenderer(line, keyIdx++));
      });
    }
    elements.push(<DisplayMath key={keyIdx++} tex={match[1].trim()} />);
    lastIndex = blockRe.lastIndex;
  }

  if (lastIndex < normalized.length) {
    normalized.slice(lastIndex).split('\n').forEach((line) => {
      elements.push(lineRenderer(line, keyIdx++));
    });
  }

  return elements;
}

// ─── Generic prose renderer ───────────────────────────────────────────────────

/**
 * renderProseNotes — lightweight renderer for chat/AI responses.
 * Handles headings, bullets, bold, and all LaTeX styles.
 * Use this for AskPrepEntrance, AITeachingRoom, LecturePrepEntrance notes, etc.
 */
export function renderProseNotes(content: string): React.ReactNode[] {
  return processNotesContent(content, (line, key) => {
    const t = line.trim();
    if (!t) return <br key={key} />;
    if (t.startsWith('# '))   return <h2 key={key} className="text-lg font-bold mt-4 mb-2 text-foreground"><MathLine>{t.slice(2)}</MathLine></h2>;
    if (t.startsWith('## '))  return <h3 key={key} className="text-base font-semibold mt-3 mb-1 text-foreground"><MathLine>{t.slice(3)}</MathLine></h3>;
    if (t.startsWith('### ')) return <h4 key={key} className="text-sm font-semibold mt-2 mb-1 text-foreground/90"><MathLine>{t.slice(4)}</MathLine></h4>;
    if (t.startsWith('• ') || t.startsWith('- ') || t.startsWith('* '))
      return <p key={key} className="ml-4 my-1 flex gap-2"><span className="shrink-0 mt-1 text-primary">•</span><MathLine>{t.slice(2)}</MathLine></p>;
    if (t.startsWith('⚡') || t.startsWith('💡'))
      return <p key={key} className="ml-0 my-2 font-semibold text-prepentrance-saffron"><MathLine>{t}</MathLine></p>;
    if (t.startsWith('---')) return <hr key={key} className="my-4 border-border" />;
    if (t.match(/^\d+\./))   return <p key={key} className="ml-4 my-1 font-medium"><MathLine>{t}</MathLine></p>;
    return <p key={key} className="my-1.5 leading-relaxed"><MathLine>{t}</MathLine></p>;
  });
}
