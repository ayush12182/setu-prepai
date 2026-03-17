import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MicOff, Send, ChevronDown, Volume2, Loader2,
  BookOpen, Atom, FlaskConical, FunctionSquare, Eraser,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage, LanguageMode } from '@/contexts/LanguageContext';

/* ────────────────────────────────────────────────
   LANGUAGE HELPERS
──────────────────────────────────────────────── */
// Maps LanguageMode → native name for the instruction in the system prompt
const LANG_INSTRUCTION: Record<LanguageMode, string> = {
  english:  'English only',
  hinglish: 'Hinglish — a natural mix of Hindi and English (Roman script for Hindi words)',
  hindi:    'pure Hindi using Devanagari script only',
  kannada:  'Kannada (ಕನ್ನಡ) script only',
  telugu:   'Telugu (తెలుగు) script only',
  punjabi:  'Punjabi (ਪੰਜਾਬੀ) using Gurmukhi script only',
  marathi:  'Marathi (मराठी) using Devanagari script only',
  tamil:    'Tamil (தமிழ்) script only',
  gujarati: 'Gujarati (ગુજરાતી) script only',
};

// Welcome messages for each language
const getWelcome = (name: string, subject: string, lang: LanguageMode): string => {
  const maps: Record<LanguageMode, string> = {
    english:  `Hello! I'm ${name} — your ${subject} teacher.\n\nWhat would you like to learn today? Select a chapter and click "Explain", or ask me your doubt directly! 🎓`,
    hinglish: `Namaste! Main hoon ${name} — aapka ${subject} teacher.\n\nAaj kya padhna hai? Ek chapter select karo aur "Explain" dabao. Ya seedha apna doubt pooch sakte ho! 🎓`,
    hindi:    `नमस्ते! मैं हूं ${name} — आपका ${subject} शिक्षक।\n\nआज क्या पढ़ना है? एक अध्याय चुनें और "Explain" दबाएं। या सीधे अपना प्रश्न पूछें! 🎓`,
    kannada:  `ನಮಸ್ಕಾರ! ನಾನು ${name} — ನಿಮ್ಮ ${subject} ಶಿಕ್ಷಕ.\n\nಇಂದು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ? ಒಂದು ಅಧ್ಯಾಯ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು "Explain" ಒತ್ತಿ. ಅಥವಾ ನೇರವಾಗಿ ನಿಮ್ಮ ಸಂದೇಹ ಕೇಳಿ! 🎓`,
    telugu:   `నమస్కారం! నేను ${name} — మీ ${subject} ఉపాధ్యాయుడు.\n\nఈరోజు ఏమి నేర్చుకోవాలి? ఒక అధ్యాయం ఎంచుకుని "Explain" నొక్కండి. లేదా నేరుగా మీ సందేహం అడగండి! 🎓`,
    punjabi:  `ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਹਾਂ ${name} — ਤੁਹਾਡਾ ${subject} ਅਧਿਆਪਕ।\n\nਅੱਜ ਕੀ ਪੜ੍ਹਨਾ ਹੈ? ਇੱਕ ਅਧਿਆਇ ਚੁਣੋ ਅਤੇ "Explain" ਦਬਾਓ। ਜਾਂ ਸਿੱਧਾ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ! 🎓`,
    marathi:  `नमस्कार! मी आहे ${name} — तुमचा ${subject} शिक्षक।\n\nआज काय शिकायचे आहे? एक अध्याय निवडा आणि "Explain" दाबा. किंवा थेट तुमचा प्रश्न विचारा! 🎓`,
    tamil:    `வணக்கம்! நான் ${name} — உங்கள் ${subject} ஆசிரியர்.\n\nஇன்று என்ன கற்றுக்கொள்ள விரும்புகிறீர்கள்? ஒரு அத்தியாயம் தேர்ந்தெடுத்து "Explain" அழுத்துங்கள். அல்லது நேரடியாக உங்கள் சந்தேகம் கேளுங்கள்! 🎓`,
    gujarati: `નમસ્તે! હું ${name} — તમારો ${subject} શિક્ષક.\n\nઆજે શું ભણવું છે? એક પ્રકરણ પસંદ કરો અને "Explain" દબાવો. અથવા સીધો તમારો પ્રશ્ન પૂછો! 🎓`,
  };
  return maps[lang];
};

