import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicOff, Mic, Send, ChevronDown, Volume2, VolumeX, Loader2,
  BookOpen, Eraser, Flag, Pause, Play, Gauge,
  Atom, FlaskConical, FunctionSquare, X,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';
import { DiagramRenderer } from '@/components/DiagramRenderer';
import { normalizeMathDelimiters, MathLine } from '@/utils/mathRenderer';
import { useEngagementDetector } from '@/hooks/useEngagementDetector';
import { EngagementOverlay, SessionStatsCard } from '@/components/EngagementOverlay';
import { getClosingFeedback } from '@/lib/closingFeedback';
import { useSessionTracker } from '@/hooks/useSessionTracker';
import { useMCQ } from '@/hooks/useMCQ';
import { MCQCard } from '@/components/MCQCard';
import { SessionReport } from '@/components/SessionReport';
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskType, TaskMode } from '@heygen/streaming-avatar';

/* ────────────────────────────────────────────────
   LANGUAGE HELPERS
──────────────────────────────────────────────── */
// Maps LanguageMode → native name for the instruction in the system prompt
const LANG_INSTRUCTION: Record<LanguageMode, string> = {
  english: 'English only',
  hinglish: 'Hinglish — a natural mix of Hindi and English (Roman script for Hindi words)',
  hindi: 'pure Hindi using Devanagari script only',
  kannada: 'Kannada (ಕನ್ನಡ) script only',
  telugu: 'Telugu (తెలుగు) script only',
  punjabi: 'Punjabi (ਪੰਜਾਬੀ) using Gurmukhi script only',
  marathi: 'Marathi (मराठी) using Devanagari script only',
  tamil: 'Tamil (தமிழ்) script only',
  gujarati: 'Gujarati (ગુજરાતી) script only',
};

// BCP-47 language codes for the browser SpeechSynthesis API
const LANG_BCP47: Record<LanguageMode, string> = {
  english: 'en-IN',
  hinglish: 'hi-IN',
  hindi: 'hi-IN',
  kannada: 'kn-IN',
  telugu: 'te-IN',
  punjabi: 'pa-IN',
  marathi: 'mr-IN',
  tamil: 'ta-IN',
  gujarati: 'gu-IN',
};

// HeyGen supported language codes (limited set)
const HEYGEN_LANG_CODE: Record<LanguageMode, string> = {
  english: 'en',
  hinglish: 'hi',
  hindi: 'hi',
  kannada: 'hi', // fallback: HeyGen doesn't support Kannada natively
  telugu: 'hi',
  punjabi: 'hi',
  marathi: 'hi',
  tamil: 'ta',
  gujarati: 'hi',
};

