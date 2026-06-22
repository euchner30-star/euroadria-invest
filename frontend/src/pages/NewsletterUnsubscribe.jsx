import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MailX, CheckCircle, Loader2 } from 'lucide-react';
import T from '../components/T';
import { useLanguage } from '../context/LanguageContext';


const NewsletterUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState('confirm'); // confirm | loading | done
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUnsubscribe = async () => {
    setStatus('loading');
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err) {
      console.error('Unsubscribe error:', err);
    }
    setStatus('done');
  };

  return (
    
    <div className="min-h-screen pt-28 pb-20 bg-white" data-testid="unsubscribe-page">
      <div className="max-w-lg mx-auto px-6 text-center">
        {status === 'done' ? (
          <div className="animate-fadeIn">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-ea-dark mb-4">Erfolgreich abgemeldet</h1>
            <p className="text-ea-dark/60 mb-2">
              Sie erhalten ab sofort keine Newsletter-E-Mails mehr von uns.
            </p>
            <p className="text-ea-dark/40 text-sm mb-8">
              If you change your mind, you can always re-subscribe on our website.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all"
            >
              Zur Startseite
            </a>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailX className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-ea-dark mb-4">Newsletter abbestellen</h1>
            <p className="text-ea-dark/60 mb-2">
              Do you really want to unsubscribe from the EuroAdria Corporate Solutions newsletter?
            </p>
            {email && (
              <p className="text-ea-dark/40 text-sm mb-8">
                E-Mail: <strong className="text-ea-dark/70">{email}</strong>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleUnsubscribe}
                disabled={status === 'loading'}
                className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="confirm-unsubscribe"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Wird abgemeldet...</>
                ) : (
                  'Ja, abbestellen'
                )}
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gray-100 text-ea-dark font-semibold rounded-lg hover:bg-gray-200 transition-all"
              >
                Abbrechen
              </a>
            </div>
            <p className="text-ea-dark/30 text-xs mt-6">
              You can re-subscribe at any time.
            </p>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default NewsletterUnsubscribe;
