import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Cache for page-level translations
const pageCache = {};

const collectTextNodes = (element) => {
  const textNodes = [];
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      // Skip empty, numbers-only, emails, URLs, short fragments
      if (text.length < 3) return;
      if (/^[\d\s.,€%+\-/()@:#&|]+$/.test(text)) return;
      if (/^https?:\/\//.test(text)) return;
      if (/^[\w.-]+@[\w.-]+$/.test(text)) return;
      // Skip if parent already has data-no-translate
      if (node.parentElement?.closest('[data-no-translate]')) return;
      textNodes.push(node);
    } else if (node.nodeType === 1) {
      // Skip certain elements
      const tag = node.tagName;
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SVG'].includes(tag)) return;
      // Skip elements with data-no-translate
      if (node.hasAttribute('data-no-translate')) return;
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
  const hasTranslated = useRef(false);

  const translatePage = useCallback(async () => {
    if (!containerRef.current || lang === 'de') return;
    if (hasTranslated.current) return;

    // Small delay to let DOM settle
    const textNodes = collectTextNodes(containerRef.current);
    if (textNodes.length === 0) return;

    // Store originals
    textNodes.forEach(node => {
      if (!originalTexts.current.has(node)) {
        originalTexts.current.set(node, node.textContent);
      }
    });

    // Collect unique texts to translate
    const uniqueTexts = [...new Set(
      textNodes
        .map(n => (originalTexts.current.get(n) || n.textContent).trim())
        .filter(t => t.length >= 3)
    )];
    
    const uncachedTexts = uniqueTexts.filter(t => !pageCache[`de>en:${t}`]);

    if (uncachedTexts.length > 0) {
      setIsTranslating(true);
      // Batch in chunks of 30
      for (let i = 0; i < uncachedTexts.length; i += 30) {
        const batch = uncachedTexts.slice(i, i + 30);
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

    // Apply translations - preserve original whitespace
    textNodes.forEach(node => {
      const original = originalTexts.current.get(node) || node.textContent;
      const trimmed = original.trim();
      const translated = pageCache[`de>en:${trimmed}`];
      if (translated && translated !== trimmed) {
        // Preserve leading/trailing whitespace from original
        const leadingSpace = original.match(/^\s*/)[0];
        const trailingSpace = original.match(/\s*$/)[0];
        node.textContent = leadingSpace + translated + trailingSpace;
      }
    });

    hasTranslated.current = true;
  }, [lang]);

  const restoreOriginals = useCallback(() => {
    originalTexts.current.forEach((original, node) => {
      try {
        if (node.parentNode) {
          node.textContent = original;
        }
      } catch {}
    });
    hasTranslated.current = false;
  }, []);

  useEffect(() => {
    if (lang === 'en') {
      hasTranslated.current = false;
      const timer = setTimeout(translatePage, 500);
      return () => clearTimeout(timer);
    } else {
      restoreOriginals();
    }
  }, [lang, translatePage, restoreOriginals]);

  // Re-translate when children change (e.g., data loads)
  useEffect(() => {
    if (lang === 'en' && containerRef.current) {
      hasTranslated.current = false;
      const timer = setTimeout(translatePage, 1000);
      return () => clearTimeout(timer);
    }
  }, [children, lang, translatePage]);

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
