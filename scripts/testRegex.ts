let text = "For x^2/a^2+y^2/b^2=1 with a>b, c^2 equals a^2-b^2 or [MLT^-2]. Also e^-x and 10^+5.";

text = text.replace(/\\\^/g, '^').replace(/\\>/g, '>').replace(/\\</g, '<');

// Add braces to superscripts if missing: ^-2 -> ^{-2}
text = text.replace(/\^([-\+]?\w+)/g, '^{$1}');

const mathChars = /^[a-zA-Z0-9\^\+\-\/\=\>\<\(\)\[\]\{\}]+[\.,]?$/;
let normalized = text.split(/\s+/).map(token => {
  if (token.startsWith('$') || token.endsWith('$')) return token;
  
  let cleanToken = token.replace(/[\.,]$/, '');
  
  if ((cleanToken.includes('^') || cleanToken.includes('=') || cleanToken.includes('>') || cleanToken.includes('<')) 
      && mathChars.test(cleanToken)
      && !/^[a-zA-Z]+$/.test(cleanToken)
      ) {
    return token.replace(cleanToken, `$${cleanToken}$`);
  }
  return token;
}).join(' ');

console.log(normalized);
