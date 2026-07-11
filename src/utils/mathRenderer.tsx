import React from 'react';
import { MathMarkdownRenderer } from '@/components/ui/MathMarkdownRenderer';

// ─── Legacy Shims using the robust MathMarkdownRenderer ──────────────────────

/**
 * Normalises AI LaTeX delimiters (shimmed to new normalizer if needed, but MathMarkdownRenderer handles it internally)
 */
export function stripAiMetaTags(text: string): string {
  if (!text) return '';
  return text.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/gi, '').trim();
}

export function normalizeMathDelimiters(text: string): string {
  return text || '';
}

/**
 * MathLine — renders a single line/sentence that may contain inline math.
 * Shimmed to use MathMarkdownRenderer for robust KaTeX support.
 */
export const MathLine: React.FC<{ children?: string | null }> = ({ children }) => {
  if (!children) return <></>;
  // We use MathMarkdownRenderer but wrapped lightly to mimic inline behavior
  return <MathMarkdownRenderer content={String(children)} />;
};

/** Centred display-math block */
export const DisplayMath: React.FC<{ tex: string }> = ({ tex }) => (
  <MathMarkdownRenderer content={`$$${tex}$$`} />
);

/**
 * processNotesContent — processes a full AI-generated markdown string.
 * Shimmed to directly use MathMarkdownRenderer for all content parsing.
 */
export function processNotesContent(
  content: string,
  lineRenderer?: (line: string, key: number) => React.ReactNode
): React.ReactNode[] {
  // Instead of breaking it line by line and rendering custom components, 
  // the new pipeline handles the entire markdown document as a single unit.
  return [<MathMarkdownRenderer key={0} content={content} />];
}

/**
 * renderProseNotes — lightweight renderer for chat/AI responses.
 */
export function renderProseNotes(content: string): React.ReactNode[] {
  return [<MathMarkdownRenderer key={0} content={content} />];
}

export default {
  MathLine,
  DisplayMath,
  processNotesContent,
  renderProseNotes,
  stripAiMetaTags,
  normalizeMathDelimiters
};