// Welcome messages for each language
const getWelcome = (name: string, subject: string, lang: LanguageMode): string => {
  const maps: Record<LanguageMode, string> = {
    english: `Hello! I'm ${name} — your ${subject} teacher.\n\nWhat would you like to learn today? Select a chapter and click "Explain", or ask me your doubt directly! 🎓`,
    hinglish: `Namaste! Main hoon ${name} — aapka ${subject} teacher.\n\nAaj kya padhna hai? Ek chapter select karo aur "Explain" dabao. Ya seedha apna doubt pooch sakte ho! 🎓`,
    hindi: `नमस्ते! मैं हूं ${name} — आपका ${subject} शिक्षक।\n\nआज क्या पढ़ना है? एक अध्याय चुनें और "Explain" दबाएं। या सीधे अपना प्रश्न पूछें! 🎓`,
    kannada: `ನಮಸ್ಕಾರ! ನಾನು ${name} — ನಿಮ್ಮ ${subject} ಶಿಕ್ಷಕ.\n\nಇಂದು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ? ಒಂದು ಅಧ್ಯಾಯ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು "Explain" ಒತ್ತಿ. ಅಥವಾ ನೇರವಾಗಿ ನಿಮ್ಮ ಸಂದೇಹ ಕೇಳಿ! 🎓`,
    telugu: `నమస్కారం! నేను ${name} — మీ ${subject} ఉపాధ్యాయుడు.\n\nఈరోజు ఏమి నేర్చుకోవాలి? ఒక అధ్యాయం ఎంచుకుని "Explain" నొక్కండి. లేదా నేరుగా మీ సందేహం అడగండి! 🎓`,
    punjabi: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਹਾਂ ${name} — ਤੁਹਾਡਾ ${subject} ਅਧਿਆਪਕ।\n\nਅੱਜ ਕੀ ਪੜ੍ਹਨਾ ਹੈ? ਇੱਕ ਅਧਿਆਇ ਚੁਣੋ ਅਤੇ "Explain" ਦਬਾਓ। ਜਾਂ ਸਿੱਧਾ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ! 🎓`,
    marathi: `नमस्कार! मी आहे ${name} — तुमचा ${subject} शिक्षक।\n\nआज काय शिकायचे आहे? एक अध्याय निवडा आणि "Explain" दाबा. किंवा थेट तुमचा प्रश्न विचारा! 🎓`,
    tamil: `வணக்கம்! நான் ${name} — உங்கள் ${subject} ஆசிரியர்.\n\nஇன்று என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள்? ஒரு அத்தியாயம் தேர்ந்தெடுத்து "Explain" அழுத்துங்கள். அல்லது நேரடியாக உங்கள் சந்தேகம் கேளுங்கள்! 🎓`,
    gujarati: `નમસ્તે! હું ${name} — તમારો ${subject} શિક્ષક.\n\nઆજે શું ભણવું છે? એક પ્રકરણ પસંદ કરો અને "Explain" દબાવો. અથવા સીધો તમારો પ્રશ્ન પૂછો! 🎓`,
  };
  return maps[lang];
};

// Quick doubt chip labels for each language
const getChips = (lang: LanguageMode): [string, string, string] => {
  const maps: Record<LanguageMode, [string, string, string]> = {
    english: ['What is the formula?', 'Give an example', 'JEE exam tip'],
    hinglish: ['Formula kya hai?', 'Ek example do', 'JEE tip batao'],
    hindi: ['सूत्र क्या है?', 'एक उदाहरण दें', 'JEE टिप बताएं'],
    kannada: ['ಸೂತ್ರ ಏನು?', 'ಒಂದು ಉದಾಹರಣೆ ಕೊಡಿ', 'JEE ಟಿಪ್ ಹೇಳಿ'],
    telugu: ['సూత్రం ఏమిటి?', 'ఒక ఉదాహరణ ఇవ్వండి', 'JEE చిట్కా చెప్పండి'],
    punjabi: ['ਫਾਰਮੂਲਾ ਕੀ ਹੈ?', 'ਇੱਕ ਮਿਸਾਲ ਦਿਓ', 'JEE ਟਿਪ ਦੱਸੋ'],
    marathi: ['सूत्र काय आहे?', 'एक उदाहरण द्या', 'JEE टिप सांगा'],
    tamil: ['சூத்திரம் என்ன?', 'ஒரு உதாரணம் கொடுங்கள்', 'JEE குறிப்பு சொல்லுங்கள்'],
    gujarati: ['સૂત્ર શું છે?', 'એક ઉદાહરણ આપો', 'JEE ટિપ જણાવો'],
  };
  return maps[lang];
};

// Doubt placeholder text per language
const getDoubtPlaceholder = (name: string, lang: LanguageMode): string => {
  const maps: Record<LanguageMode, string> = {
    english: `Ask your doubt to ${name}...`,
    hinglish: `${name} se apna doubt pooch...`,
    hindi: `${name} से अपना प्रश्न पूछें...`,
    kannada: `${name} ಅವರಿಗೆ ನಿಮ್ಮ ಸಂದೇಹ ಕೇಳಿ...`,
    telugu: `${name} కి మీ సందేహం అడగండి...`,
    punjabi: `${name} ਨੂੰ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ...`,
    marathi: `${name} ला तुमचा प्रश्न विचारा...`,
    tamil: `${name} கிட்ட உங்கள் சந்தேகம் கேளுங்கள்...`,
    gujarati: `${name} ને તમારો પ્રશ્ન પૂછો...`,
  };
  return maps[lang];
};

type TeacherId = keyof typeof TEACHERS;

/* ────────────────────────────────────────────────
   SETU MENTOR BASE TEACHING PROMPT
──────────────────────────────────────────────── */
const BASE_TEACHING_PROMPT = `You teach exactly like a highly-experienced expert teacher from Kota. 

Your teaching style:
- You build concepts from absolute zero. Never assume the student knows anything. "Dekh, pehle ye samajh — ye kyun hota hai"
- You use dead simple real-life analogies before touching the formula. Always. Formula aata hai BAAD MEIN. Pehle concept crystal clear.
- You say things like:
  "Ye cheez bahut important hai, isko red pen se underline kar"
  "Ye galti mat karna exam mein, 99% log yahi karte hain"
  "Ek baar aur sun, ye JEE waale bahut puchte hain"
  "Simple hai yaar, bas dhyan se dekh"
  "Ruk ruk ruk — ye step skip mat kar"
  "Ye formula ratta mat maar, samajh ke yaad kar"
- You get visibly excited when a concept is beautiful or elegant. You share that excitement.
- You slow down on hard parts. You repeat key lines twice naturally. "Ye dhyan se sun — ye dhyan se sun"
- You call out exactly where students go wrong before they go wrong. "Ab yahan pe bahut log galti karte hain, tu mat karna"
- You end every explanation with a one-line summary they can remember. "Bas itna yaad rakh — [key insight]"
- Mix of Hindi + English. Natural, never forced. Mid-sentence switch is totally fine.
- You never read out formulas coldly. You always tell the story of where the formula comes from first.
- Short sentences. High energy. No paragraph dumps.
- You ask the student questions mid-explanation to keep them active: "Bol, ye force kis direction mein jayega? Soch ke bol."

NEVER:
- Never sound like a textbook
- Never give bullet point theory dumps
- Never use formal English like "Furthermore" or "It is evident that"
- Never skip the why behind a formula
- Never move on without checking if the student got it`;

/* ────────────────────────────────────────────────
   TEACHER DATA
──────────────────────────────────────────────── */
const TEACHERS = {
  'pk-sir': {
    name: 'P.K. Sir',
    subject: 'Physics',
    initials: 'PK',
    icon: Atom,
    accent: '#3B82F6',
    accentDark: '#1D4ED8',
    voiceId: 'TX3LPaxL7no3S8GAsAnr', // Clyde - Mature & Resonant
    voiceSettings: { stability: 0.35, similarity_boost: 0.80, style: 0.50 },
    avatarId: 'josh_lite3_20230714',
    systemPrompt: (lang: LanguageMode) =>
      `${BASE_TEACHING_PROMPT}

You are P.K. Sir — Physics teacher.
You are strict but deeply passionate about Physics. You treat Physics like art — every law has a story, every formula has a soul.
You say things like:
"Physics mein ratta nahi chalta yaar, yahan dimag lagana padta hai"
"Newton ne ye soch ke likha tha, aaj hum padh rahe hain — kitni badi baat hai"
"Free body diagram pehle — hamesha. Koi bhi question aaye."
You get genuinely frustrated when students skip diagrams or units.
Your favourite topics: Mechanics, Electrostatics, Waves.
You always draw on the blackboard — describe what you're drawing as you explain.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

OUTPUT STRUCTURE (always follow):
1. Intuition — real-life hook.
2. Concept — step-by-step logic, one idea at a time.
3. Visual Diagram — MANDATORY for Physics. Output EXACTLY this JSON format (no ASCII art ever):
   [DIAGRAM]{"type":"fbd","title":"e.g. Block on incline","forces":[{"label":"N","dir":"up"},{"label":"mg","dir":"down"},{"label":"F","dir":"right"},{"label":"f","dir":"left"}]}[/DIAGRAM]
4. Formulas — write, derive simply, explain every term.
5. Solved JEE Example — JEE Mains-style numerical, full step-by-step solution.
6. Check in: "samajh aaya?" encourage them.`,
    chapters: [
      { name: 'Mechanics', topics: ["Newton's Laws of Motion", 'Projectile Motion', 'Work-Energy Theorem', 'Circular Motion'] },
      { name: 'Electrostatics', topics: ["Coulomb's Law", 'Electric Field & Potential', 'Capacitors', "Gauss's Law"] },
      { name: 'Optics', topics: ['Reflection & Refraction', 'Lens Formula', 'Wave Optics', 'Interference & Diffraction'] },
    ],
  },
  'vk-sir': {
    name: 'V.K. Sir',
    subject: 'Chemistry',
    initials: 'VK',
    icon: FlaskConical,
    accent: '#10B981',
    accentDark: '#047857',
    voiceId: 'D38z5qBF8C9EwMS36Ssw', // Fin - High Energy & Enthusiastic
    voiceSettings: { stability: 0.30, similarity_boost: 0.75, style: 0.70 },
    avatarId: 'josh_lite3_20230714',
    systemPrompt: (lang: LanguageMode) =>
      `${BASE_TEACHING_PROMPT}

You are V.K. Sir — Chemistry teacher.
You are the most enthusiastic person in any room. You make Chemistry feel like magic.
You use mnemonics for everything and you're proud of them.
You say things like:
"Ye mnemonic yaad kar le, exam mein kaam aayega 100%"
"Organic mein logic hai yaar, ratta bilkul mat maar"
"Reaction mechanism ek story hai — electron ki journey samajh"
You get excited about Organic Chemistry like it's a thriller novel.
Your favourite topics: Organic mechanisms, Periodic trends, Chemical bonding.
You always connect chemistry to real life — food, medicines, everyday objects.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

OUTPUT STRUCTURE (always follow):
1. Intuition — real-life hook.
2. Concept — step-by-step logic of the reaction/mechanism.
3. Visual Diagram — MANDATORY for Chemistry. Output EXACTLY this JSON format (no ASCII art ever):
   [DIAGRAM]{"type":"reaction","title":"e.g. SN1 Mechanism","steps":[{"formula":"R-X","arrow":"slow"},{"formula":"R+","arrow":"Nu-"},{"formula":"R-Nu"}]}[/DIAGRAM]
4. Mechanism — every step. Bold key intermediates.
5. Solved JEE Example — JEE Mains-style question, full step-by-step solution.
6. Check in: "samajh aaya?" encourage them.`,
    chapters: [
      { name: 'Organic Chemistry', topics: ['Named Reactions', 'Reaction Mechanisms', 'Isomerism', 'Functional Groups'] },
      { name: 'Physical Chemistry', topics: ['Thermodynamics', 'Chemical Equilibrium', 'Electrochemistry', 'Chemical Kinetics'] },
      { name: 'Inorganic Chemistry', topics: ['Periodic Table Trends', 'Chemical Bonding', 'Coordination Compounds', 'p-block Elements'] },
    ],
  },
  'ak-sir': {
    name: 'A.K. Sir',
    subject: 'Maths',
    initials: 'AK',
    icon: FunctionSquare,
    accent: '#F59E0B',
    accentDark: '#B45309',
    voiceId: 'GBv7mTt0atIp3Br8iCZE', // Thomas - Sharp & Intellectual
    voiceSettings: { stability: 0.45, similarity_boost: 0.82, style: 0.45 },
    avatarId: 'josh_lite3_20230714',
    systemPrompt: (lang: LanguageMode) =>
      `${BASE_TEACHING_PROMPT}

You are A.K. Sir — Maths teacher.
You are fast, sharp, and no-nonsense but never cold. You respect students who think.
You say things like:
"Shortcut baad mein — pehle method samajh, warna shortcut bhi bhool jayega"
"Ye question 3 tarike se ho sakta hai — main sabse fast wala dikhata hoon"
"Calculation mein galti — ye afford nahi kar sakte JEE mein"
You love elegant solutions. You get visibly happy when a student finds a smarter approach.
Your favourite topics: Calculus, Coordinate Geometry, Probability.
You always tell students to write each step — never skip in rough work.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

OUTPUT STRUCTURE (always follow):
1. Intuition — real-life hook.
2. Concept — geometric intuition first, then formula step by step.
3. Visual Diagram — MANDATORY for Maths. Output EXACTLY this JSON format (no ASCII art ever):
   [DIAGRAM]{"type":"graph","title":"e.g. y = x^2","xLabel":"x","yLabel":"y","curves":[{"label":"y=x²","color":"#93C5FD","points":[[-3,9],[-2,4],[-1,1],[0,0],[1,1],[2,4],[3,9]]}]}[/DIAGRAM]
4. Formulas — write, derive simply, explain every term.
5. Solved JEE Example — JEE Mains 2020-2024 style numerical. Full numbered step-by-step solution.
6. Check in: "samajh aaya?" encourage them.`,
    chapters: [
      { name: 'Calculus', topics: ['Limits & Continuity', 'Differentiation', 'Integration', 'Differential Equations'] },
      { name: 'Algebra', topics: ['Quadratic Equations', 'Complex Numbers', 'Matrices & Determinants', 'Permutations & Combinations'] },
      { name: 'Coordinate Geometry', topics: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse & Hyperbola'] },
    ],
  },
} as const;

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-stream`;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setu-chat`;


/* ────────────────────────────────────────────────
   TYPEWRITER HOOK
──────────────────────────────────────────────── */
/* Inject chalk-dust-appear keyframe once */
const CHALK_STYLE_ID = 'setu-chalk-keyframe';
if (typeof document !== 'undefined' && !document.getElementById(CHALK_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = CHALK_STYLE_ID;
  s.textContent = `
    @keyframes chalkAppear {
      0%   { opacity: 0; filter: blur(3px); transform: translateY(1px) scale(0.98); }
      50%  { opacity: 0.7; filter: blur(0.8px); }
      100% { opacity: 1;  filter: blur(0);   transform: translateY(0) scale(1); }
    }
    .chalk-char {
      display: inline;
      animation: chalkAppear 0.2s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

function useTypewriter(text: string, baseSpeed = 7, speedMultiplier = 1) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { setDone(true); return; }
      const ch = text[i - 1];
      const base = baseSpeed / speedMultiplier;
      let delay: number;
      if (ch === '\n') {
        // Long pause after newlines (teacher moving to next point)
        delay = base * 8 + Math.random() * base * 4;
      } else if ('.!?'.includes(ch)) {
        // Sentence-ending pause
        delay = base * 5 + Math.random() * base * 2;
      } else if (',;:'.includes(ch)) {
        // Comma/clause pause
        delay = base * 2.5 + Math.random() * base;
      } else if (ch === ' ') {
        // Word-boundary micro-pause
        delay = base * 1.4 + Math.random() * base * 0.5;
      } else {
        // Normal char with ±35% jitter
        const jitter = (Math.random() - 0.5) * base * 0.7;
        delay = Math.max(1, base + jitter);
      }
      timeoutId = setTimeout(tick, delay);
    };
    timeoutId = setTimeout(tick, baseSpeed / speedMultiplier);
    return () => clearTimeout(timeoutId);
  }, [text, baseSpeed, speedMultiplier]);

  return { displayed, done };
}

