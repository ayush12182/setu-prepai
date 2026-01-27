import React from 'react';

// Map of text representations to proper symbols
const symbolMap: Record<string, string> = {
  // Greek letters
  'alpha': 'α',
  'beta': 'β',
  'gamma': 'γ',
  'delta': 'δ',
  'epsilon': 'ε',
  'epsilon0': 'ε₀',
  'theta': 'θ',
  'lambda': 'λ',
  'mu': 'μ',
  'mu(s)': 'μₛ',
  'mu(k)': 'μₖ',
  'nu': 'ν',
  'pi': 'π',
  'rho': 'ρ',
  'sigma': 'σ',
  'tau': 'τ',
  'phi': 'φ',
  'omega': 'ω',
  'Omega': 'Ω',
  
  // Operations
  'times': '×',
  'divided by': '÷',
  'plus/minus': '±',
  'minus/plus': '∓',
  'proportional to': '∝',
  'integral of': '∫',
  'sum of': 'Σ',
  'dot': '·',
  'infinity': '∞',
  'approximately': '≈',
  'greater than': '>',
  'less than': '<',
  'greater than or equal': '≥',
  'less than or equal': '≤',
  'not equal': '≠',
  
  // Common terms
  'half': '½',
  'root': '√',
  'negative': '−',
  'degree': '°',
  'degrees': '°',
};

// Subscript mappings
const subscriptMap: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'n': 'ₙ', 'm': 'ₘ', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ',
  'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ', 'p': 'ₚ',
  's': 'ₛ', 't': 'ₜ', 'i': 'ᵢ', 'j': 'ⱼ', 'r': 'ᵣ',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'rms': 'ᵣₘₛ', 'max': 'ₘₐₓ', 'min': 'ₘᵢₙ',
};

// Superscript mappings
const superscriptMap: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  'n': 'ⁿ', 'i': 'ⁱ', '+': '⁺', '-': '⁻', '=': '⁼',
  '(': '⁽', ')': '⁾',
};

export function renderFormula(formula: string): string {
  let result = formula;
  
  // Handle special patterns first
  
  // Handle "squared" - convert to superscript 2
  result = result.replace(/(\w+)\s+squared/gi, (_, base) => `${base}²`);
  
  // Handle "cubed" - convert to superscript 3  
  result = result.replace(/(\w+)\s+cubed/gi, (_, base) => `${base}³`);
  
  // Handle "power n" patterns like "power(-11)" or "power 2"
  result = result.replace(/power\(([^)]+)\)/gi, (_, exp) => {
    return exp.split('').map((c: string) => superscriptMap[c] || c).join('');
  });
  result = result.replace(/power\s+(\S+)/gi, (_, exp) => {
    return exp.split('').map((c: string) => superscriptMap[c] || c).join('');
  });
  
  // Handle parenthetical subscripts like "(n)" for subscript
  result = result.replace(/([A-Za-z])\(([a-z0-9]+)\)/g, (_, base, sub) => {
    if (sub === 'n' || sub === 'm' || /^\d+$/.test(sub)) {
      const subscript = sub.split('').map((c: string) => subscriptMap[c] || c).join('');
      return `${base}${subscript}`;
    }
    return `${base}(${sub})`;
  });
  
  // Handle common variable subscripts like v1, v2, R1, R2, q1, q2
  result = result.replace(/([A-Za-z])([0-9])/g, (_, letter, num) => {
    return `${letter}${subscriptMap[num] || num}`;
  });
  
  // Handle special subscript terms
  result = result.replace(/v\s+rms/gi, 'v_rms').replace(/v_rms/g, 'vᵣₘₛ');
  result = result.replace(/KE\s+max/gi, 'KEₘₐₓ');
  result = result.replace(/f\s+static\s+max/gi, 'fₛₜₐₜᵢ꜀ₘₐₓ');
  result = result.replace(/f\s+kinetic/gi, 'fₖᵢₙₑₜᵢ꜀');
  result = result.replace(/a\s+centripetal/gi, 'a꜀ₑₙₜᵣᵢₚₑₜₐₗ');
  
  // Handle T half (half-life)
  result = result.replace(/t\s+half/gi, 't₁/₂');
  result = result.replace(/T\s+half/gi, 'T₁/₂');
  
  // Handle energy levels E(n)
  result = result.replace(/E\(n\)/g, 'Eₙ');
  result = result.replace(/r\(n\)/g, 'rₙ');
  
  // Handle T cold / T hot
  result = result.replace(/T\s+cold/gi, 'T_cold').replace(/T_cold/g, 'Tᶜᵒˡᵈ');
  result = result.replace(/T\s+hot/gi, 'T_hot').replace(/T_hot/g, 'Tʰᵒᵗ');
  
  // Handle special combined terms
  result = result.replace(/Cp/g, 'Cₚ');
  result = result.replace(/Cv/g, 'Cᵥ');
  result = result.replace(/N0/g, 'N₀');
  result = result.replace(/A0/g, 'A₀');
  result = result.replace(/q0/g, 'q₀');
  result = result.replace(/v0/g, 'v₀');
  result = result.replace(/u0/g, 'u₀');
  
  // Replace text symbols with mathematical symbols
  // Sort by length (longest first) to avoid partial replacements
  const sortedSymbols = Object.entries(symbolMap).sort((a, b) => b[0].length - a[0].length);
  
  for (const [text, symbol] of sortedSymbols) {
    // Use word boundaries for most replacements
    const regex = new RegExp(`\\b${text.replace(/[()]/g, '\\$&')}\\b`, 'gi');
    result = result.replace(regex, symbol);
  }
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

// React component version for more complex rendering
export const FormulaText: React.FC<{ formula: string; className?: string }> = ({ formula, className }) => {
  const rendered = renderFormula(formula);
  return <span className={className}>{rendered}</span>;
};
