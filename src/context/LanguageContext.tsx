'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, MONTHS_LOCALE, MONTHS_SHORT_LOCALE } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  getMonthName: (month: number) => string;
  getMonthShort: (month: number) => string;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hi'); // Default to Hindi for community feel

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('samiti_language') as Language;
      if (savedLang === 'en' || savedLang === 'hi') {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.error('Failed to read saved language:', e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('samiti_language', lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const t = (key: string, fallback?: string): string => {
    const item = TRANSLATIONS[key];
    if (!item) return fallback || key;
    return item[language] || item['en'] || fallback || key;
  };

  const getMonthName = (month: number): string => {
    const list = MONTHS_LOCALE[language] || MONTHS_LOCALE['en'];
    return list[month - 1] || `Month ${month}`;
  };

  const getMonthShort = (month: number): string => {
    const list = MONTHS_SHORT_LOCALE[language] || MONTHS_SHORT_LOCALE['en'];
    return list[month - 1] || `M${month}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getMonthName,
        getMonthShort,
        isHindi: language === 'hi'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