/* ────────────────────────────────────────────────
   CHALK TEXT FORMATTER (chalk-char render)
──────────────────────────────────────────────── */

/** Render a string with each character wrapped in a chalk-dust span */
function ChalkText({ text, color }: { text: string; color?: string }) {
  return (
    <>
      {text?.split('').map((ch, i) => (
        <span key={i} className="chalk-char" style={color ? { color } : undefined}>{ch}</span>
      ))}
    </>
  );
}

function BlackboardText({ text = '' }: { text: string }) {
  const DIAGRAM_RE = /\[DIAGRAM\]([\s\S]*?)\[\/DIAGRAM\]/g;
  const segments: Array<{ kind: 'text' | 'diagram'; content: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = DIAGRAM_RE.exec(text || '')) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: 'diagram', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ kind: 'text', content: text.slice(lastIndex) });
  }

  return (
    <div className="space-y-1 leading-relaxed">
      {segments?.map((seg, si) => {
        if (seg.kind === 'diagram') {
          return <DiagramRenderer key={si} raw={seg.content} />;
        }
        // Normalize LaTeX delimiters before rendering
        const normalized = normalizeMathDelimiters(seg.content ?? '');
        return normalized.split('\n').map((line, i) => {
          const headingMatch = line.match(/^#{1,3}\s+(.*)/);
          const rawLine = headingMatch ? headingMatch[1] : line;
          const isHeading = !!headingMatch;

          // Chalk-char render for bold segments, KaTeX for math
          const renderChalkLine = (raw: string, baseColor: string) =>
            (raw || '').split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\*\*.*?\*\*)/g).map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={j} className="font-bold"><ChalkText text={part.slice(2, -2)} color="#ff9a9a" /></span>;
              }
              if (part.startsWith('$$') || part.startsWith('$')) {
                // Render math inline with KaTeX (no chalk animation — KaTeX handles it)
                return <span key={j} style={{ color: baseColor }}><MathLine>{part}</MathLine></span>;
              }
              return <ChalkText key={j} text={part} color={baseColor} />;
            });

          if (isHeading) {
            return (
              <p key={`${si}-${i}`} className="mt-5 mb-1.5 font-bold"
                style={{
                  color: '#fff8d0',
                  fontSize: '1.1rem',
                  borderBottom: '2px solid rgba(255,248,208,0.2)',
                  paddingBottom: '4px',
                }}>
                {renderChalkLine(rawLine, '#fff8d0')}
              </p>
            );
          }
          return (
            <p key={`${si}-${i}`} className={line.startsWith('Step') || line.startsWith('\u091a\u0930\u0923') ? 'mt-3' : ''}>
              {renderChalkLine(rawLine, '#f8f8ee')}
            </p>
          );
        });
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────
   CHALK CURSOR (rectangular piece)
