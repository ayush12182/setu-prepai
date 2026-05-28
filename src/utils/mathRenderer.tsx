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
    // Last-resort: strip commands and show plain text
    return tex
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\vec\{([^}]*)\}/g, '→$1')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '');
  }
}

// ─── Delimiter normalisation ──────────────────────────────────────────────────

/** Convert all AI LaTeX delimiter styles → $$ and $ for unified parsing */
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
 * Render a single line/sentence that may contain inline $...$ math.
 * Never shows raw LaTeX.
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

/** Centred display-math block (for $$...$$ expressions) */
export const DisplayMath: React.FC<{ tex: string }> = ({ tex }) => (
  <div
    className="my-5 py-2 overflow-x-auto flex justify-center"
    dangerouslySetInnerHTML={{ __html: katexToHtml(tex, true) }}
  />
);

// ─── Full-content processor ───────────────────────────────────────────────────

/**
 * Process a full AI-generated notes string:
 *  1. Normalise all delimiter styles
 *  2. Split by $$...$$ display blocks
 *  3. Pass text segments line-by-line to `lineRenderer`
 *  4. Render display blocks with KaTeX (displayMode: true)
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
