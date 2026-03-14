import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

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
    // Mock submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-display font-bold text-white mb-6 hover-glow">
            Kontakt<span className="text-gold">aufnahme</span>
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Lassen Sie uns über Ihre Investment-Ziele sprechen. Wir freuen uns auf Ihre Nachricht.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Mail className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <a href="mailto:info@euroadria.com" className="text-white/70 hover:text-gold transition-colors text-sm">
                    info@euroadria.com
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <Phone className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Telefon</h3>
                  <a href="tel:+491234567890" className="text-white/70 hover:text-gold transition-colors text-sm">
                    +49 (0) 123 456789
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gold/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Adresse</h3>
                  <p className="text-white/70 text-sm">
                    München, Deutschland
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-3">Öffnungszeiten</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Montag - Freitag</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Samstag</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Sonntag</span>
                  <span>Geschlossen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              <h2 className="text-3xl font-display font-bold text-white mb-6">
                Senden Sie uns eine <span className="text-gold">Nachricht</span>
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-gold/20 border border-gold/40 rounded-lg">
                  <p className="text-white text-sm">
                    ✓ Vielen Dank für Ihre Nachricht! Wir melden uns in Kürze bei Ihnen.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all"
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all"
                      placeholder="ihre.email@beispiel.de"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all"
                      placeholder="+49 123 456789"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                      Betreff *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all"
                      placeholder="Worum geht es?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-all resize-none"
                    placeholder="Teilen Sie uns Ihre Fragen oder Ihr Anliegen mit..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full md:w-auto flex items-center justify-center space-x-2"
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
