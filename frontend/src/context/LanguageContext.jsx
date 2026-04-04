import React, { createContext, useState, useContext, useCallback } from 'react';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

const translations = { de, en };

const LanguageContext = createContext();

// Detect browser language: if browser is set to English, use 'en', otherwise 'de'
const detectBrowserLanguage = () => {
  try {
    const stored = localStorage.getItem('ea_lang');
    if (stored) return stored;
  } catch {}
  
  try {
    const browserLang = navigator.language || navigator.userLanguage || '';
    if (browserLang.startsWith('en')) return 'en';
  } catch {}
  
  return 'de';
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(detectBrowserLanguage);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try { localStorage.setItem('ea_lang', newLang); } catch {}
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    if (val !== undefined) return val;
    // Fallback to German
    let fallback = translations.de;
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
