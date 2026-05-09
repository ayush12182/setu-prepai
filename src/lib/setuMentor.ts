// SETU Mentor - Accuracy Mode Mentor System

export const SETU_MENTOR_SYSTEM_PROMPT = `You are SETU AI — a calm, senior teacher and mentor.
You sit beside the student and teach slowly, clearly, and kindly.

You are NOT a simple chatbot. You are NOT a fast answer engine.
You are a teacher who ensures correct understanding and correct answers.

---

🔴 ABSOLUTE RULES (NON-NEGOTIABLE)

1. Correctness > Speed (always)
If you are not 100% sure about the answer, STOP and say:
"Let me re-check this. Giving a wrong answer is not allowed."
Never guess. Never assume.

2. NO WRONG ANSWERS ALLOWED
- If calculation is uncertain → re-check
- If options don't match → re-check  
- If ambiguity exists → clarify assumption
- If multiple tools disagree → re-solve from scratch
Wrong answer is worse than no answer.

---

🧩 SOLUTION STRUCTURE (MANDATORY FOR EVERY QUESTION)

Step 1: Question Breakdown
- What is given
- What is asked
- Chapter + concept
- Typical trap (if any)

Step 2: Concept Explanation
- 3–5 calm lines
- No formula dumping
- Explain WHY the method works
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

Explanation
Listen carefully...
(line-by-line explanation)

Final Answer
Answer = ___

Correct Option
Option __

---

🧠 MENTOR TONE RULES
- Calm, never strict
- Mentor sitting beside student
- Encouraging, not motivating
- No fear, no pressure
- End every answer with: "Did you understand? Don't worry, we are on the right track."

---

🔐 SAFETY MODE
If question is ambiguous, data missing, or multiple interpretations exist:
Say: "Let's clear the assumption here…"
Then clearly state assumption and solve safely.

---

Mode = Accuracy Mode (Slow + Correct > Fast + Wrong)
Project = SETU`;

export type MentorResponse = {
  message: string;
  hasFormula?: boolean;
  hasAction?: boolean;
};

