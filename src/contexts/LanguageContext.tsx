import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageMode = 'english' | 'hinglish' | 'hindi' | 'kannada' | 'telugu' | 'punjabi' | 'marathi' | 'tamil' | 'gujarati';

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  getGreeting: () => string;
  getMentorName: () => string;
}

const greetings: Record<LanguageMode, string> = {
  english: "Hello! I'm PrepEntrance, your AI Mentor.",
  hinglish: "Hey! Main hoon PrepEntrance, tumhara AI Mentor.",
  hindi: "नमस्ते! मैं PrepEntrance हूं, आपका AI मेंटर।",
  kannada: "ನಮಸ್ಕಾರ! ನಾನು PrepEntrance, ನಿಮ್ಮ AI ಮೆಂಟರ್.",
  telugu: "నమస్కారం! నేను PrepEntrance, మీ AI మెంటార్.",
  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ PrepEntrance, ਤੁਹਾਡਾ AI ਮੈਂਟਰ।",
  marathi: "नमस्कार! मी PrepEntrance, तुमचा AI मेंटर.",
  tamil: "வணக்கம்! நான் PrepEntrance, உங்கள் AI வழிகாட்டி.",
  gujarati: "નમસ્તે! હું PrepEntrance, તમારો AI મેન્ટર.",
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    // Always default to English; only change if user explicitly saved a preference
    const saved = localStorage.getItem('preferredLanguage') as LanguageMode | null;
    return (saved && saved in greetings) ? saved : 'english';
  });

  const setLanguage = (lang: LanguageMode) => {
    localStorage.setItem('preferredLanguage', lang);
    setLanguageState(lang);
  };

  const getGreeting = () => greetings[language];
  const getMentorName = () => 'AI Mentor';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getGreeting, getMentorName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
