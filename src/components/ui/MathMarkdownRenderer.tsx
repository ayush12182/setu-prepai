import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { Lightbulb, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

interface MathMarkdownRendererProps {
  content: string;
  className?: string;
  isSolution?: boolean;
}

/**
 * Normalizes common AI formatting errors in LaTeX and Markdown before rendering.
 */
function normalizeMarkdownContent(text: string): string {
  if (!text) return '';
  let normalized = text;

  // --- 1. Markdown Structural Normalization ---
  
  // Remove standalone horizontal rules that got prepended to headings
  // e.g. "--- ## 2. Learning Outcomes" -> "## 2. Learning Outcomes"
  normalized = normalized.replace(/^---\s*(#+)/gm, '$1');
  // Handle inline ones just in case
  normalized = normalized.replace(/---\s+(#+)/g, '\n\n$1');
  
  // Remove standalone "---" on its own line if it's polluting the text
  normalized = normalized.replace(/^---\s*$/gm, '');

  // 1a. UN-SQUASH HEADINGS
  // If a heading appears in the middle of a line, force it to a new line.
  // Example: "some text ## 12. Summary" -> "some text \n\n ## 12. Summary"
  normalized = normalized.replace(/([^\n])\s+(#{1,6}\s+[A-Za-z0-9])/g, '$1\n\n$2');

  // 1b. UN-SQUASH LIST ITEMS (Numbers)
  // Fix lists collapsed into a single line (especially Learning Outcomes).
  // Looks for a number, period, space, and a capital letter/number, and forces it to a new line.
  // Example: "motion). 2. String Tension:" -> "motion).\n\n2. String Tension:"
  normalized = normalized.replace(/([a-z0-9\)\.]|[^\n])\s+(\d+\.\s+[A-Za-z0-9\*])/g, '$1\n\n$2');

  // 1c. UN-SQUASH BULLETS
  // Fix multiple spaces or squashed bullets around list items (* or -)
  // Example: "v_top >= \sqrt{gR} * To oscillate:" -> "v_top >= \sqrt{gR}\n\n* To oscillate:"
  normalized = normalized.replace(/([^\n])\s+([-\*]\s+[A-Za-z0-9])/g, '$1\n\n$2');

  // 1d. SEPARATE INLINE HEADINGS (e.g. "### 3. Normal Force: The normal force...")
  // If an entire paragraph is squashed into an h3 because of a missing newline after the title.
  // We look for a heading, some text, a colon, and then a character, and split it.
  normalized = normalized.replace(/^(#{1,6}\s+[^:\n]+:)\s+([A-Za-z0-9\*\$])/gm, '$1\n\n$2');

  // --- 2. Math Normalization ---
  // Fix malformed block delimiters (e.g., \$$ to $$)
  normalized = normalized.replace(/\\\$\$/g, '$$$$');
  
  // Fix \[ and \] to $$
  normalized = normalized.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
  
  // Fix \( and \) to $
  normalized = normalized.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  
  // Ensure block math $$ has newlines around it so it renders as a proper block element in markdown
  normalized = normalized.replace(/\$\$(.*?)\$\$/gs, (match, inner) => {
    return `\n\n$$${inner}$$\n\n`;
  });
  
  // Remove any raw AI structural metadata like [METADATA]
  normalized = normalized.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/gi, '');
  
  // Fix "Step X:" formatting if the AI forgets to use proper headings, just in case
  normalized = normalized.replace(/\*\*(Step \d+[:]?)\*\*/g, '### $1');

  // Remove multiple consecutive newlines
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Fix escaped characters that break MathJax
  normalized = normalized.replace(/\\\^/g, '^').replace(/\\>/g, '>').replace(/\\</g, '<');

  // Add braces to superscripts if missing: ^-2 -> ^{-2} so KaTeX renders it properly
  normalized = normalized.replace(/\^([-\+]?\w+)/g, '^{$1}');

  return normalized.trim();
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ 
  content, 
  className,
  isSolution = false
}) => {
  const normalizedContent = normalizeMarkdownContent(content);

  return (
    <div className={cn(
      // Global Typography System
      "w-full prose prose-slate max-w-[950px] mx-auto",
      "text-[16px] md:text-[17px] lg:text-[18px]", // responsive base font size
      "leading-[1.75] font-normal text-slate-800", // deep slate text, good line height
      isSolution && "solution-card-mode max-w-none text-[15px] lg:text-[16px]",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-[32px] md:text-[36px] font-[800] leading-[1.2] text-slate-900 mt-8 mb-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-[26px] md:text-[30px] font-[800] leading-[1.3] text-slate-900 mt-[40px] md:mt-[48px] mb-[16px] md:mb-[20px]" {...props} />
          ),
          h3: ({ node, ...props }) => {
            const text = String(props.children);
            
            // Custom styling for specific section headers
            if (text.toLowerCase().includes('concept')) {
              return (
                <div className="flex items-center gap-2 mb-4 mt-8 pb-3 border-b border-slate-200">
                  <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="text-[14px] md:text-[16px] font-[700] uppercase tracking-[0.04em] text-slate-900 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('step-by-step') || text.toLowerCase().includes('step 1')) {
              return (
                <div className="flex items-center gap-2 mb-3 mt-6 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-[14px] md:text-[16px] font-[700] uppercase tracking-[0.04em] text-slate-900 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('step ')) {
              return <h4 className="text-[16px] font-[700] text-slate-800 mt-6 mb-3 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-300" {...props} />;
            }
            if (text.toLowerCase().includes('final answer')) {
              return (
                <div className="flex items-center gap-2 mb-4 mt-8 pb-3 border-b border-emerald-100">
                  <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="text-[14px] md:text-[16px] font-[700] uppercase tracking-[0.04em] text-emerald-900 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('mentor tip') || text.toLowerCase().includes('insight')) {
              return (
                <div className="flex items-center gap-2 mb-3 mt-8">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="text-[13px] font-[800] uppercase tracking-wider text-amber-900 m-0" {...props} />
                </div>
              );
            }
            
            return <h3 className="text-[21px] md:text-[24px] font-[700] leading-[1.35] text-slate-900 mt-[28px] md:mt-[36px] mb-[12px] md:mb-[16px]" {...props} />;
          },
          h4: ({ node, ...props }) => (
            <h4 className="text-[18px] md:text-[20px] font-[700] text-slate-900 mt-6 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => {
            return <p className="text-slate-800 mb-[16px] md:mb-[20px]" {...props} />;
          },
          div: ({ node, className, ...props }) => {
             // Intercept KaTeX display mode wrappers for styling
             if (className?.includes('math-display')) {
               return (
                 <div className="my-6 overflow-x-auto overflow-y-hidden py-4 px-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] flex justify-center items-center shadow-sm scrollbar-thin scrollbar-thumb-slate-200 border-l-4 border-l-blue-400">
                   <div className={className} {...props} />
                 </div>
               );
             }
             return <div className={className} {...props} />;
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-[20px] mt-[12px] text-slate-800 space-y-[8px] md:space-y-[12px] marker:text-slate-400" {...props} />
          ),
          ol: ({ node, ...props }) => {
            // Apply structured list styling suitable for learning outcomes and standard ordered lists
            return (
              <ol className="list-decimal pl-6 mb-[20px] mt-[12px] text-slate-800 space-y-[12px] marker:text-blue-600 marker:font-bold" {...props} />
            );
          },
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-[700] text-slate-900" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 border-b border-slate-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-[700] text-slate-900 text-sm whitespace-nowrap" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 border-b border-slate-100 text-slate-700 text-sm last:border-b-0" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[14px] font-mono" {...props}>{children}</code>;
            }
            return (
              <div className="my-6 overflow-x-auto bg-slate-900 p-5 rounded-[14px]">
                <code className="text-slate-50 text-[14px] font-mono leading-relaxed" {...props}>{children}</code>
              </div>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdownRenderer;

