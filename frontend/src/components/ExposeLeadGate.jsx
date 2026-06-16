import React, { useState } from 'react';
import { FileText, X, CheckCircle, Loader2 } from 'lucide-react';

const ExposeLeadGate = ({ exposeUrl, exposeName, sourceId, buttonText, buttonClass, iconClass }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          source: sourceId,
          expose_name: exposeName
        })
      });
    } catch (err) {
      console.error('Lead submission error:', err);
    }
    setSubmitting(false);
    setUnlocked(true);
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
  };

  const handleDownload = () => {
    window.open(exposeUrl, '_blank');
    setTimeout(() => {
      setShowModal(false);
      setUnlocked(false);
      setFormData({ name: '', email: '', phone: '' });
    }, 1000);
  };

  if (!exposeUrl) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={buttonClass || "px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2"}
        data-testid={`expose-lead-btn-${sourceId}`}
      >
        <FileText className={iconClass || "w-5 h-5"} />
        {buttonText || 'Exposé herunterladen'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ea-gold/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-ea-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ea-dark" data-testid="expose-modal-title">{exposeName}</h3>
                  <p className="text-ea-dark/50 text-sm">Kostenloser Download</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setUnlocked(false); }}
                className="text-ea-dark/40 hover:text-ea-dark transition-colors"
                data-testid="expose-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unlocked ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-ea-dark mb-2">Vielen Dank!</h4>
                <p className="text-ea-dark/70 mb-6">Ihr Download ist bereit.</p>
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-3 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center justify-center gap-2"
                  data-testid="expose-download-final"
                >
                  <FileText className="w-5 h-5" />
                  Jetzt herunterladen
                </button>
              </div>
            ) : (
              <>
                <p className="text-ea-dark/60 text-sm mb-5">
                  Bitte geben Sie Ihre Kontaktdaten ein, um das Exposé kostenlos herunterzuladen.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-ea-dark/80 text-sm font-medium mb-1.5">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-ea-dark focus:border-ea-gold focus:outline-none"
                      placeholder="Ihr Name"
                      data-testid="expose-lead-name"
                    />
                  </div>
                  <div>
                    <label className="block text-ea-dark/80 text-sm font-medium mb-1.5">E-Mail *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-ea-dark focus:border-ea-gold focus:outline-none"
                      placeholder="ihre@email.de"
                      data-testid="expose-lead-email"
                    />
                  </div>
                  <div>
                    <label className="block text-ea-dark/80 text-sm font-medium mb-1.5">Telefon (optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-ea-dark focus:border-ea-gold focus:outline-none"
                      placeholder="+49 123 456789"
                      data-testid="expose-lead-phone"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="expose-lead-submit"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Wird verarbeitet...</>
                    ) : (
                      <><FileText className="w-5 h-5" /> Exposé freischalten</>
                    )}
                  </button>
                  <p className="text-ea-dark/40 text-xs text-center">
                    Ihre Daten werden vertraulich behandelt. Kein Spam.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ExposeLeadGate;
