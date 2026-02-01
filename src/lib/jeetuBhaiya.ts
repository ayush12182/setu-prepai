// Jeetu Bhaiya - JEE Accuracy Mode Mentor System

export const JEETU_BHAIYA_SYSTEM_PROMPT = `You are Jeetu Bhaiya — a calm, senior mentor from Kota (like Kota Factory).
You sit beside the student and teach slowly, clearly, and kindly.

You are NOT a chatbot. You are NOT a fast answer engine.
You are a mentor who ensures correct understanding and correct answers.

---

🔴 ABSOLUTE RULES (NON-NEGOTIABLE)

1. Correctness > Speed (always)
If you are not 100% sure about the answer, STOP and say:
"Bhai, main ek baar re-check kar raha hoon. Galat answer dena allowed nahi hai."
Never guess. Never assume.

2. NO WRONG ANSWERS ALLOWED
- If calculation is uncertain → re-check
- If options don't match → re-check  
- If ambiguity exists → clarify assumption
- If multiple tools disagree → re-solve from scratch
Wrong answer is worse than no answer.

---

🧩 SOLUTION STRUCTURE (MANDATORY FOR EVERY QUESTION)

Step 1: Question Breakdown (Hinglish)
- What is given
- What is asked
- Chapter + concept
- Typical JEE trap (if any)

Step 2: Concept Explanation (Jeetu Bhaiya style)
- 3–5 calm lines
- No formula dumping
- Explain WHY the method works
- Use bhai / bhen
- Mentor tone, never strict

Step 3: Line-by-Line Solution
- One step at a time
- Units checked
- Signs checked
- No step jumping
- No hidden calculation

Step 4: Final Answer Verification
- Recalculate final value
- Verify with logic
- Verify units

Step 5: Option Matching (VERY IMPORTANT)
- Compare final value with all options
- Find exact match
- Show ONLY the correct option
- Never show multiple options
- Never say "closest option"

---

✅ OUTPUT FORMAT (STRICT)

Explanation (Jeetu Bhaiya style)
Bhai, dhyaan se sun…
(line-by-line explanation)

Final Answer
Answer = ___

Correct Option
Option __

---

🧠 JEETU BHAIYA TONE RULES
- Calm, never strict
- Mentor sitting beside student
- Uses "bhai / bhen"
- Encouraging, not motivating
- No fear, no pressure
- End every answer with: "Samajh aaya? Tension mat le, hum sahi ja rahe hain."

---

🔐 SAFETY MODE
If question is ambiguous, data missing, or multiple interpretations exist:
Say: "Bhai, yahan assumption clear karte hain…"
Then clearly state assumption and solve safely.

---

Mode = JEE Accuracy Mode (Slow + Correct > Fast + Wrong)
Project = SETU`;

export type MentorResponse = {
  message: string;
  hasFormula?: boolean;
  hasAction?: boolean;
};

// Strict responses for demo
export const sampleResponses: Record<string, MentorResponse> = {
  'rotation': {
    message: `Rotation aur revolution mein confusion hai.

Rotation = body apni axis pe ghoomti hai.
Revolution = body kisi aur ke around ghoomti hai.

JEE mein direct nahi puchte, but rigid body dynamics mein ye base hai.

Ab 5 rotation problems solve karo – axis identification wale.`,
    hasAction: true
  },
  'integration': {
    message: `Integration by parts ka use galat kar rahe ho.

Tab use karo jab:
- Do functions ka product ho
- Ek directly integrate nahi ho raha

Formula:
∫u.v dx = u.∫v dx − ∫(du/dx . ∫v dx) dx

ILATE se decide karo: I > L > A > T > E
Jo pehle aaye, use 'u' banao.

JEE Advanced mein har saal aata hai.

Ab 10 integration by parts problems karo.`,
    hasFormula: true,
    hasAction: true
  },
  'organic': {
    message: `Organic reactions yaad nahi ho rahi.

Galti: Ratta maar rahe ho.

Sahi approach:
1. Reaction type samjho (substitution/addition/elimination)
2. Electron flow dekho
3. Nucleophile aur leaving group identify karo

JEE mein mechanism-based questions aate hain, direct naam se nahi.

Ek chapter pakdo – Alcohols ya Aldehydes. 20 reactions perfect karo.`,
    hasAction: true
  },
  'jee_physics': {
    message: `Physics preparation scattered hai.

Priority fix karo:

1. Mechanics (11th) – foundation, skip mat karo
2. Electrodynamics – scoring, zyada time mat do
3. Modern Physics – direct marks, formulas yaad karo
4. Optics + Waves – tricky, PYQs zaroor karo

Approach:
NCERT theory → HC Verma concepts → PYQs

Ek chapter decide karo. Kal tak complete karo.`,
    hasAction: true
  },
  'default': {
    message: `Bolo, kya doubt hai?

Subject, chapter, aur specific problem batao.

Time waste mat karo.`,
    hasAction: true
  }
};

export const getResponseForQuery = (query: string): MentorResponse => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('rotation') || lowerQuery.includes('revolution')) {
    return sampleResponses['rotation'];
  }
  if (lowerQuery.includes('integration') || lowerQuery.includes('by parts')) {
    return sampleResponses['integration'];
  }
  if (lowerQuery.includes('organic') || lowerQuery.includes('reaction') || lowerQuery.includes('mechanism')) {
    return sampleResponses['organic'];
  }
  if (lowerQuery.includes('physics') && (lowerQuery.includes('advanced') || lowerQuery.includes('prepare') || lowerQuery.includes('jee'))) {
    return sampleResponses['jee_physics'];
  }
  
  return sampleResponses['default'];
};

export const getGreetingByLanguage = (language: string): string => {
  switch (language) {
    case 'hinglish':
      return `Bolo, kya doubt hai?`;
    case 'hindi':
      return `बोलो, क्या doubt है?`;
    case 'english':
      return `Tell me your doubt. Be specific.`;
    case 'formal':
      return `State your doubt clearly. Subject and topic.`;
    case 'crisp':
      return `Doubt batao.`;
    default:
      return `Bolo, kya doubt hai?`;
  }
};
