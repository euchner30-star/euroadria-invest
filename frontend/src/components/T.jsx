import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Global translation cache (shared across all T components)
const translationCache = new Map();

// Load cache from localStorage on init
try {
  const saved = localStorage.getItem('ea_translations');
  if (saved) {
    const entries = JSON.parse(saved);
    entries.forEach(([k, v]) => translationCache.set(k, v));
  }
} catch {}

// Batch queue for pending translations
let batchQueue = [];
let batchTimer = null;

const processBatch = async () => {
  if (batchQueue.length === 0) return;

  const items = [...batchQueue];
  batchQueue = [];

  const texts = items.map(i => i.text);
  try {
    const res = await fetch(`${API_URL}/api/translate/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, source: 'de', target: 'en' }),
    });
    if (res.ok) {
      const data = await res.json();
      data.translations.forEach((translated, idx) => {
        const key = `de>en:${items[idx].text}`;
        translationCache.set(key, translated);
        items[idx].resolve(translated);
      });
      // Save to localStorage (keep last 500 entries)
      try {
        const entries = [...translationCache.entries()].slice(-500);
        localStorage.setItem('ea_translations', JSON.stringify(entries));
      } catch {}
    } else {
      items.forEach(i => i.resolve(i.text));
    }
  } catch {
    items.forEach(i => i.resolve(i.text));
  }
};

const queueTranslation = (text) => {
  return new Promise((resolve) => {
    const key = `de>en:${text}`;
    const cached = translationCache.get(key);
    if (cached) {
      resolve(cached);
      return;
    }
    batchQueue.push({ text, resolve });
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(processBatch, 100);
  });
};

/**
 * Auto-translate component. Wraps German text and translates to English when needed.
 * Usage: <T>German text</T>
 * For JSX with mixed content, only translates string children.
 */
const T = ({ children }) => {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(null);
  const textRef = useRef(typeof children === 'string' ? children : '');

  useEffect(() => {
    if (lang === 'de' || !children) {
      setTranslated(null);
      return;
    }

    const text = typeof children === 'string' ? children.trim() : '';
    if (!text) {
      setTranslated(null);
      return;
    }
    textRef.current = text;

    // Check cache immediately
    const key = `de>en:${text}`;
    const cached = translationCache.get(key);
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Queue for batch translation
    let cancelled = false;
    queueTranslation(text).then((result) => {
      if (!cancelled && textRef.current === text) {
        setTranslated(result);
      }
    });

    return () => { cancelled = true; };
  }, [lang, children]);

  if (lang === 'de' || typeof children !== 'string') return children;
  return translated || children;
};

export default T;
export { queueTranslation, translationCache };
