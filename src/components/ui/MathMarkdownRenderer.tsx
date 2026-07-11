import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';
import { Lightbulb, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

interface MathMarkdownRendererProps {
  content: string;
  className?: string;
  isSolution?: boolean;
}

/**
 * Normalizes common AI formatting errors in LaTeX before rendering.
 */
function normalizeMathContent(text: string): string {
  if (!text) return '';
  let normalized = text;

  // 1. Fix malformed block delimiters (e.g., \$$ to $$)
  normalized = normalized.replace(/\\\$\$/g, '$$$$');
  
  // 2. Fix \[ and \] to $$
  normalized = normalized.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
  
  // 3. Fix \( and \) to $
  normalized = normalized.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  
  // 4. Ensure block math $$ has newlines around it so it renders as a proper block element in markdown
  normalized = normalized.replace(/\$\$(.*?)\$\$/gs, (match, inner) => {
    return `\n\n$$${inner}$$\n\n`;
  });
  
  // 5. Remove any raw AI structural metadata like [METADATA]
  normalized = normalized.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/gi, '');
  
  // 6. Fix "Step X:" formatting if the AI forgets to use proper headings, just in case
  normalized = normalized.replace(/\*\*(Step \d+[:]?)\*\*/g, '### $1');

  // Remove multiple consecutive newlines
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  return normalized.trim();
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ 
  content, 
  className,
  isSolution = false
}) => {
  const normalizedContent = normalizeMathContent(content);

  return (
    <div className={cn(
      "w-full prose prose-slate max-w-none text-[15px] leading-relaxed",
      isSolution && "solution-card-mode",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h3: ({ node, ...props }) => {
            const text = String(props.children);
            
            // Custom styling for specific section headers
            if (text.toLowerCase().includes('concept')) {
              return (
                <div className="flex items-center gap-2 mb-3 mt-6 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-900 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('step-by-step') || text.toLowerCase().includes('step 1')) {
              return (
                <div className="flex items-center gap-2 mb-3 mt-6 pb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('step ')) {
              return <h4 className="text-[13px] font-bold text-slate-700 mt-5 mb-2 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-300" {...props} />;
            }
            if (text.toLowerCase().includes('final answer')) {
              return (
                <div className="flex items-center gap-2 mb-3 mt-6 pb-2 border-b border-emerald-100">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-800 m-0" {...props} />
                </div>
              );
            }
            if (text.toLowerCase().includes('mentor tip') || text.toLowerCase().includes('insight')) {
              return (
                <div className="flex items-center gap-2 mb-2 mt-6">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-800 m-0" {...props} />
                </div>
              );
            }
            
            return <h3 className="text-sm font-bold text-slate-800 mt-6 mb-3" {...props} />;
          },
          h4: ({ node, ...props }) => <h4 className="text-[13px] font-bold text-slate-700 mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => {
            // Check if this paragraph contains a final answer or mentor tip
            const isFinalAnswer = node.position && node.position.start.line > 0 && String(props.children).includes('\\boxed');
            
            return <p className="text-slate-700 mb-4" {...props} />;
          },
          div: ({ node, className, ...props }) => {
             // Intercept KaTeX display mode wrappers for styling
             if (className?.includes('math-display')) {
               return (
                 <div className="my-5 overflow-x-auto overflow-y-hidden py-4 px-4 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex justify-center items-center shadow-sm scrollbar-thin scrollbar-thumb-blue-200">
                   <div className={className} {...props} />
                 </div>
               );
             }
             return <div className={className} {...props} />;
          },
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 text-slate-700 space-y-1.5 marker:text-slate-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 text-slate-700 space-y-1.5 marker:text-slate-400 font-medium" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>;
            }
            return (
              <div className="my-4 overflow-x-auto bg-slate-900 p-4 rounded-xl">
                <code className="text-slate-50 text-[13px] font-mono leading-relaxed" {...props}>{children}</code>
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
