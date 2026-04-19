/**
 * closingFeedback.ts
 *
 * Generates a short, teacher-like closing message at the end of each
 * AI Teacher explanation, based on live engagement signals.
 *
 * Rules:
 *  - distractedPercent > 30%  → gentle distraction message
 *  - engagementScore  > 70    → positive reinforcement
 *  - otherwise               → neutral closing
 *
 * Language-consistent, non-judgmental, short (1–2 lines max).
 */

import { LanguageMode } from '@/contexts/LanguageContext';

// ── One random pick helper
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// ────────────────────────────────────────────────────────────
//  DISTRACTED messages — gentle, not blaming
// ────────────────────────────────────────────────────────────
const DISTRACTED: Record<LanguageMode, string[]> = {
  english: [
    "I noticed you were a bit distracted — that's totally fine! If anything wasn't clear, just ask me and I'll explain it again simply. 😊",
    "Looks like something caught your attention. No worries — we can go over any part again. Just say the word!",
  ],
  hinglish: [
    "Main notice kar raha tha ki aap thode distracted lag rahe the — bilkul theek hai! Agar kuch samajh na aaya ho toh batao, main dobara simple way mein explain kar deta hoon. 😊",
    "Lagta hai dhyan thoda hat gaya — koi baat nahi! Jo part samajh na aaya ho, seedha pooch lo.",
  ],
  hindi: [
    "मैंने देखा कि आप थोड़ा विचलित लग रहे थे — बिल्कुल ठीक है! अगर कुछ समझ न आया हो तो मुझे बताएं, मैं इसे फिर से आसान भाषा में समझाऊंगा। 😊",
    "कोई बात नहीं अगर ध्यान थोड़ा हट गया — जो भी हिस्सा समझ न आया हो, सीधे पूछ लो।",
  ],
  kannada: [
    "ನೀವು ಸ್ವಲ್ಪ ವಿಚಲಿತರಾಗಿದ್ದಂತೆ ಕಂಡಿತು — ಅದು ಸರಿ! ಏನಾದರೂ ಅರ್ಥವಾಗದಿದ್ದರೆ ಕೇಳಿ, ನಾನು ಮತ್ತೆ ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ. 😊",
  ],
  telugu: [
    "మీరు కొంచెం పరధ్యానంగా ఉన్నట్లు అనిపించింది — ఫర్వాలేదు! ఏదైనా అర్థం కాకపోతే చెప్పండి, మళ్ళీ సులభంగా వివరిస్తాను. 😊",
  ],
  punjabi: [
    "ਮੈਂ ਦੇਖਿਆ ਕਿ ਤੁਸੀਂ ਥੋੜੇ ਵਿਚਲਿਤ ਲੱਗ ਰਹੇ ਸੀ — ਕੋਈ ਗੱਲ ਨਹੀਂ! ਜੇ ਕੁਝ ਸਮਝ ਨਹੀਂ ਆਇਆ, ਦੱਸੋ, ਮੈਂ ਦੁਬਾਰਾ ਸਮਝਾਵਾਂਗਾ। 😊",
  ],
  marathi: [
    "मला वाटलं तुमचं थोडं लक्ष विचलित झालं — काही हरकत नाही! काही समजलं नसेल तर सांगा, मी परत सोप्या भाषेत समजावतो. 😊",
  ],
  tamil: [
    "நீங்கள் கொஞ்சம் கவனம் சிதறியதாக தெரிந்தது — பரவாயில்லை! ஏதாவது புரியவில்லை என்றால் கேளுங்கள், மீண்டும் எளிமையாக விளக்குகிறேன். 😊",
  ],
  gujarati: [
    "મેં જોયું કે તમે થોડા વિચલિત લાગ્યા — કોઈ વાંધો નહીં! જો કંઈ સમજ ન આવ્યું હોય તો કહો, હું ફરી સરળ રીતે સમજાવીશ. 😊",
  ],
};

