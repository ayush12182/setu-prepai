import React from 'react';

/**
 * JEE Clean-Syntax Math Renderer
 * Renders mathematical expressions in exam-style notation
 * Supports subscripts, superscripts, fractions, vectors, and chemical equations
 */

// Subscript character mappings
const subscriptMap: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
};

// Superscript character mappings
const superscriptMap: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ',
};

// Greek letter mappings
const greekMap: Record<string, string> = {
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
  'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
  'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
  'nu': 'ν', 'xi': 'ξ', 'pi': 'π', 'rho': 'ρ',
  'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ', 'phi': 'φ',
  'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
  'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ',
  'Theta': 'Θ', 'Lambda': 'Λ', 'Pi': 'Π', 'Sigma': 'Σ',
  'Phi': 'Φ', 'Psi': 'Ψ', 'Omega': 'Ω',
};

// Mathematical symbols
const mathSymbols: Record<string, string> = {
  '->': '→', '<-': '←', '<->': '↔', '=>': '⇒',
  '>=': '≥', '<=': '≤', '!=': '≠', '~=': '≈',
  'inf': '∞', 'sqrt': '√', 'cbrt': '∛',
  '+-': '±', '-+': '∓', '...': '⋯',
  'times': '×', 'cdot': '·', 'div': '÷',
  'int': '∫', 'sum': 'Σ', 'prod': 'Π',
  'partial': '∂', 'nabla': '∇', 'degree': '°',
  'perp': '⊥', 'parallel': '∥', 'angle': '∠',
  'proportional': '∝', 'element': '∈', 'notin': '∉',
};

/**
 * Convert text to subscript
 */
function toSubscript(text: string): string {
  return text.split('').map(c => subscriptMap[c] || c).join('');
}

/**
 * Convert text to superscript
 */
function toSuperscript(text: string): string {
  return text.split('').map(c => superscriptMap[c] || c).join('');
}

/**
 * Format mathematical text with JEE clean-syntax
 */
export function formatJeeMath(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // Handle explicit subscript notation: _subscript or _{subscript}
  result = result.replace(/_{([^}]+)}/g, (_, sub) => toSubscript(sub));
  result = result.replace(/_([a-zA-Z0-9])/g, (_, char) => toSubscript(char));
  
  // Handle explicit superscript notation: ^superscript or ^{superscript}
  result = result.replace(/\^{([^}]+)}/g, (_, sup) => toSuperscript(sup));
  result = result.replace(/\^([a-zA-Z0-9+-])/g, (_, char) => toSuperscript(char));
  
  // Handle common patterns
  
  // Fractions: (a)/(b) or a/b in context
  result = result.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '($1)/($2)');
  
  // Vector notation: vec{A} -> A with arrow, or \vec A
  result = result.replace(/\vec\{?([A-Za-z])\}?/g, '$1⃗');
  result = result.replace(/→([A-Za-z])/g, '$1⃗');
  
  // Hat notation for unit vectors: i-hat, j-hat, k-hat
  result = result.replace(/([ijk])-hat/g, '$1̂');
  result = result.replace(/\hat\{?([A-Za-z])\}?/g, '$1̂');
  
  // Cross product notation
  result = result.replace(/\s*×\s*/g, ' × ');
  result = result.replace(/\s*cross\s*/gi, ' × ');
  
  // Dot product notation
  result = result.replace(/\s*·\s*/g, ' · ');
  result = result.replace(/\s*dot\s*/gi, ' · ');
  
  // Common variable subscripts: v1, v2, R1, R2, P1, P2, etc.
  result = result.replace(/([A-Za-z])_?([0-9]+)/g, (match, letter, nums) => {
    // Check if already has subscript
    if (match.includes('_')) return letter + toSubscript(nums);
    // For patterns like v1, v2 (single letter followed by number)
    return letter + toSubscript(nums);
  });
  
  // Specific physics patterns
  result = result.replace(/v_?rms/gi, 'v_rms').replace(/v_rms/g, 'vᵣₘₛ');
  result = result.replace(/\bKE_?max\b/gi, 'KEₘₐₓ');
  result = result.replace(/\bv_?max\b/gi, 'vₘₐₓ');
  result = result.replace(/\bv_?min\b/gi, 'vₘᵢₙ');
  result = result.replace(/\bE_?0\b/g, 'E₀');
  result = result.replace(/\bB_?0\b/g, 'B₀');
  result = result.replace(/\bv_?0\b/g, 'v₀');
  result = result.replace(/\bu_?0\b/g, 'u₀');
  result = result.replace(/\ba_?0\b/g, 'a₀');
  result = result.replace(/\bN_?0\b/g, 'N₀');
  result = result.replace(/\bA_?0\b/g, 'A₀');
  result = result.replace(/\bR_?0\b/g, 'R₀');
  result = result.replace(/\br_?n\b/g, 'rₙ');
  result = result.replace(/\bE_?n\b/g, 'Eₙ');
  result = result.replace(/\bT_1\/2\b/gi, 'T₁/₂');
  result = result.replace(/\bt_half\b/gi, 't₁/₂');
  result = result.replace(/\bepsilon_?0\b/gi, 'ε₀');
  result = result.replace(/\bmu_?0\b/gi, 'μ₀');
  result = result.replace(/\bC_p\b/g, 'Cₚ');
  result = result.replace(/\bC_v\b/g, 'Cᵥ');
  
  // Greek letters
  const sortedGreek = Object.entries(greekMap).sort((a, b) => b[0].length - a[0].length);
  for (const [name, symbol] of sortedGreek) {
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    result = result.replace(regex, symbol);
  }
  
  // Math symbols
  for (const [text, symbol] of Object.entries(mathSymbols)) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    result = result.replace(regex, symbol);
  }
  
  // Chemical equations: -> becomes →
  result = result.replace(/\s*->\s*/g, ' → ');
  result = result.replace(/\s*<->\s*/g, ' ⇌ ');
  
  // Implies arrow
  result = result.replace(/⇒/g, '⇒');
  
  // Determinant bars | ... |
  // Keep as is for display
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Format a complete JEE solution with proper line structure
 */