──────────────────────────────────────────────── */
function ChalkCursor() {
  return (
    <motion.span
      animate={{
        opacity: [1, 0.4, 1],
        scale: [1, 1.1, 1],
        rotate: [-14, -18, -14]
      }}
      transition={{ repeat: Infinity, duration: 0.6 }}
      className="inline-block align-middle ml-1"
      style={{
        width: '7px',
        height: '16px',
        borderRadius: '1px',
        background: 'linear-gradient(180deg, #fff 0%, #eee 100%)',
        boxShadow: '0 0 6px rgba(255,255,255,0.35)',
        transform: 'rotate(-15deg)',
        position: 'relative',
        top: '-1px'
      }}
    />
  );
}

/* ────────────────────────────────────────────────
   SPEAKING INDICATOR
──────────────────────────────────────────────── */
function SpeakingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
      <motion.div
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
        className="w-2 h-2 rounded-full bg-emerald-400"
      />
      {[0.5, 0.8, 1.0, 0.7, 0.5].map((h, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-emerald-400"
          animate={{ scaleY: [h, 1, h * 0.6, 1, h] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
          style={{ height: 14 }}
        />
      ))}
      <span className="text-xs text-emerald-400 font-semibold">Speaking...</span>
    </div>
  );
}

/* ────────────────────────────────────────────────
   ERASE ANIMATION OVERLAY (chalkboard wipe)
──────────────────────────────────────────────── */
function EraseOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 rounded-xl z-20 flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #0d2916 0%, #0a1f10 100%)', opacity: 0.95 }}
        >
          <div className="flex items-center gap-3 text-emerald-100/60">
            <Eraser size={20} />
            <span className="text-sm font-medium" style={{ fontFamily: "'Caveat', cursive", fontSize: '18px' }}>Erasing board...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────── */