// ────────────────────────────────────────────────────────────
//  HIGH ENGAGEMENT messages — positive reinforcement
// ────────────────────────────────────────────────────────────
const HIGH_ENGAGEMENT: Record<LanguageMode, string[]> = {
  english: [
    "Great focus today — keep it up! 🌟 If any part needs a deeper dive, just ask.",
    "Really solid attention throughout — that kind of focus is what separates toppers. Keep going! 🔥",
  ],
  hinglish: [
    "Achha focus tha aapka — isi tarah continue rakho! 🌟 Kisi part mein doubt ho toh bata dena.",
    "Ekdum solid attention — yahi woh focus hai jo toppers ko alag banaata hai. Keep it up! 🔥",
  ],
  hindi: [
    "आज का ध्यान बहुत अच्छा था — ऐसे ही जारी रखो! 🌟 कोई भाग और गहराई से समझना हो तो पूछ लो।",
    "शानदार एकाग्रता — यही वह focus है जो Toppers को अलग बनाता है। बढ़ते रहो! 🔥",
  ],
  kannada: [
    "ತುಂಬಾ ಚೆನ್ನಾಗಿ ಗಮನ ಕೊಟ್ಟಿರಿ — ಹೀಗೆಯೇ ಮುಂದುವರಿಯಿರಿ! 🌟 ಏನಾದರೂ ಸಂದೇಹ ಇದ್ದರೆ ಕೇಳಿ.",
  ],
  telugu: [
    "చాలా మంచి దృష్టి — ఇలాగే కొనసాగించండి! 🌟 ఏదైనా సందేహం ఉంటే అడగండి.",
  ],
  punjabi: [
    "ਬਹੁਤ ਵਧੀਆ ਧਿਆਨ ਦਿੱਤਾ — ਇਸੇ ਤਰ੍ਹਾਂ ਜਾਰੀ ਰੱਖੋ! 🌟 ਕੋਈ ਸ਼ੱਕ ਹੋਵੇ ਤਾਂ ਦੱਸੋ।",
  ],
  marathi: [
    "खूप छान लक्ष दिलंत — असंच चालू ठेवा! 🌟 काही शंका असेल तर विचारा.",
  ],
  tamil: [
    "மிகவும் நல்ல கவனம் — இப்படியே தொடருங்கள்! 🌟 ஏதாவது சந்தேகம் இருந்தால் கேளுங்கள்.",
  ],
  gujarati: [
    "ખૂબ સારું ધ્યાન — આ જ રીતે આગળ વધો! 🌟 કોઈ શંકા હોય તો પૂછો.",
  ],
};

// ────────────────────────────────────────────────────────────
//  NEUTRAL messages — simple, warm closing
// ────────────────────────────────────────────────────────────
const NEUTRAL: Record<LanguageMode, string[]> = {
  english: [
    "That covers it for now! Let me know if you'd like to explore another topic or have a doubt. 📚",
    "Hope that was helpful! Feel free to ask anything else anytime.",
  ],
  hinglish: [
    "Bas itna hi abhi ke liye! Koi aur topic ya doubt ho toh pooch lo. 📚",
    "Helpful raha umeed hai! Aur kuch bhi poochna ho kabhi bhi.",
  ],
  hindi: [
    "अभी के लिए बस इतना! कोई और विषय या प्रश्न हो तो पूछ लो। 📚",
    "उम्मीद है यह मददगार रहा! कभी भी कोई भी सवाल पूछ सकते हो।",
  ],
  kannada: [
    "ಇಷ್ಟು ಸಾಕು ಈಗ! ಬೇರೆ ವಿಷಯ ಅಥವಾ ಸಂದೇಹ ಇದ್ದರೆ ಕೇಳಿ. 📚",
  ],
  telugu: [
    "ఇప్పటికి ఇంతే! ఇంకేమైనా అడగాలంటే అడగండి. 📚",
  ],
  punjabi: [
    "ਹੁਣ ਲਈ ਇੱਥੋਂ ਤੱਕ! ਕੋਈ ਹੋਰ ਸਵਾਲ ਹੋਵੇ ਤਾਂ ਪੁੱਛੋ। 📚",
  ],
  marathi: [
    "आत्तासाठी एवढंच! दुसरा विषय किंवा शंका असेल तर विचारा. 📚",
  ],
  tamil: [
    "இப்போது இது போதும்! வேறு ஏதாவது கேட்கணும்னா கேளுங்கள். 📚",
  ],
  gujarati: [
    "હમણાં માટે આટલું! બીજું કંઈ પૂછવું હોય તો પૂછો. 📚",
  ],
};

// ────────────────────────────────────────────────────────────
//  Public API
// ────────────────────────────────────────────────────────────

export interface EngagementSignals {
  engagementScore: number;   // 0–100
  distractedPercent: number; // 0–100
}

/**
 * Returns a short closing message string, or null if not enough session
 * data is available (e.g. engagement tracking was disabled).
 */
export function getClosingFeedback(
  signals: EngagementSignals | null,
  language: LanguageMode,
): string | null {
  // If tracking was off or session was too short, return null (no message)
  if (!signals) return null;

  const { engagementScore, distractedPercent } = signals;

  // Distraction threshold: >30% of session time distracted
  if (distractedPercent > 30) {
    const pool = DISTRACTED[language] ?? DISTRACTED.english;
    return pick(pool);
  }

  // High engagement threshold
  if (engagementScore >= 70) {
    const pool = HIGH_ENGAGEMENT[language] ?? HIGH_ENGAGEMENT.english;
    return pick(pool);
  }

  // Neutral
  const pool = NEUTRAL[language] ?? NEUTRAL.english;
  return pick(pool);
}