// Quick doubt chip labels for each language
const getChips = (lang: LanguageMode): [string, string, string] => {
  const maps: Record<LanguageMode, [string, string, string]> = {
    english:  ['What is the formula?', 'Give an example', 'JEE exam tip'],
    hinglish: ['Formula kya hai?', 'Ek example do', 'JEE tip batao'],
    hindi:    ['सूत्र क्या है?', 'एक उदाहरण दें', 'JEE टिप बताएं'],
    kannada:  ['ಸೂತ್ರ ಏನು?', 'ಒಂದು ಉದಾಹರಣೆ ಕೊಡಿ', 'JEE ಟಿಪ್ ಹೇಳಿ'],
    telugu:   ['సూత్రం ఏమిటి?', 'ఒక ఉదాహరణ ఇవ్వండి', 'JEE చిట్కా చెప్పండి'],
    punjabi:  ['ਫਾਰਮੂਲਾ ਕੀ ਹੈ?', 'ਇੱਕ ਮਿਸਾਲ ਦਿਓ', 'JEE ਟਿਪ ਦੱਸੋ'],
    marathi:  ['सूत्र काय आहे?', 'एक उदाहरण द्या', 'JEE टिप सांगा'],
    tamil:    ['சூத்திரம் என்ன?', 'ஒரு உதாரணம் கொடுங்கள்', 'JEE குறிப்பு சொல்லுங்கள்'],
    gujarati: ['સૂત્ર શું છે?', 'એક ઉદાહરણ આપો', 'JEE ટિપ જણાવો'],
  };
  return maps[lang];
};

// Doubt placeholder text per language
const getDoubtPlaceholder = (name: string, lang: LanguageMode): string => {
  const maps: Record<LanguageMode, string> = {
    english:  `Ask your doubt to ${name}...`,
    hinglish: `${name} se apna doubt pooch...`,
    hindi:    `${name} से अपना प्रश्न पूछें...`,
    kannada:  `${name} ಅವರಿಗೆ ನಿಮ್ಮ ಸಂದೇಹ ಕೇಳಿ...`,
    telugu:   `${name} కి మీ సందేహం అడగండి...`,
    punjabi:  `${name} ਨੂੰ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ...`,
    marathi:  `${name} ला तुमचा प्रश्न विचारा...`,
    tamil:    `${name} கிட்ட உங்கள் சந்தேகம் கேளுங்கள்...`,
    gujarati: `${name} ને તમારો પ્રશ્ન પૂછો...`,
  };
  return maps[lang];
};

type TeacherId = keyof typeof TEACHERS;

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
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    systemPrompt: (lang: LanguageMode) =>
      `You are P.K. Sir — a legendary Physics teacher from Kota, India. You teach like the best Allen/Resonance coaches: confident, slightly humorous, deeply caring about the student.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

STYLE RULES (follow every time):
1. Open with a natural hook like "Chalo bhai, aaj iska kaccha chitha nikalte hain!" or "Dekho, yeh concept 90% log galat karte hain — tum mat karna."
2. Build concept in this order: Hook → Core idea (1-2 lines) → Physical intuition/analogy → Worked example → Exam trick
3. Ask 1 mid-explanation question like "Yeh samajh aaya?" or "Haan bhai samajh mein aaya ya nahi?"
4. End with motivation and an exam tip: "Exam mein pakka aata hai — yaad rakhna! Tum kar loge, bas practice karte raho!"
5. Bold key formulas with **bold**. Use → for step chains.
6. Keep it interactive and motivational throughout. Under 150 words. No long paragraphs. Friendly, never robotic.`,
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
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    systemPrompt: (lang: LanguageMode) =>
      `You are V.K. Sir — one of India's most beloved JEE Chemistry teachers. You explain like a friend who knows every JEE pattern inside out. Slightly dramatic, always precise.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

STYLE RULES (follow every time):
1. Open with a hook: "Yaar, yeh reaction yaad nahi? Main batata hoon — aur bhoologe nahi." or "Chalo, isko ek baar crystal clear karte hain!"
2. Structure: Hook → Core mechanism (1-2 lines) → Memory trick/analogy → Real example with reaction (use →) → JEE tip
3. Throw in questions: "Haan bhai samajh mein aaya ya nahi?" or "Yeh clear hua sabko?"
4. End with an exam shortcut and motivation: "Tum fodd ke aaoge exam mein, bas ye shortcut yaad rakhna!"
5. Bold key terms **bold**. Show reactions with →.
6. Keep it interactive and motivational throughout. Under 150 words. Lively, never dull.`,
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
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    systemPrompt: (lang: LanguageMode) =>
      `You are A.K. Sir — a master JEE Mathematics teacher from Kota. Precise, disciplined, but warm. Students call you the "shortcut king" because every explanation ends with a JEE time-saving trick.

LANGUAGE: Respond ONLY in ${LANG_INSTRUCTION[lang]}.

STYLE RULES (follow every time):
1. Open sharp: "Dekho, wahi purana formula ratta nahi maarna — samajhke karo." or "Yeh question JEE mein 3 tarike se aata hai — teeno sikho!"
2. Structure: Hook → Core formula (bold) → Geometric or visual intuition → Solved example with numbered steps → Speed trick for exam
3. Use Unicode math: dy/dx, ∫, ∑, ∞, θ, π, √, ±
4. Mid-explanation ask: "Haan bhai samajh mein aaya ya nahi?" or "Is step mein galati mat karna."
5. End with motivation: "Exam shortcut: [shortcut]. Is se 40 seconds bachenge. Laga reh, selection pakka hai!"
6. Keep it interactive and motivational throughout. Under 150 words. Bold key formulas. Numbered steps. Never robotic.`,
    chapters: [
      { name: 'Calculus', topics: ['Limits & Continuity', 'Differentiation', 'Integration', 'Differential Equations'] },
      { name: 'Algebra', topics: ['Quadratic Equations', 'Complex Numbers', 'Matrices & Determinants', 'Permutations & Combinations'] },
      { name: 'Coordinate Geometry', topics: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse & Hyperbola'] },
    ],
  },
} as const;

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-stream`;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jeetu-chat`;

