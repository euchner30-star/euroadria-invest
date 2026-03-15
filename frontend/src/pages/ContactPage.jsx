import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import SEO from '../components/SEO';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
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
                  <a href="mailto:office@euroadria.me" className="text-ea-dark/70 hover:text-ea-gold transition-colors text-sm">
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

              {submitted && (
                <div className="mb-6 p-4 bg-ea-gold/10 border border-ea-gold/30 rounded-lg">
                  <p className="text-ea-dark text-sm">
                    Vielen Dank für Ihre Nachricht! Wir melden uns in Kürze bei Ihnen.
                  </p>
                </div>
              )}

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

                <button
                  type="submit"
                  data-testid="contact-submit-button"
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                >
                  <span>Nachricht senden</span>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
