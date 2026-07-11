import React from 'react';
import { MathMarkdownRenderer } from '@/components/ui/MathMarkdownRenderer';

// ─── Legacy Shims using the robust MathMarkdownRenderer ──────────────────────

export function formatJeeMath(text: string): string {
  return text || '';
}

export function formatJeeSolution(solution: string): string {
  return solution || '';
}

interface JeeMathTextProps {
  children: string;
  className?: string;
  block?: boolean;
}

export const JeeMathText: React.FC<JeeMathTextProps> = ({ 
  children, 
  className = '',
}) => {
  return <MathMarkdownRenderer content={children} className={className} />;
};

interface JeeSolutionProps {
  solution: string;
  className?: string;
}

export const JeeSolution: React.FC<JeeSolutionProps> = ({ 
  solution, 
  className = '' 
}) => {
  return <MathMarkdownRenderer content={solution} className={className} isSolution={true} />;
};

export const JeeQuestion: React.FC<{ 
  question: string; 
  className?: string;
}> = ({ question, className = '' }) => {
  return <MathMarkdownRenderer content={question} className={className} />;
};

export const JeeOption: React.FC<{ 
  option: string; 
  className?: string;
}> = ({ option, className = '' }) => {
  return <MathMarkdownRenderer content={option} className={className} />;
};

export default {
  formatJeeMath,
  formatJeeSolution,
  JeeMathText,
  JeeSolution,
  JeeQuestion,
  JeeOption,
};
