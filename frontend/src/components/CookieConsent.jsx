import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, Shield } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'euroadria_cookie_consent';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-end justify-center p-4 bg-black/30 backdrop-blur-sm"
      data-testid="cookie-consent-banner"
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom duration-500">
        {/* Header */}
        <div className="bg-ea-dark px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-ea-gold/20 rounded-lg">
              <Cookie className="w-5 h-5 text-ea-gold" />
            </div>
            <h2 className="text-white font-semibold text-lg">Cookie-Einstellungen</h2>
          </div>
          <button 
            onClick={handleAcceptNecessary}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-ea-dark/70 mb-6">
            Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
            Einige Cookies sind für den Betrieb der Website unbedingt erforderlich, während andere 
            uns helfen, die Website und Ihre Erfahrung zu verbessern.
          </p>

          {showDetails ? (
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-ea-gold" />
                    <span className="font-semibold text-ea-dark">Notwendige Cookies</span>
                  </div>
                  <span className="text-xs bg-ea-gold/20 text-ea-dark px-2 py-1 rounded-full">
                    Immer aktiv
                  </span>
                </div>
                <p className="text-ea-dark/60 text-sm">
                  Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich 
                  und können nicht deaktiviert werden.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ea-dark">Analyse-Cookies</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                      className="sr-only peer"
                      data-testid="analytics-cookie-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ea-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ea-gold"></div>
                  </label>
                </div>
                <p className="text-ea-dark/60 text-sm">
                  Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, 
                  indem sie Informationen anonym sammeln und melden.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ea-dark">Marketing-Cookies</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                      className="sr-only peer"
                      data-testid="marketing-cookie-toggle"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ea-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ea-gold"></div>
                  </label>
                </div>
                <p className="text-ea-dark/60 text-sm">
                  Diese Cookies werden verwendet, um Werbung relevanter für Sie zu machen und 
                  die Anzahl der Werbeanzeigen zu begrenzen.
                </p>
              </div>
            </div>
          ) : null}

          {/* Links */}
          <div className="flex items-center space-x-4 text-sm mb-6">
            <Link 
              to="/datenschutz" 
              className="text-ea-gold hover:underline"
              data-testid="cookie-privacy-link"
            >
              Datenschutzerklärung
            </Link>
            <Link 
              to="/impressum" 
              className="text-ea-gold hover:underline"
            >
              Impressum
            </Link>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showDetails ? (
              <>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                  data-testid="cookie-save-preferences"
                >
                  Auswahl speichern
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
                  data-testid="cookie-accept-all"
                >
                  Alle akzeptieren
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-ea-dark font-medium rounded-lg hover:bg-gray-50 transition-all"
                  data-testid="cookie-show-details"
                >
                  Einstellungen anpassen
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="flex-1 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                  data-testid="cookie-accept-necessary"
                >
                  Nur notwendige
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
                  data-testid="cookie-accept-all-main"
                >
                  Alle akzeptieren
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
