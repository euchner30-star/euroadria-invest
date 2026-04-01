import React, { useState, useRef } from 'react';
import { Mail, CheckCircle, Loader2, ArrowRight } from 'lucide-react';

const NewsletterSignup = ({ variant = 'inline' }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const sectionRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || null })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
        setName('');
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        setStatus('error');
        setMessage(data.detail || 'Fehler bei der Anmeldung');
      }
    } catch {
      setStatus('error');
      setMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }
  };

  if (status === 'success') {
    return (
      <div ref={sectionRef} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4" data-testid="newsletter-success">
        <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
        <p className="text-green-700 font-medium">{message}</p>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className="bg-ea-dark rounded-2xl p-8 md:p-12" data-testid="newsletter-section">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-ea-gold/10 rounded-xl mb-5">
            <Mail className="w-7 h-7 text-ea-gold" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Newsletter abonnieren
          </h3>
          <p className="text-white/60 mb-8 text-base">
            Erhalten Sie exklusive Investment-Insights, Marktanalysen und Neuigkeiten zu Immobilien am Balkan.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ihr Name"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-ea-gold"
              data-testid="newsletter-name"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ihre E-Mail *"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-ea-gold"
              data-testid="newsletter-email"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-ea-gold text-ea-dark font-bold px-6 py-3.5 rounded-xl hover:bg-ea-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              data-testid="newsletter-submit"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><span>Anmelden</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
          {status === 'error' && (
            <p className="text-red-400 text-sm mt-3">{message}</p>
          )}
          <p className="text-white/30 text-xs mt-4">Kein Spam. Jederzeit abbestellbar. Ihre Daten sind sicher.</p>
        </div>
      </div>
    );
  }

  // Inline variant (for footer etc.)
  return (
    <form onSubmit={handleSubmit} className="flex gap-2" data-testid="newsletter-inline">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ihre E-Mail"
        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-ea-gold"
        data-testid="newsletter-email-inline"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-ea-gold text-ea-dark font-semibold px-4 py-2.5 rounded-lg hover:bg-ea-gold/90 transition-all disabled:opacity-50 text-sm"
        data-testid="newsletter-submit-inline"
      >
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Anmelden'}
      </button>
    </form>
  );
};

export default NewsletterSignup;
