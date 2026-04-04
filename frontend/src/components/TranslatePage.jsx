import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Cache for page-level translations
const pageCache = {};

const collectTextNodes = (element) => {
  const textNodes = [];
  const walk = (node) => {
    if (node.nodeType === 3 && node.textContent.trim().length > 1) {
      // Text node with meaningful content
      const text = node.textContent.trim();
      // Skip numbers-only, emails, URLs, phone numbers
      if (/^[\d\s.,€%+\-/()@:]+$/.test(text)) return;
      if (/^https?:\/\//.test(text)) return;
      if (/^[\w.-]+@[\w.-]+$/.test(text)) return;
      textNodes.push(node);
    } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(node.tagName)) {
      for (const child of node.childNodes) {
        walk(child);
      }
    }
  };
  walk(element);
  return textNodes;
};

const TranslatePage = ({ children }) => {
  const { lang } = useLanguage();
  const containerRef = useRef(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const originalTexts = useRef(new Map());

  const translatePage = useCallback(async () => {
    if (!containerRef.current || lang === 'de') return;

    const textNodes = collectTextNodes(containerRef.current);
    if (textNodes.length === 0) return;

    // Store originals
    textNodes.forEach(node => {
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent);
      }
    });

    // Collect texts to translate (deduplicated)
    const uniqueTexts = [...new Set(textNodes.map(n => originalTexts.current.get(n) || n.textContent))];
    const uncachedTexts = uniqueTexts.filter(t => !pageCache[`de>en:${t}`]);

    if (uncachedTexts.length > 0) {
      setIsTranslating(true);
      // Batch in chunks of 40
      for (let i = 0; i < uncachedTexts.length; i += 40) {
        const batch = uncachedTexts.slice(i, i + 40);
        try {
          const res = await fetch(`${API_URL}/api/translate/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: batch, source: 'de', target: 'en' }),
          });
          if (res.ok) {
            const data = await res.json();
            data.translations.forEach((tr, idx) => {
              pageCache[`de>en:${batch[idx]}`] = tr;
            });
          }
        } catch (e) {
          console.warn('Translation batch failed:', e);
        }
      }
      setIsTranslating(false);
    }

    // Apply translations
    textNodes.forEach(node => {
      const original = originalTexts.current.get(node) || node.textContent;
      const translated = pageCache[`de>en:${original}`];
      if (translated) {
        node.textContent = translated;
      }
    });
  }, [lang]);

  const restoreOriginals = useCallback(() => {
    originalTexts.current.forEach((original, node) => {
      if (node.parentNode) {
        node.textContent = original;
      }
    });
  }, []);

  useEffect(() => {
    if (lang === 'en') {
      // Wait for render, then translate
      const timer = setTimeout(translatePage, 300);
      return () => clearTimeout(timer);
    } else {
      restoreOriginals();
    }
  }, [lang, translatePage, restoreOriginals]);

  return (
    <div ref={containerRef}>
      {isTranslating && (
        <div className="fixed top-20 right-4 z-50 bg-ea-dark/90 text-ea-gold px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2" data-testid="translation-indicator">
          <div className="w-4 h-4 border-2 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
          Translating...
        </div>
      )}
      {children}
    </div>
  );
};

export default TranslatePage;
