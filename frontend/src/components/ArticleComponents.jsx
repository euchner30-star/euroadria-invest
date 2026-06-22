import React, { useState, useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Lead capture modal for Praxisleitfaden
export const LeadMagnetBox = () => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/downloads`)
      .then(res => res.json())
      .then(data => setDownloadUrl(data.praxisleitfaden_url || ''))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source: 'praxisleitfaden',
          expose_name: 'Practice Guide — Strategic Plan 2026'
        })
      });
      setSubmitted(true);
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="my-8 md:my-12 bg-ea-dark rounded-xl p-6 md:p-8 text-center" data-testid="lead-magnet-box">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 md:mb-4">
          Kostenloser <span className="text-ea-gold">Praxisleitfaden</span>
        </h3>
        <p className="text-ea-light/80 text-sm md:text-lg mb-4 md:mb-6 max-w-2xl mx-auto">
          Strategic Plan 2026: Market Entry & Investment Security Western Balkans.
          Expert knowledge on due diligence, tax structuring, banking and legal frameworks.
        </p>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-block px-6 py-3 md:px-8 md:py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm md:text-lg"
          data-testid="praxisleitfaden-download-btn"
        >
          Download for Free
        </button>
        <p className="text-ea-light/50 text-xs md:text-sm mt-3 md:mt-4">
          PDF — Confidential, for personal use only
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="lead-modal-overlay">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 relative shadow-2xl" data-testid="lead-modal">
            <button 
              onClick={() => { setShowModal(false); setSubmitted(false); setName(''); setEmail(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              data-testid="lead-modal-close"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-ea-gold" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ea-dark">Praxisleitfaden herunterladen</h3>
                    <p className="text-sm text-ea-dark/50">Kostenlos, keine Verpflichtung</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ea-dark mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ihr vollstaendiger Name"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ea-gold/30 focus:border-ea-gold outline-none text-ea-dark"
                      data-testid="lead-modal-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ea-dark mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ea-gold/30 focus:border-ea-gold outline-none text-ea-dark"
                      data-testid="lead-modal-email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="lead-modal-submit"
                  >
                    <Download className="w-4 h-4" />
                    {submitting ? 'Wird vorbereitet...' : 'Jetzt herunterladen'}
                  </button>
                  <p className="text-xs text-center text-ea-dark/40">
                    Mit dem Download stimmen Sie unserer <a href="/datenschutz" className="underline hover:text-ea-gold">Datenschutzerklaerung</a> zu.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-4" data-testid="lead-modal-success">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-ea-dark mb-2">Vielen Dank!</h3>
                <p className="text-sm text-ea-dark/60 mb-2">
                  Der Praxisleitfaden wurde an <strong>{email}</strong> gesendet.
                </p>
                <p className="text-xs text-ea-dark/40">
                  Pruefen Sie auch Ihren Spam-Ordner, falls die E-Mail nicht sofort ankommt.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Expert Tip Component
export const ExpertTipBox = ({ expertTip }) => {
  if (!expertTip || !expertTip.content) return null;
  
  // Use custom image from DB, or fallback to known experts
  const getExpertImage = (tip) => {
    const img = tip.image?.toLowerCase()?.trim();
    if (img) {
      // Short name shortcuts
      if (img === 'holger') return '/holger-kuhlmann.jpg';
      if (img === 'alex' || img === 'alexandra') return '/alexandra-kons.png';
      if (img === 'milena') return '/milena-bubanja.jpg';
      // Full URL or path
      return tip.image;
    }
    if (!tip.author) return null;
    const n = tip.author.toLowerCase();
    if (n.includes('holger')) return '/holger-kuhlmann.jpg';
    if (n.includes('milena')) return '/milena-bubanja.jpg';
    if (n.includes('alexandra')) return '/alexandra-kons.png';
    return null;
  };
  
  const expertImage = getExpertImage(expertTip);
  
  return (
    <div className="my-8 md:my-12 bg-gradient-to-br from-ea-dark to-ea-dark/90 rounded-xl p-6 md:p-8 border border-ea-gold/20">
      <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0 overflow-hidden bg-ea-gold/10 flex items-center justify-center">
          {expertImage ? (
            <img src={expertImage} alt={expertTip.author} className="w-full h-full object-cover object-top" />
          ) : (
            <span className="text-ea-gold text-sm md:text-base font-bold">
              {expertTip.author?.charAt(0) || 'E'}
            </span>
          )}
        </div>
        <div>
          <h4 className="text-ea-gold text-sm md:text-base font-semibold">{expertTip.title || 'Experten-Einschaetzung'}</h4>
          <p className="text-ea-light/50 text-xs md:text-sm">{expertTip.author}</p>
        </div>
      </div>
      <div
        className="text-ea-light/80 text-sm md:text-base leading-relaxed pl-0 md:pl-16"
        dangerouslySetInnerHTML={{ __html: expertTip.content }}
      />
    </div>
  );
};

export default LeadMagnetBox;

// Due Diligence Box Component
export const DueDiligenceBox = ({ title, content }) => {
  if (!content) return null;
  
  // Parse HTML list items into plain text array
  const items = content
    .replace(/<ul>|<\/ul>/g, '')
    .split(/<li>|<\/li>/)
    .map(item => item.replace(/✅\s?/g, '').trim())
    .filter(item => item.length > 0);
  
  return (
    <div className="my-8 md:my-12 bg-gradient-to-br from-ea-dark to-ea-dark/90 rounded-xl p-6 md:p-8 border border-ea-gold/20" data-testid="due-diligence-box">
      <h3 className="text-ea-gold text-lg md:text-xl font-semibold mb-4">{title || 'Due Diligence Checkliste'}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-ea-gold" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-ea-light/80 text-sm md:text-base">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