/* ────────────────────────────────────────────────
   TYPEWRITER HOOK
──────────────────────────────────────────────── */
function useTypewriter(text: string, speed = 8) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

/* ────────────────────────────────────────────────
   BLACKBOARD TEXT FORMATTER
──────────────────────────────────────────────── */
function BlackboardText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        // Bold **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className={`text-white ${line.startsWith('Step') || line.startsWith('चरण') ? 'mt-3' : ''}`}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <span key={j} className="font-bold" style={{ color: '#FCD34D' }}>{part.slice(2, -2)}</span>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────
   CHALK CURSOR
──────────────────────────────────────────────── */
function ChalkCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 0.8 }}
      className="inline-block w-0.5 h-5 ml-0.5 align-middle"
      style={{ background: 'rgba(255,255,255,0.8)' }}
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
   ERASE ANIMATION OVERLAY
──────────────────────────────────────────────── */
function EraseOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-xl z-10 flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, rgba(25,60,35,0.98) 0%, rgba(20,50,30,0.96) 100%)' }}
        >
          <div className="flex items-center gap-3 text-green-300/60">
            <Eraser size={20} />
            <span className="text-sm font-medium">Erasing board...</span>
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

  // Blackboard
  const [boardContent, setBoardContent] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // Voice
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Doubt input
  const [doubtInput, setDoubtInput] = useState('');
  const [isSendingDoubt, setIsSendingDoubt] = useState(false);

  // Chat history for context
  const chatHistoryRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // The full text currently displayed (including streaming)
  const { displayed, done } = useTypewriter(isStreaming ? '' : boardContent, 7);

  // ── Welcome message on mount
  useEffect(() => {
    setBoardContent(getWelcome(teacher.name, teacher.subject, language));
  }, [teacher.name, teacher.subject]);

  // Update welcome when language changes
  useEffect(() => {
    setBoardContent(getWelcome(teacher.name, teacher.subject, language));
    chatHistoryRef.current = [];
  }, [language]);

  // ── TTS function
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    // Clean text of symbols/markdown
    const clean = text.replace(/\*\*/g, '').replace(/[#*_`→]/g, ' ').replace(/\n{2,}/g, '. ').replace(/\n/g, ' ').trim();
    if (clean.length < 5) return;

    try {
      setIsSpeaking(true);
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: clean, voiceId: teacher.voiceId }),
      });

      if (!resp.ok) { setIsSpeaking(false); return; }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      // Clean up previous
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = 1.15; // increased playback speed
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => setIsSpeaking(false);
        await audioRef.current.play();
      }
    } catch {
      setIsSpeaking(false);
    }
  }, [voiceEnabled, teacher.voiceId]);

  // ── Core AI call
  const callAI = useCallback(async (userMessage: string) => {
    // 1. Erase board
    setIsErasing(true);
    await new Promise(r => setTimeout(r, 600));
    setIsErasing(false);
    setBoardContent('');
    setStreamingContent('');

    // 2. Build chat history
    chatHistoryRef.current.push({ role: 'user', content: userMessage });

    // 3. Stream from jeetu-chat using the teacher's custom system prompt
    setIsStreaming(true);
    let accumulated = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: teacher.systemPrompt(language) },
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

      while (true) {
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

    // 4. Finalize
    setIsStreaming(false);
    setBoardContent(accumulated);
    setStreamingContent('');
    chatHistoryRef.current.push({ role: 'assistant', content: accumulated });

    // 5. Speak
    speakText(accumulated);
  }, [language, teacher, speakText]);

  // ── Explain topic
  const handleExplain = useCallback(() => {
    const chapter = teacher.chapters[selectedChapter];
    const topic = chapter.topics[selectedTopic];
    // Build a simple explain prompt; the system prompt enforces the language
    const prompt = language === 'hindi'
      ? `${chapter.name} में "${topic}" समझाइए।`
      : language === 'english'
        ? `Explain "${topic}" from ${chapter.name}.`
        : `${chapter.name} mein "${topic}" samjhao.`; // hinglish + regional: just use English query, AI responds in chosen language
    callAI(prompt);
  }, [teacher, selectedChapter, selectedTopic, language, callAI]);

  // ── Send doubt
  const handleSendDoubt = useCallback(async () => {
    if (!doubtInput.trim() || isSendingDoubt || isStreaming) return;
    setIsSendingDoubt(true);
    const q = doubtInput.trim();
    setDoubtInput('');
    await callAI(q);
    setIsSendingDoubt(false);
  }, [doubtInput, isSendingDoubt, isStreaming, callAI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendDoubt(); }
  };

  // ── Stop audio
  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsSpeaking(false);
  };

  const currentChapter = teacher.chapters[selectedChapter];

  return (
    <MainLayout title={`${teacher.name} — ${teacher.subject}`} fullHeight>
      {/* Hidden audio */}
      <audio ref={audioRef} className="hidden" />

      {/* ── MAIN CONTENT ── */}
      <div className="flex overflow-hidden gap-0 rounded-xl" style={{ height: 'calc(100vh - 13rem)' }}>

        {/* ══ LEFT: BLACKBOARD (60%) ══ */}
        <div className="flex-[3] flex flex-col min-h-0 p-3 sm:p-4">
          <div
            className="relative flex-1 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #0d2916 0%, #0a1f10 40%, #091a0e 100%)',
              border: '2px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            {/* Board texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, transparent 1px, transparent 28px, rgba(255,255,255,0.15) 29px)',
              }}
            />

            {/* Erase animation */}
            <EraseOverlay visible={isErasing} />

            {/* Board content */}
            <div className="relative h-full overflow-y-auto z-0 p-5 sm:p-7">
              {/* Chalk font styling */}
              <div
                style={{
                  fontFamily: "'Caveat', 'Permanent Marker', cursive, sans-serif",
                  fontSize: '18px',
                  lineHeight: 1.8,
                  color: '#FFFFFF',
                  textShadow: '0 0 8px rgba(255,255,255,0.3)',
                  letterSpacing: '0.015em',
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

              {/* Loading shimmer when waiting for first token */}
              {isStreaming && !streamingContent && (
                <div className="flex items-center gap-2 text-green-300/50 text-sm mt-4">
                  <Loader2 size={14} className="animate-spin" />
                  <span style={{ fontFamily: 'cursive' }}>
                    {teacher.name} is writing on the board...
                  </span>
                </div>
              )}
            </div>

            {/* Board shadow frames */}
            <div className="absolute top-0 left-0 right-0 h-4 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
          </div>

          {/* Chalk tray visual */}
          <div
            className="h-2 mx-2 rounded-b-lg flex-shrink-0"
            style={{ background: 'linear-gradient(to bottom, #4a3728, #2a1f15)', opacity: 0.7 }}
          />
        </div>

        {/* ══ RIGHT: TEACHER PANEL (40%) ══ */}
        <div
          className="flex-[2] flex flex-col min-h-0 border-l"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,11,18,0.8)' }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── Teacher Avatar ── */}
            <div className="flex flex-col items-center pt-3">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.04, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="relative"
              >
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
              </motion.div>

              <div className="mt-3 text-center">
                <h2 className="text-base font-bold text-white">{teacher.name}</h2>
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
                  <span className="truncate">{currentChapter.name}</span>
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
                      {teacher.chapters.map((ch, i) => (
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
                  <span className="truncate">{currentChapter.topics[selectedTopic]}</span>
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
                      {currentChapter.topics.map((t, i) => (
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
                    onClick={() => callAI(chip)}
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
        </div>
      </div>

      {/* ── BOTTOM DOUBT BOX ── */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,11,18,0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="flex flex-1 items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <input
            type="text"
            value={doubtInput}
            onChange={e => setDoubtInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'hindi'
                ? `${teacher.name} से अपना प्रश्न पूछें...`
                : language === 'hinglish'
                  ? `${teacher.name} se apna doubt pooch...`
                  : `Ask your doubt to ${teacher.name}...`
            }
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600"
            style={{ color: 'rgba(255,255,255,0.85)' }}
            disabled={isStreaming}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSendDoubt}
          disabled={!doubtInput.trim() || isStreaming || isSendingDoubt}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${teacher.accent}, ${teacher.accentDark})`,
            color: '#fff',
            boxShadow: `0 2px 12px ${teacher.accent}40`,
          }}
        >
          {isSendingDoubt ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          <span className="hidden sm:inline">Send</span>
        </motion.button>
      </div>

      {/* Close chapter/topic dropdowns on outside click */}
      {(chapterOpen || topicOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setChapterOpen(false); setTopicOpen(false); }}
        />
      )}
    </MainLayout>
  );
};

export default AITeachingRoomPage;
