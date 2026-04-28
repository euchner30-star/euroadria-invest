import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    // Trigger GA4 load immediately
    if (typeof window.loadGA4 === 'function') window.loadGA4();
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
    // Trigger GA4 load if analytics accepted
    if (preferences.analytics && typeof window.loadGA4 === 'function') window.loadGA4();
  };

  if (!showBanner) return null;

  return (
    <CookieConsentUI
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      preferences={preferences}
      setPreferences={setPreferences}
      handleAcceptAll={handleAcceptAll}
      handleAcceptNecessary={handleAcceptNecessary}
      handleSavePreferences={handleSavePreferences}
    />
  );
};

const CookieConsentUI = ({ showDetails, setShowDetails, preferences, setPreferences, handleAcceptAll, handleAcceptNecessary, handleSavePreferences }) => {
  const { t } = useLanguage();

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
            <h2 className="text-white font-semibold text-lg">{t('cookie.title')}</h2>
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
            {t('cookie.text')}
          </p>

          {showDetails ? (
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-ea-gold" />
                    <span className="font-semibold text-ea-dark">{t('cookie.necessary')}</span>
                  </div>
                  <span className="text-xs bg-ea-gold/20 text-ea-dark px-2 py-1 rounded-full">
                    {t('cookie.alwaysActive')}
                  </span>
                </div>
                <p className="text-ea-dark/60 text-sm">
                  {t('cookie.necessaryDesc')}
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ea-dark">{t('cookie.analytics')}</span>
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
                  {t('cookie.analyticsDesc')}
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-ea-light rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ea-dark">{t('cookie.marketing')}</span>
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
                  {t('cookie.marketingDesc')}
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
              {t('cookie.privacyLink')}
            </Link>
            <Link 
              to="/impressum" 
              className="text-ea-gold hover:underline"
            >
              {t('cookie.imprintLink')}
            </Link>
            <Link 
              to="/agb" 
              className="text-ea-gold hover:underline"
            >
              {t('cookie.termsLink')}
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
                  {t('cookie.save')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
                  data-testid="cookie-accept-all"
                >
                  {t('cookie.acceptAll')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-ea-dark font-medium rounded-lg hover:bg-gray-50 transition-all"
                  data-testid="cookie-show-details"
                >
                  {t('cookie.customize')}
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="flex-1 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                  data-testid="cookie-accept-necessary"
                >
                  {t('cookie.necessaryOnly')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
                  data-testid="cookie-accept-all-main"
                >
                  {t('cookie.acceptAll')}
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