export function formatJeeSolution(solution: string): string {
  if (!solution) return '';
  
  // Split by lines and process each
  const lines = solution.split('\n');
  const formattedLines = lines.map(line => {
    // Don't process explanatory text lines (starts with normal text)
    if (/^[A-Z][a-z]/.test(line.trim()) && !line.includes('=') && !line.includes('→')) {
      return line;
    }
    return formatJeeMath(line);
  });
  
  return formattedLines.join('\n');
}

/**
 * React component for rendering JEE-style math
 */
interface JeeMathTextProps {
  children: string;
  className?: string;
  block?: boolean;
}

export const JeeMathText: React.FC<JeeMathTextProps> = ({ 
  children, 
  className = '',
  block = false 
}) => {
  const formatted = formatJeeMath(children);
  
  if (block) {
    return (
      <div className={`font-mono whitespace-pre-wrap ${className}`}>
        {formatted}
      </div>
    );
  }
  
  return (
    <span className={`font-mono ${className}`}>
      {formatted}
    </span>
  );
};

/**
 * React component for rendering JEE-style solutions
 */
interface JeeSolutionProps {
  solution: string;
  className?: string;
}

export const JeeSolution: React.FC<JeeSolutionProps> = ({ 
  solution, 
  className = '' 
}) => {
  const formatted = formatJeeSolution(solution);
  
  return (
    <div className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${className}`}>
      {formatted.split('\n').map((line, idx) => (
        <div key={idx} className={line.trim() === '' ? 'h-2' : ''}>
          {line}
        </div>
      ))}
    </div>
  );
};

/**
 * Format question text with JEE notation
 */
export const JeeQuestion: React.FC<{ 
  question: string; 
  className?: string;
}> = ({ question, className = '' }) => {
  const formatted = formatJeeMath(question);
  
  return (
    <div className={`leading-relaxed ${className}`}>
      {formatted}
    </div>
  );
};

/**
 * Format option text with JEE notation
 */
export const JeeOption: React.FC<{ 
  option: string; 
  className?: string;
}> = ({ option, className = '' }) => {
  const formatted = formatJeeMath(option);
  
  return (
    <span className={className}>
      {formatted}
    </span>
  );
};

export default {
  formatJeeMath,
  formatJeeSolution,
  JeeMathText,
  JeeSolution,
  JeeQuestion,
  JeeOption,
};
