import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageMode = 'english' | 'hinglish' | 'hindi' | 'kannada' | 'telugu' | 'punjabi' | 'marathi' | 'tamil' | 'gujarati';

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  getGreeting: () => string;
  getMentorName: () => string;
}

const greetings: Record<LanguageMode, string> = {
  english: "Hello! I'm Jeetu Bhaiya, your personal JEE mentor.",
  hinglish: "Hey! Main hoon Jeetu Bhaiya, tumhara personal JEE mentor.",
  hindi: "नमस्ते! मैं जीतू भैया हूं, आपका JEE मेंटर।",
  kannada: "ನಮಸ್ಕಾರ! ನಾನು ಜೀತು ಭೈಯಾ, ನಿಮ್ಮ JEE ಮೆಂಟರ್.",
  telugu: "నమస్కారం! నేను జీతు భైయా, మీ JEE మెంటార్.",
  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਜੀਤੂ ਭਾਈ, ਤੁਹਾਡਾ JEE ਮੈਂਟਰ।",
  marathi: "नमस्कार! मी जीतू भैय्या, तुमचा JEE मेंटर.",
  tamil: "வணக்கம்! நான் ஜீது பையா, உங்கள் JEE வழிகாட்டி.",
  gujarati: "નમસ્તે! હું જીતુ ભૈયા, તમારો JEE મેન્ટર.",
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
  const getMentorName = () => 'Jeetu Bhaiya';

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
