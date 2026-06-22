import React, { createContext, useState, useContext, useCallback } from 'react';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

const translations = { de, en };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('euroadria_lang');
    return saved === 'de' ? 'de' : 'en';
  });

  const setLang = useCallback((newLang) => {
    const l = newLang === 'de' ? 'de' : 'en';
    setLangState(l);
    localStorage.setItem('euroadria_lang', l);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    if (val !== undefined) return val;
    // Fallback to English
    let fallback = translations.en;
    for (const k of keys) {
      fallback = fallback?.[k];
    }
    return fallback || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export default LanguageContext;