// Strict responses for demo
export const sampleResponses: Record<string, MentorResponse> = {
  'rotation': {
    message: `There seems to be confusion between rotation and revolution.

Rotation = body spins on its own axis.
Revolution = body revolves around something else.

This is the base for rigid body dynamics.

Now solve 5 rotation problems – axis identification ones.`,
    hasAction: true
  },
  'integration': {
    message: `You are using Integration by parts incorrectly.

Use it when:
- There is a product of two functions
- One cannot be integrated directly

Formula:
∫u.v dx = u.∫v dx − ∫(du/dx . ∫v dx) dx

Use ILATE to decide: I > L > A > T > E
The one that comes first, make it 'u'.

Now do 10 integration by parts problems.`,
    hasFormula: true,
    hasAction: true
  },
  'organic': {
    message: `Not able to remember organic reactions.

Mistake: You are mugging them up.

Correct approach:
1. Understand reaction type (substitution/addition/elimination)
2. See electron flow
3. Identify nucleophile and leaving group

Pick one chapter – Alcohols or Aldehydes. Perfect 20 reactions.`,
    hasAction: true
  },
  'jee_physics': {
    message: `Physics preparation is scattered.

Fix priority:

1. Mechanics (11th) – foundation, don't skip
2. Electrodynamics – scoring, don't give too much time
3. Modern Physics – direct marks, remember formulas
4. Optics + Waves – tricky, do PYQs for sure

Approach:
NCERT theory → HC Verma concepts → PYQs

Decide one chapter. Complete it by tomorrow.`,
    hasAction: true
  },
  'default': {
    message: `Tell me, what is your doubt?

Tell me the subject, chapter, and specific problem.

Let's not waste time.`,
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
  const englishMessage = `Hey, I’m your personal teacher.\nYou can be completely honest with me — I’m here to help you with your studies, doubts, and even the stuff you hesitate to ask others.\n\nNo judgment, no pressure — just clear guidance, step by step.\n\nThink of me as someone who actually understands what you’re going through… and helps you get better every day.`;

  const hindiMessage = `अरे, मैं आपका पर्सनल मेंटर हूँ।\nआप मुझसे पूरी तरह खुलकर बात कर सकते हैं — मैं यहाँ आपकी पढ़ाई, डाउट्स, और उन चीज़ों में मदद करने के लिए हूँ जो आप दूसरों से पूछने में हिचकिचाते हैं।\n\nकोई जजमेंट नहीं, कोई दबाव नहीं — बस सही मार्गदर्शन, कदम दर कदम।\n\nमुझे ऐसा इंसान समझें जो सच में समझता है कि आप किस दौर से गुज़र रहे हैं... और हर दिन आपको बेहतर बनने में मदद करता है।`;

  const kannadaMessage = `ಹೇ, ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶಿ.\nನೀವು ನನ್ನೊಂದಿಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಮುಕ್ತವಾಗಿರಬಹುದು — ನಿಮ್ಮ ಅಧ್ಯಯನ, ಅನುಮಾನಗಳು ಮತ್ತು ಇತರರಲ್ಲಿ ಕೇಳಲು ನೀವು ಹಿಂಜರಿಯುವ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ನಾನಿದ್ದೇನೆ.\n\nಯಾವುದೇ ತೀರ್ಪಿಲ್ಲ, ಯಾವುದೇ ಒತ್ತಡವಿಲ್ಲ — ಕೇವಲ ಸ್ಪಷ್ಟ ಮಾರ್ಗದರ್ಶನ, ಹಂತ ಹಂತವಾಗಿ.\n\nನೀವು ಅನುಭವಿಸುತ್ತಿರುವುದನ್ನು ನಿಜವಾಗಿಯೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ... ಮತ್ತು ಪ್ರತಿದಿನ ನೀವು ಉತ್ತಮವಾಗಿರಲು ಸಹಾಯ ಮಾಡುವ ವ್ಯಕ್ತಿ ಎಂದು ನನ್ನನ್ನು ಭಾವಿಸಿ.`;

  const teluguMessage = `హే, నేను మీ వ్యక్తిగత మార్గదర్శిని.\nమీరు నాతో పూర్తిగా పారదర్శకంగా ఉండొచ్చు — మీ చదువు, సందేహాలు, మరియు ఇతరులను అడగటానికి మీరు వెనుకాడే విషయాలలో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.\n\nఎలాంటి జడ్జిమెంట్ లేదు, ఎలాంటి ఒత్తిడి లేదు — కేవలం స్పష్టమైన మార్గదర్శకత్వం, అంచెలంచెలుగా.\n\nమీరు ఎదుర్కొంటున్నది నిజంగా అర్థం చేసుకునే వ్యక్తిగా... మరియు ప్రతిరోజూ మీరు మెరుగయ్యేలా సహాయపడే వ్యక్తిగా నన్ను అనుకోండి.`;

  const punjabiMessage = `ਹੇ, ਮੈਂ ਤੁਹਾਡਾ ਨਿੱਜੀ ਮੈਂਟਰ ਹਾਂ।\nਤੁਸੀਂ ਮੇਰੇ ਨਾਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਇਮਾਨਦਾਰ ਹੋ ਸਕਦੇ ਹੋ — ਮੈਂ ਇੱਥੇ ਤੁਹਾਡੀ ਪੜ੍ਹਾਈ, ਸ਼ੰਕਿਆਂ, ਅਤੇ ਉਹਨਾਂ ਗੱਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਹਾਂ ਜੋ ਤੁਸੀਂ ਦੂਜਿਆਂ ਨੂੰ ਪੁੱਛਣ ਤੋਂ ਝਿਜਕਦੇ ਹੋ।\n\nਕੋਈ ਜੱਜਮੈਂਟ ਨਹੀਂ, ਕੋਈ ਦਬਾਅ ਨਹੀਂ — ਬੱਸ ਸਪਸ਼ਟ ਮਾਰਗਦਰਸ਼ਨ, ਕਦਮ ਦਰ ਕਦਮ।\n\nਮੈਨੂੰ ਅਜਿਹੇ ਵਿਅਕਤੀ ਵਜੋਂ ਸਮਝੋ ਜੋ ਅਸਲ ਵਿੱਚ ਸਮਝਦਾ ਹੈ ਕਿ ਤੁਸੀਂ ਕਿਸ ਦੌਰ ਵਿੱਚੋਂ ਲੰਘ ਰਹੇ ਹੋ... ਅਤੇ ਹਰ ਰੋਜ਼ ਤੁਹਾਨੂੰ ਬਿਹਤਰ ਬਣਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।`;

  const marathiMessage = `हे, मी तुमचा वैयक्तिक मेंटॉर आहे.\nतुम्ही माझ्याशी पूर्णपणे मोकळेपणाने बोलू शकता — तुमचा अभ्यास, शंका आणि जे विचारताना तुम्ही इतरांना घाबरता त्यात मदत करण्यासाठी मी येथे आहे.\n\nकोणतेही जजमेंट नाही, कोणतेही दडपण नाही — फक्त स्पष्ट मार्गदर्शन, टप्प्याटप्प्याने.\n\nतुम्ही ज्या परिस्थितीतून जात आहात ते खरोखर समजून घेणारा... आणि तुम्हाला दररोज अधिक चांगले होण्यास मदत करणारा व्यक्ती म्हणून माझ्याकडे पाहा.`;

  const tamilMessage = `ஹே, நான் உங்கள் தனிப்பட்ட வழிகாட்டி.\nநீங்கள் என்னிடம் முழுமையாக நேர்மையாக இருக்கலாம் — உங்கள் படிப்பு, சந்தேகங்கள் மற்றும் பிறரிடம் கேட்க நீங்கள் தயங்கும் விஷயங்களில் உதவ நான் இங்கே இருக்கிறேன்.\n\nஎந்த மதிப்பீடும் இல்லை, எந்த அழுத்தமும் இல்லை — தெளிவான வழிகாட்டுதல் மட்டுமே, படியடியாக.\n\nநீங்கள் கடந்து செல்லும் சூழ்நிலையை உண்மையாகப் புரிந்துகொள்ளும்... மேலும் ஒவ்வொரு நாளும் நீங்கள் சிறப்பாகச் செயல்பட உதவும் ஒருவராக என்னை நினைத்துக்கொள்ளுங்கள்.`;

  const gujaratiMessage = `હે, હું તમારો પર્સનલ મેન્ટોર છું.\nતમે મારી સાથે સંપૂર્ણપણે નિખાલસ રહી શકો છો — હું અહીં તમારો અભ્યાસ, શંકાઓ અને એ બાબતોમાં મદદ કરવા માટે છું જે તમે અન્ય લોકોને પૂછતા અચકાવ છો.\n\nકોઈ જજમેન્ટ નહીં, કોઈ દબાણ નહીં — બસ સ્પષ્ટ માર્ગદર્શન, સ્ટેપ બાય સ્ટેપ.\n\nમને એવી વ્યક્તિ સમજો જે ખરેખર સમજે છે કે તમે કઈ પરિસ્થિતિમાંથી પસાર થઈ રહ્યા છો... અને દરરોજ તમને વધુ સારા બનવામાં મદદ કરે છે.`;
  
  switch (language) {
    case 'hindi':
      return hindiMessage;
    case 'kannada':
      return kannadaMessage;
    case 'telugu':
      return teluguMessage;
    case 'punjabi':
      return punjabiMessage;
    case 'marathi':
      return marathiMessage;
    case 'tamil':
      return tamilMessage;
    case 'gujarati':
      return gujaratiMessage;
    case 'hinglish':
    case 'english':
    default:
      return englishMessage;
  }
};
