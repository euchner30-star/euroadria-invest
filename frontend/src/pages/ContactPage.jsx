import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyConsent: false
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus({ 
          type: 'success', 
          message: data.message || 'Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen.' 
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', privacyConsent: false });
      } else {
        setStatus({ 
          type: 'error', 
          message: 'Es gab einen Fehler. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per E-Mail.' 
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Verbindungsfehler. Bitte kontaktieren Sie uns direkt unter office@euroadria.me' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
      <SEO 
        title="Kontakt"
        description="Kontaktieren Sie EuroAdria für Ihre Investment-Beratung. Wir beraten Sie zu Immobilien, Unternehmensgründung und Relocation in der Adria-Region."
        url="/contact"
      />
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            Kontakt<span className="text-ea-gold">aufnahme</span>
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-2xl mx-auto">
            Lassen Sie uns über Ihre Investment-Ziele sprechen. Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-ea-light border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-ea-gold/10 rounded-lg">
                  <Mail className="w-6 h-6 text-ea-gold" />
                </div>
                <div>
                  <h3 className="text-ea-dark font-semibold mb-1">Email</h3>
                  <a href="mailto:office@euroadria.me" target="_blank" rel="noopener noreferrer" className="text-ea-dark/70 hover:text-ea-gold transition-colors text-sm">
                    office@euroadria.me
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-ea-light border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-ea-gold/10 rounded-lg">
                  <Phone className="w-6 h-6 text-ea-gold" />
                </div>
                <div>
                  <h3 className="text-ea-dark font-semibold mb-1">WhatsApp</h3>
                  <a href="https://wa.me/38268559776" className="text-ea-dark/70 hover:text-ea-gold transition-colors text-sm">
                    +382 68 559 776
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-ea-light border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-ea-gold/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-ea-gold" />
                </div>
                <div>
                  <h3 className="text-ea-dark font-semibold mb-1">Adresse</h3>
                  <p className="text-ea-dark/70 text-sm">
                    Marka Miljanova 12<br />
                    Novi Sad, Serbien
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ea-light border border-gray-200 rounded-xl p-6">
              <h3 className="text-ea-dark font-semibold mb-3">Öffnungszeiten</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ea-dark/70">
                  <span>Montag - Freitag</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between text-ea-dark/70">
                  <span>Samstag</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between text-ea-dark/70">
                  <span>Sonntag</span>
                  <span>Geschlossen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-ea-dark mb-6">
                Senden Sie uns eine <span className="text-ea-gold">Nachricht</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-ea-dark text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      data-testid="contact-name-input"
                      className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-ea-dark text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      data-testid="contact-email-input"
                      className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
                      placeholder="ihre.email@beispiel.de"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-ea-dark text-sm font-medium mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      data-testid="contact-phone-input"
                      className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
                      placeholder="+49 123 456789"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-ea-dark text-sm font-medium mb-2">
                      Betreff *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      data-testid="contact-subject-input"
                      className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
                      placeholder="Worum geht es?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-ea-dark text-sm font-medium mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    data-testid="contact-message-input"
                    className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all resize-none"
                    placeholder="Teilen Sie uns Ihre Fragen oder Ihr Anliegen mit..."
                  ></textarea>
                </div>

                {/* DSGVO Einwilligung */}
                <div className="bg-ea-light border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={handleChange}
                      required
                      data-testid="contact-privacy-consent"
                      className="mt-1 w-5 h-5 text-ea-gold bg-white border-gray-300 rounded focus:ring-ea-gold focus:ring-2 cursor-pointer"
                    />
                    <span className="text-ea-dark/70 text-sm leading-relaxed">
                      Ich habe die{' '}
                      <Link to="/datenschutz" className="text-ea-gold hover:underline font-medium" target="_blank">
                        Datenschutzerklärung
                      </Link>{' '}
                      gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage zu. *
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formData.privacyConsent || isSubmitting}
                  data-testid="contact-submit-button"
                  className={`w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 font-semibold rounded-lg transition-all ${
                    formData.privacyConsent && !isSubmitting
                      ? 'bg-ea-dark text-white hover:bg-ea-navy cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Wird gesendet...</span>
                    </>
                  ) : (
                    <>
                      <span>Nachricht senden</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {status.type === 'success' && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-700">{status.message}</p>
                  </div>
                )}
                {status.type === 'error' && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{status.message}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