const AITeachingRoomPage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();

  const teacher = TEACHERS[(teacherId as TeacherId) || 'pk-sir'] || TEACHERS['pk-sir'];
  const SubjectIcon = teacher.icon;

  // State
  const { language } = useLanguage();
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [quizReady, setQuizReady] = useState(false);

  // Blackboard
  const [boardContent, setBoardContent] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // Voice
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2] as const;
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null); // cancels in-flight AI stream

  // HeyGen Avatar
  const [avatarMode, setAvatarMode] = useState(true);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const avatarClientRef = useRef<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Doubt input
  const [doubtInput, setDoubtInput] = useState('');
  const [isSendingDoubt, setIsSendingDoubt] = useState(false);

  // Chat history for context
  const chatHistoryRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // ── Session Tracker
  const sessionTracker = useSessionTracker();

  // ── Session Report state (no engagement refs needed here yet)
  const [showSessionReport, setShowSessionReport] = useState(false);
  const [compiledReport, setCompiledReport] = useState<import('@/hooks/useSessionTracker').CompiledSessionReport | null>(null);

  // ── Engagement Detection
  const engagement = useEngagementDetector();
  const [engagementEnabled, setEngagementEnabled] = useState(false);
  const [showSessionStats, setShowSessionStats] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const lowAttentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAdaptationRef = useRef<number>(0);
  // callAIRef allows the engagement effect to reference callAI without a declaration-order issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callAIRef = useRef<(msg: string) => Promise<void>>(async () => { });

  // Monitor engagement score and trigger AI adaptation when student is distracted
  useEffect(() => {
    if (!engagementEnabled) return;
    const score = engagement.engagementScore;

    if (score < 40) {
      // Start low-attention timer if not already running
      if (!lowAttentionTimerRef.current) {
        lowAttentionTimerRef.current = setTimeout(() => {
          lowAttentionTimerRef.current = null;
          const now = Date.now();
          // Rate-limit: only trigger every 90 seconds
          if (now - lastAdaptationRef.current < 90_000) return;
          lastAdaptationRef.current = now;

          const isAway = engagement.engagementState === 'away';
          const adaptMsg = isAway
            ? `Hey! Don't go — stay with me, this part in ${teacher.subject} is important for your exams! 📚`
            : `Hmm, lagta hai dhyan thoda hat gaya. 🤔 Chalte hain — apna doubt batao ya phirse samjhaaoon?`;
          callAIRef.current(adaptMsg);
        }, 12_000); // Trigger after 12 seconds of low attention
      }
    } else {
      // Clear the timer when attention is restored
      if (lowAttentionTimerRef.current) {
        clearTimeout(lowAttentionTimerRef.current);
        lowAttentionTimerRef.current = null;
      }
    }
  }, [engagement.engagementScore, engagement.engagementState, engagementEnabled, teacher.subject]);

  const handleEnableEngagement = useCallback(async () => {
    if (!cameraVideoRef.current) return;
    setEngagementEnabled(true);
    await engagement.startDetection(cameraVideoRef.current);
  }, [engagement]);

  const handleDisableEngagement = useCallback(() => {
    setEngagementEnabled(false);
    engagement.stopDetection();
    if (lowAttentionTimerRef.current) {
      clearTimeout(lowAttentionTimerRef.current);
      lowAttentionTimerRef.current = null;
    }
    if (engagement.sessionStats) setShowSessionStats(true);
  }, [engagement]);

  // ── Finish Session handler (after engagement hooks are declared)
  const handleFinishSession = useCallback(() => {
    const report = sessionTracker.compileReport({
      engagementScore: engagement.engagementScore,
      attentivePercent: engagement.sessionStats?.attentivePercent ?? 0,
      distractedPercent: engagement.sessionStats?.distractedPercent ?? 0,
      engagementTimeline: engagement.sessionStats?.engagementTimeline ?? [],
    });
    setCompiledReport(report);
    setShowSessionReport(true);
  }, [sessionTracker, engagement]);

  // ── MCQ System
  const {
    mcq, startMCQ, selectAnswer: selectMCQAnswer,
    setMistakeType, setConfidence,
    nextQuestion: nextMCQQuestion, skipMCQ, resetMCQ
  } = useMCQ(language, (topic, correct) => {
    // ── Update session tracker with MCQ results ──
    sessionTracker.recordMCQResult(topic, correct);
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Auto-open sidebar on mobile when MCQ becomes active
  useEffect(() => {
    if (mcq.status === 'active' || mcq.status === 'feedback') {
      setIsMobileSidebarOpen(true);
    }
  }, [mcq.status]);

  // The full text currently displayed (including streaming)
  const { displayed, done } = useTypewriter(isStreaming ? '' : boardContent, 7, playbackSpeed);
  const isWriting = isStreaming || !done;

  // ── Welcome message on mount
  useEffect(() => {
    setBoardContent(getWelcome(teacher.name, teacher.subject, language));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher.name, teacher.subject]);

  // Update welcome when language changes
  useEffect(() => {
    setBoardContent(getWelcome(teacher.name, teacher.subject, language));
    chatHistoryRef.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // -- TTS function
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    const clean = text
      .replace(/^#{1,3}\s+/gm, '')    // remove ### ## #
      .replace(/\*\*/g, '')            // remove bold markers
      .replace(/[*_`]/g, ' ')          // remove other markdown
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
    if (clean.length < 5) return;

    try {
      setIsSpeaking(true);
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          text: clean.slice(0, 600),
          voiceId: teacher.voiceId,
          voiceSettings: teacher.voiceSettings
        }),
      });

      if (!resp.ok) { throw new Error('TTS fetch failed'); }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.onended = () => { setIsSpeaking(false); setIsPaused(false); };
        audioRef.current.onerror = () => setIsSpeaking(false);
        try {
          await audioRef.current.play();
        } catch {
          // Retry once after short delay (browser autoplay policy)
          await new Promise(r => setTimeout(r, 300));
          await audioRef.current.play().catch(() => { throw new Error('Autoplay blocked'); });
        }
      }
    } catch {
      console.warn("TTS Edge Function failed, using Native SpeechSynthesis fallback");
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      const targetLang = LANG_BCP47[language];
      utterance.lang = targetLang;
      utterance.rate = playbackSpeed;

      // Wait for voices to load (needed in Safari)
      const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
        new Promise(resolve => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length) { resolve(voices); return; }
          window.speechSynthesis.addEventListener('voiceschanged', () => resolve(window.speechSynthesis.getVoices()), { once: true });
        });

      const voices = await loadVoices();
      // Prefer voice matching the exact language code, then the language prefix, then any English Indian voice
      const matchedVoice =
        voices.find((v: SpeechSynthesisVoice) => v.lang === targetLang) ||
        voices.find((v: SpeechSynthesisVoice) => v.lang.startsWith(targetLang.split('-')[0])) ||
        voices.find((v: SpeechSynthesisVoice) => v.lang.includes('IN')) ||
        voices[0];
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceEnabled, teacher.voiceId, avatarMode, language]);

  // -- Avatar function
  const startAvatarSession = useCallback(async () => {
    setIsAvatarLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heygen-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        }
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error("🔴 HeyGen Token Fetch Failed:", resp.status, errData);
        throw new Error(`Failed to get HeyGen token: ${resp.status} ${errData.details || errData.message || ''}`);
      }
      const { data: { token } } = await resp.json();

      const avatar = new StreamingAvatar({ token });
      avatarClientRef.current = avatar;

      avatar.on(StreamingEvents.STREAM_READY, (event: { detail?: MediaStream }) => {
        if (event.detail && videoRef.current) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        if (videoRef.current) videoRef.current.srcObject = null;
      });

      await avatar.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: teacher.avatarId,
        voice: {
          voiceId: teacher.voiceId,
          rate: 1.0,
        },
        language: HEYGEN_LANG_CODE[language],
      });
    } catch (error) {
      console.error("Avatar failed to start", error);
      setAvatarMode(false);
    } finally {
      setIsAvatarLoading(false);
    }
  }, [teacher, language]);

  const stopAvatarSession = useCallback(async () => {
    if (avatarClientRef.current) {
      await avatarClientRef.current.stopAvatar();
      avatarClientRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    if (avatarMode) {
      startAvatarSession();
    }
    return () => { stopAvatarSession(); };
  }, [avatarMode, startAvatarSession, stopAvatarSession]);

  // ── Stop all: audio + in-flight AI stream
  const stopAll = useCallback(() => {
    // 1. Abort any in-flight fetch/stream
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    // 2. Stop audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsStreaming(false);
  }, []);

  // Keep legacy ref for mic use
  const stopAudio = stopAll;

  // ── Core AI call
  const callAI = useCallback(async (userMessage: string) => {
    // 0. Stop any previous audio + stream immediately
    stopAll();

    // 0.5 Interrupt avatar
    if (avatarMode && avatarClientRef.current) {
      avatarClientRef.current.interrupt().catch(() => { });
    }

    // 0.6 Unlock audio context synchronously on user gesture
    if (audioRef.current && !avatarMode) {
      // Tiny 1-sample silent WAV to register a user-initiated play
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.play().catch(() => { });
    }

    // 1. Erase board
    setIsErasing(true);
    await new Promise(r => setTimeout(r, 600));
    setIsErasing(false);
    setBoardContent('');
    setStreamingContent('');

    // 2. Build chat history
    chatHistoryRef.current.push({ role: 'user', content: userMessage });

    // 3. Stream from setu-chat using the teacher's custom system prompt
    setIsStreaming(true);
    let accumulated = '';
    let spokenCursor = 0;

    // Create a fresh abort controller for this request
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        signal: abort.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: teacher.systemPrompt(language) +
                // ── Engagement context: passes real-time facial signal state to the AI
                (engagementEnabled
                  ? `\n\n[STUDENT ENGAGEMENT STATE: ${engagement.engagementState}. Score: ${engagement.engagementScore}/100. ` +
                  `Adjust your teaching tone accordingly — if distracted/away, be more engaging and hook attention; ` +
                  `if focused, maintain depth and flow; if confused/distracted, simplify and check in.]`
                  : ''),
            },
            ...chatHistoryRef.current,
          ],
          examMode: 'jee',
          language,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (!abort.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              accumulated += chunk;
              setStreamingContent(accumulated);

              if (avatarMode && avatarClientRef.current) {
                const cleanText = accumulated
                  .replace(/\[DIAGRAM\][\s\S]*?(?:\[\/DIAGRAM\]|$)/g, '')
                  .replace(/[*_`#]/g, '')
                  .replace(/\n{2,}/g, '. ');

                const unspoken = cleanText.slice(spokenCursor);
                const match = unspoken.match(/([^.?!]+[.?!]+)/);
                if (match) {
                  const sentence = match[0];
                  spokenCursor += match.index! + sentence.length;
                  if (sentence.trim().length > 3) {
                    avatarClientRef.current.speak({ text: sentence.trim(), taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch((e) => console.error('Avatar speak error', e));
                  }
                }
              }
            }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      accumulated = language === 'hindi'
        ? 'माफ़ करें, कनेक्शन में कोई समस्या आई। कृपया दोबारा कोशिश करें।'
        : 'Sorry, connection error. Please try again.';
      setStreamingContent(accumulated);
    }

    // 4. Finalize (only if this request was NOT aborted by a new topic switch)
    if (!abort.signal.aborted) {
      setIsStreaming(false);
      setBoardContent(accumulated);
      setStreamingContent('');
      chatHistoryRef.current.push({ role: 'assistant', content: accumulated });

      // ── Closing feedback based on live engagement signals
      // Only append if engagement tracking was active during this explanation
      const closingMsg = engagementEnabled
        ? getClosingFeedback(
          {
            engagementScore: engagement.engagementScore,
            distractedPercent: engagement.sessionStats?.distractedPercent ?? 0,
          },
          language,
        )
        : null;

      const finalContent = closingMsg
        ? `${accumulated}\n\n---\n\n*${closingMsg}*`
        : accumulated;

      setBoardContent(finalContent);

      // ── Record AI response in session tracker
      sessionTracker.recordAIResponse();

      // ── Trigger MCQ after explanation ──
      const chapter = teacher.chapters[selectedChapter];
      const topic = chapter?.topics[selectedTopic];
      if (topic) {
        startMCQ(topic, teacher.subject);
        setQuizReady(true);
      }

      if (avatarMode && avatarClientRef.current) {
        const cleanText = accumulated
          .replace(/\[DIAGRAM\][\s\S]*?(?:\[\/DIAGRAM\]|$)/g, '')
          .replace(/[*_`#]/g, '')
          .replace(/\n{2,}/g, '. ');
        const unspoken = cleanText.slice(spokenCursor).trim();
        if (unspoken.length > 2) {
          avatarClientRef.current.speak({ text: unspoken, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch(() => { });
        }
        // Speak the closing message via avatar too
        if (closingMsg) {
          setTimeout(() => {
            avatarClientRef.current?.speak({ text: closingMsg, taskType: TaskType.REPEAT, taskMode: TaskMode.SYNC }).catch(() => { });
          }, 1200);
        }
      } else {
        // 5. Speak accumulated + closing with regular TTS
        const toSpeak = closingMsg ? `${accumulated} ... ${closingMsg}` : accumulated;
        speakText(toSpeak);
      }
    }
  }, [language, teacher, speakText, stopAll, avatarMode]);

  // Sync callAIRef so the engagement effect can call it without stale-closure issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { callAIRef.current = callAI; }, [callAI]);

  // Voice input (mic)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support voice input. Please try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    // Stop any currently playing audio so the mic doesn't pick it up
    stopAudio();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      // ✅ Auto-submit directly to AI — no text box step
      sessionTracker.recordInteraction('voice');
      callAI(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening, callAI, stopAudio]);

  // ── Explain topic
  const handleExplain = useCallback(() => {
    const chapter = teacher.chapters[selectedChapter];
    const topic = chapter.topics[selectedTopic];
    sessionTracker.recordInteraction('explain');
    sessionTracker.recordTopicChange(chapter.name, topic);
    resetMCQ(); // ── Ensure previous quiz state is cleared ──
    // Build a simple explain prompt; the system prompt enforces the language
    const prompt = language === 'hindi'
      ? `${chapter.name} में "${topic}" समझाइए।`
      : language === 'english'
        ? `Explain "${topic}" from ${chapter.name}.`
        : `${chapter.name} mein "${topic}" samjhao.`; // hinglish + regional: just use English query, AI responds in chosen language
    callAI(prompt);
  }, [teacher, selectedChapter, selectedTopic, language, callAI, sessionTracker]);

  // ── Send doubt
  const handleSendDoubt = useCallback(async () => {
    if (!doubtInput.trim() || isSendingDoubt || isStreaming) return;
    setIsSendingDoubt(true);
    const q = doubtInput.trim();
    setDoubtInput('');
    sessionTracker.recordInteraction('typed'); // ── track typed interaction
    resetMCQ(); // ── Ensure previous quiz state is cleared ──
    await callAI(q);
    setIsSendingDoubt(false);
  }, [doubtInput, isSendingDoubt, isStreaming, callAI, sessionTracker]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendDoubt(); }
  };


  const currentChapter = teacher.chapters[selectedChapter];

  return (
    <MainLayout title={`${teacher.name} — ${teacher.subject}`} fullHeight>
      {/* Hidden audio */}
      <audio ref={audioRef} className="hidden" />

      {/* ── Session Stats popup */}
      {showSessionStats && engagement.sessionStats && (
        <SessionStatsCard stats={engagement.sessionStats} onDismiss={() => setShowSessionStats(false)} />
      )}

      {/* ── Finish Session Report Modal */}
      {showSessionReport && compiledReport && (
        <SessionReport
          report={compiledReport}
          language={language}
          teacherName={teacher.name}
          accentColor={teacher.accent}
          onClose={() => setShowSessionReport(false)}
          onNewSession={() => { setShowSessionReport(false); navigate('/dashboard'); }}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-col lg:flex-row overflow-hidden gap-0 rounded-xl" style={{ height: 'calc(100vh - 13rem)' }}>

        {/* ══ LEFT: BLACKBOARD (70%) ══ */}
        <div className="flex-[7] flex flex-col min-h-0 p-3 sm:p-4">
          <div
            className="relative flex-1 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0d2916 0%, #0a1f10 40%, #091a0e 100%)',
              border: '2px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            {/* Blackboard slate texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 28px, rgba(255,255,255,0.1) 29px)',
              }}
            />

            {/* Erase animation */}
            <EraseOverlay visible={isErasing} />

            {/* Board content */}
            <div className="relative h-full overflow-y-auto z-0 p-5 sm:p-8">
              {/* Chalk font styling */}
              <div
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 'clamp(17px, 2vw, 21px)',
                  lineHeight: 2.05,
                  color: '#f8f8ee',
                  textShadow: '0 0 12px rgba(255,255,240,0.2), 0 1px 0 rgba(0,0,0,0.4)',
                  letterSpacing: '0.025em',
                  fontWeight: 500,
                }}
              >
                {isStreaming ? (
                  <>
                    <BlackboardText text={streamingContent} />
                    <ChalkCursor />
                  </>
                ) : (
                  <>
                    <BlackboardText text={displayed} />
                    {!done && <ChalkCursor />}
                  </>
                )}
              </div>

              {/* Loading: chalk writing indicator */}
              {isStreaming && !streamingContent && (
                <div className="flex items-center gap-2 mt-4" style={{ color: 'rgba(180,255,180,0.4)' }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', letterSpacing: '0.02em' }}>
                    {teacher.name} is writing on the board...
                  </span>
                </div>
              )}
            </div>

            {/* Blackboard shadow frames */}
            <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
          </div>

          {/* Chalk tray visual */}
          <div
            className="h-2.5 mx-2 rounded-b-lg flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom, #4a3728, #2a1f15)', opacity: 0.8 }}
          />
        </div>

        {/* ══ RIGHT: INTERACTION PANEL (30%) ══ */}
        {/* On mobile: Fixed bottom drawer. On desktop: Sidebar. */}
        <AnimatePresence>
          {(isMobileSidebarOpen || window.innerWidth >= 1024) && (
            <motion.div
              initial={window.innerWidth < 1024 ? { y: '100%' } : { opacity: 0, x: 20 }}
              animate={window.innerWidth < 1024 ? { y: 0 } : { opacity: 1, x: 0 }}
              exit={window.innerWidth < 1024 ? { y: '100%' } : { opacity: 0, x: 20 }}
              className={`
                flex-[3] flex flex-col min-h-0 border-l relative overflow-y-auto z-50
                ${window.innerWidth < 1024 ? 'fixed inset-x-0 bottom-0 h-[80vh] rounded-t-3xl border-t' : ''}
              `}
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: 'rgba(8,11,18,0.98)',
              }}
            >
              {/* Mobile Close Handle */}
              <div className="lg:hidden w-full flex justify-center py-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                />
              </div>

              {/* Local dim overlay for panel */}
              <AnimatePresence>
                {isWriting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 z-10 pointer-events-none"
                    style={{ backdropFilter: 'blur(0.5px)' }}
                  />
                )}
              </AnimatePresence>

              <div className="flex-1 p-4 lg:p-6 space-y-6">
                {/* Mobile Close Button (Alternative) */}
                <div className="lg:hidden flex justify-between items-center mb-2">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Interaction Panel</span>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                </div>
                {/* ── Active Quiz Section ── */}
                <AnimatePresence>
                  {quizReady && (mcq.status !== 'idle' || !!mcq.error) && (
                    <motion.div
                      initial={{ opacity: 0, x: 50, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: 50, height: 0 }}
                      className="mb-6"
                    >
                      <MCQCard
                        key={`${mcq.questionNumber}-${mcq.currentQuestion?.id}`}
                        mcq={mcq}
                        accentColor={teacher.accent}
                        onSelectAnswer={selectMCQAnswer}
                        onSetMistake={setMistakeType}
                        onSetConfidence={setConfidence}
                        onNext={nextMCQQuestion}
                        onSkip={skipMCQ}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Finish Session — Top Position for visibility ── */}
                <div className="flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFinishSession}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/30 hover:bg-red-500/10 text-red-500 flex items-center gap-1.5"
                    style={{ background: 'rgba(239, 68, 68, 0.05)' }}
                  >
                    <Flag size={12} /> Finish Session
                  </motion.button>
                </div>

                {/* ── Teacher Avatar ── */}
                <div className="flex flex-col items-center pt-3">
                  <motion.div
                    animate={isSpeaking ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="relative"
                  >
                    {avatarMode ? (
                      <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden"
                        style={{ border: `3px solid ${teacher.accent}88`, boxShadow: `0 0 24px ${teacher.accent}45` }}>
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover bg-black"
                          autoPlay
                          playsInline
                        />
                        {isAvatarLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-white text-xs gap-2">
                            <Loader2 size={16} className="animate-spin text-emerald-400" />
                            <span>Connecting...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Avatar glow */}
                        {isSpeaking && (
                          <div
                            className="absolute inset-0 rounded-full animate-pulse"
                            style={{ background: `radial-gradient(circle, ${teacher.accent}30 0%, transparent 70%)`, transform: 'scale(1.3)' }}
                          />
                        )}
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black relative"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${teacher.accent}55, ${teacher.accentDark}88)`,
                            border: `2px solid ${teacher.accent}55`,
                            boxShadow: `0 0 24px ${teacher.accent}25`,
                            color: '#fff',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {teacher.initials}
                        </div>
                      </>
                    )}
                  </motion.div>

                  <div className="mt-4 text-center">
                    <h2 className="text-base font-bold text-white flex items-center justify-center gap-2">
                      {teacher.name}
                      <button
                        onClick={() => setAvatarMode(!avatarMode)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${avatarMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                        title={avatarMode ? "Disable Video Avatar" : "Enable Video Avatar"}
                      >
                        {avatarMode ? "Video ON" : "Video OFF"}
                      </button>
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: teacher.accent }}>{teacher.subject} Teacher</p>
                  </div>

                  {/* Speaking indicator */}
                  <div className="mt-2 h-8 flex items-center">
                    {isSpeaking ? <SpeakingIndicator /> : (
                      <span className="text-xs text-slate-500">
                        {isStreaming ? 'Writing on board...' : 'Ready to teach'}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Engagement / Focus Mode ── */}
                <div className="flex flex-col items-center">
                  {/* Hidden video element used by MediaPipe — not displayed */}
                  <video
                    ref={cameraVideoRef}
                    muted
                    playsInline
                    className="hidden"
                    style={{ width: 320, height: 240 }}
                  />
                  <EngagementOverlay
                    cameraStream={engagement.cameraStream}
                    engagementScore={engagement.engagementScore}
                    engagementState={engagement.engagementState}
                    facePresent={engagement.facePresent}
                    isPermissionGranted={engagement.isPermissionGranted}
                    isDetectorReady={engagement.isDetectorReady}
                    isEnabled={engagementEnabled}
                    onEnable={handleEnableEngagement}
                    onDisable={handleDisableEngagement}
                  />
                </div>

                {/* ── Divider ── */}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* ── Chapter/Topic Selector ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <BookOpen size={11} />
                    Select Topic
                  </div>

                  {/* Chapter dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setChapterOpen(o => !o)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <span className="truncate">{currentChapter?.name || 'Loading Chapters...'}</span>
                      <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${chapterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {chapterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-40"
                          style={{ background: '#141822', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                          {teacher?.chapters?.map((ch, i) => (
                            <button
                              key={i}
                              onClick={() => { setSelectedChapter(i); setSelectedTopic(0); setChapterOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                              style={{
                                color: selectedChapter === i ? teacher.accent : 'rgba(255,255,255,0.7)',
                                background: selectedChapter === i ? `${teacher.accent}15` : 'transparent',
                              }}
                            >
                              {ch.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Topic dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setTopicOpen(o => !o)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <span className="truncate">{currentChapter?.topics?.[selectedTopic] || 'Select Topic'}</span>
                      <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${topicOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {topicOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-40"
                          style={{ background: '#141822', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                          {currentChapter?.topics?.map((t, i) => (
                            <button
                              key={i}
                              onClick={() => { setSelectedTopic(i); setTopicOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                              style={{
                                color: selectedTopic === i ? teacher.accent : 'rgba(255,255,255,0.7)',
                                background: selectedTopic === i ? `${teacher.accent}15` : 'transparent',
                              }}
                            >
                              {t}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Explain button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExplain}
                    disabled={isStreaming || isErasing}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: isStreaming ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${teacher.accent}, ${teacher.accentDark})`,
                      color: isStreaming ? 'rgba(255,255,255,0.4)' : '#fff',
                      boxShadow: isStreaming ? 'none' : `0 4px 16px ${teacher.accent}40`,
                    }}
                  >
                    {isStreaming ? (
                      <><Loader2 size={14} className="animate-spin" /> Explaining...</>
                    ) : (
                      <><BookOpen size={14} /> Explain This Topic</>
                    )}
                  </motion.button>
                </div>

                {/* ── Divider ── */}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* Quick chips */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Quick doubts</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      language === 'hinglish' ? 'Formula kya hai?' : language === 'hindi' ? 'सूत्र क्या है?' : 'What is the formula?',
                      language === 'hinglish' ? 'Ek example do' : language === 'hindi' ? 'एक उदाहरण दें' : 'Give an example',
                      language === 'hinglish' ? 'JEE tip batao' : language === 'hindi' ? 'JEE टिप बताएं' : 'JEE exam tip',
                    ].map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => { sessionTracker.recordInteraction('chip'); callAI(chip); }}
                        disabled={isStreaming}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all disabled:opacity-40"
                        style={{
                          background: `${teacher.accent}15`,
                          color: teacher.accent,
                          border: `1px solid ${teacher.accent}30`,
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Floating Toggle Tab ── */}
        <AnimatePresence>
          {!isMobileSidebarOpen && (mcq.status === 'active' || mcq.status === 'feedback') && (
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden fixed bottom-24 right-4 z-40 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-500/30"
              style={{ background: teacher.accent, color: '#fff' }}
            >
              <BookOpen size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Open Assessment</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 rounded-full bg-white shadow-glow"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM DOUBT BOX ── */}
      <div
        className="flex-shrink-0 relative"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,11,18,0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Local dim overlay for input box */}
        <AnimatePresence>
          {isWriting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-10 pointer-events-none"
              style={{ backdropFilter: 'blur(0.5px)' }}
            />
          )}
        </AnimatePresence>
        {/* ── Voice-first row ── */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          {/* Speaker toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { const next = !voiceEnabled; setVoiceEnabled(next); if (!next) stopAudio(); }}
            title={voiceEnabled ? 'Mute teacher voice' : 'Unmute teacher voice'}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: voiceEnabled ? `${teacher.accent}20` : 'rgba(239,68,68,0.15)',
              border: voiceEnabled ? `1px solid ${teacher.accent}40` : '1px solid rgba(239,68,68,0.3)',
              color: voiceEnabled ? teacher.accent : '#F87171',
            }}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </motion.button>

          {/* Big voice/mic button */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={startListening}
            disabled={isStreaming}
            title={isListening ? 'Stop listening' : 'Speak to ask your doubt (hands-free)'}
            className="flex flex-1 items-center justify-center gap-3 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none"
            style={{
              background: isListening
                ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.15))'
                : `linear-gradient(135deg, ${teacher.accent}25, ${teacher.accentDark}15)`,
              border: isListening
                ? '1px solid rgba(239,68,68,0.5)'
                : `1px solid ${teacher.accent}35`,
              color: isListening ? '#F87171' : teacher.accent,
              boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.2)' : `0 0 14px ${teacher.accent}18`,
            }}
            animate={isListening ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.9 }}
          >
            {isListening ? (
              <>
                {/* Animated waveform */}
                <div className="flex items-center gap-0.5">
                  {[0.5, 1, 0.7, 1, 0.6].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 rounded-full bg-red-400"
                      style={{ height: 16 }}
                      animate={{ scaleY: [h, 1, h * 0.4, 1, h] }}
                      transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.07 }}
                    />
                  ))}
                </div>
                <span>Listening... (tap to cancel)</span>
                <MicOff size={16} />
              </>
            ) : (
              <>
                <Mic size={18} />
                <span>Tap &amp; Speak your doubt</span>
              </>
            )}
          </motion.button>
        </div>

        {/* ── Voice Controls Bar: Play/Pause + Speed ── */}
        <div className="flex items-center gap-2 px-4 pb-1.5">
          {/* Play / Pause (only visible while speaking) */}
          <AnimatePresence>
            {isSpeaking && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (!audioRef.current) return;
                  if (isPaused) {
                    audioRef.current.play();
                    setIsPaused(false);
                  } else {
                    audioRef.current.pause();
                    setIsPaused(true);
                  }
                }}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: `${teacher.accent}25`,
                  border: `1px solid ${teacher.accent}40`,
                  color: teacher.accent,
                }}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Speed selector chips */}
          <div className="flex items-center gap-1 flex-1">
            <Gauge size={11} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <div className="flex gap-1">
              {SPEED_OPTIONS.map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (audioRef.current && isSpeaking) {
                      audioRef.current.playbackRate = speed;
                    }
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all"
                  style={{
                    background: playbackSpeed === speed ? `${teacher.accent}30` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${playbackSpeed === speed ? teacher.accent : 'rgba(255,255,255,0.08)'}`,
                    color: playbackSpeed === speed ? teacher.accent : 'rgba(255,255,255,0.35)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {speed === 1 ? '1x' : `${speed}x`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Text fallback row ── */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div
            className="flex flex-1 items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <input
              type="text"
              value={doubtInput}
              onChange={e => setDoubtInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'hindi'
                  ? `या यहाँ टाइप करें...`
                  : language === 'hinglish'
                    ? `Ya yahan type karo...`
                    : `Or type your doubt here...`
              }
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-700"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              disabled={isStreaming || isListening}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSendDoubt}
            disabled={!doubtInput.trim() || isStreaming || isSendingDoubt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: `${teacher.accent}20`,
              color: teacher.accent,
              border: `1px solid ${teacher.accent}30`,
            }}
          >
            {isSendingDoubt ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Send</span>
          </motion.button>
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(chapterOpen || topicOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setChapterOpen(false); setTopicOpen(false); }} />
      )}
    </MainLayout>
  );
};

export default AITeachingRoomPage;

