import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageMode = 'english' | 'hinglish' | 'hindi' | 'kannada' | 'telugu' | 'punjabi';

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
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageMode>('english');

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
