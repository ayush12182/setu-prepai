import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageMode = 'english' | 'hinglish' | 'hindi' | 'formal' | 'crisp';

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
  formal: "Good day. I am Jeetu, your dedicated JEE preparation guide.",
  crisp: "Jeetu Bhaiya here. Let's crack JEE."
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
