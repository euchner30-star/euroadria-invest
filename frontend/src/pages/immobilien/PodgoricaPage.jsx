import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, TrendingUp, Building2, Plane, Landmark, Briefcase,
  ArrowRight, CheckCircle, Clock, Euro, FileText, Phone, Shield
} from 'lucide-react';
import ExposeLeadGate from '../../components/ExposeLeadGate';
import SEO from '../../components/SEO';
import T from '../../components/T';
import { useLanguage } from '../../context/LanguageContext';
import TranslatePage from '../../components/TranslatePage';

const PodgoricaPage = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [exposeUrl, setExposeUrl] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/settings/downloads`)
      .then(res => res.json())
      .then(data => setExposeUrl(data.podgorica_expose_url || ''))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, phone: formData.phone,
          subject: 'Immobilien-Anfrage: Podgorica',
          message: formData.message || 'Interesse an Immobilien in Podgorica.'
        })
      });
    } catch (err) { console.error(err); }
    setSubmitted(true);
    setTimeout(() => {
      setShowContactForm(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const investmentHighlights = [
    { icon: TrendingUp, label: 'Investment-Score', value: '90/100', description: 'Diversifiziertes Potenzial' },
    { icon: Euro, label: 'Durchschnittspreis', value: '€1.500-3.000/m²', description: 'Hauptstadt-Niveau' },
    { icon: Clock, label: 'Zeithorizont', value: '2-5 Jahre', description: 'Kurz- bis mittelfristig' },
    { icon: Building2, label: 'Potenzial', value: '+35-55%', description: 'Erwartete Wertsteigerung' },
  ];

  const infrastructureAdvantages = [
    'Internationaler Flughafen (TGD) direkt in der Stadt',
    'KCCG - Klinisches Zentrum Montenegro (Medizintourismus)',
    'Regierungssitz & Verwaltungszentrum',
    'Universität mit 20.000+ Studenten',
    'Autobahn Bar-Boljare Knotenpunkt',
    'IT-Hub mit wachsender Tech-Szene',
  ];

  return (
    <TranslatePage>
    <div className="min-h-screen bg-white" data-testid="podgorica-page">
      <SEO 
        title="Immobilien Podgorica | Investment Montenegro"
        description="Hauptstadt-Immobilien in Podgorica, Montenegros Business-Hub. Investment-Score 90/100, €1.500-3.000/m², diversifiziertes Wertsteigerungspotenzial."
        url="/immobilien/podgorica"
      />

      {/* Hero Section */}
      <header className="pt-28 pb-16 px-6 bg-gradient-to-b from-ea-light to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">
            <MapPin className="w-4 h-4" />
            <span>Montenegro • Hauptstadt</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ea-dark mb-6 leading-tight">
            Podgorica: <span className="text-ea-gold">Business-Hub</span><br />
            & Hauptstadt
          </h1>
          
          <p className="text-ea-dark/70 text-lg md:text-xl max-w-3xl mb-8 leading-relaxed">
            Podgorica ist das wirtschaftliche und administrative Zentrum Montenegros. 
            Mit dem internationalen Flughafen, dem KCCG-Klinikzentrum und einer wachsenden 
            IT-Szene bietet die Hauptstadt stabile Renditen und diversifizierte Investment-Optionen.
          </p>

          <div className="flex flex-wrap gap-4">
            {exposeUrl ? (
              <ExposeLeadGate
                exposeUrl={exposeUrl}
                exposeName="Podgorica Exposé"
                sourceId="podgorica_expose"
                buttonText="Exposé herunterladen"
                buttonClass="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2"
              />
            ) : (
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2"
                data-testid="podgorica-contact-cta"
              >
                <FileText className="w-5 h-5" />
                Exposé anfordern
              </button>
            )}
            <Link
              to="/infrastruktur-radar"
              className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Auf Karte anzeigen
            </Link>
          </div>
        </div>
      </header>

      {/* Investment Highlights */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-12 text-center">
            Investment-<span className="text-ea-gold">Kennzahlen</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {investmentHighlights.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-ea-light border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-ea-gold" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-ea-dark mb-1">{item.value}</p>
                <p className="text-ea-gold font-semibold text-sm mb-1">{item.label}</p>
                <p className="text-ea-dark/50 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-16 px-6 bg-ea-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6">
                Warum <span className="text-ea-gold">Podgorica</span>?
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plane className="w-5 h-5 text-ea-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ea-dark mb-1">Internationaler Flughafen</h3>
                    <p className="text-ea-dark/70 text-sm">Direktverbindungen nach Frankfurt, Wien, Zürich, Istanbul und mehr.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-5 h-5 text-ea-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ea-dark mb-1">Verwaltungs- & Regierungssitz</h3>
                    <p className="text-ea-dark/70 text-sm">Alle Ministerien, Botschaften und internationale Organisationen.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-ea-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ea-dark mb-1">Wachsende Wirtschaft</h3>
                    <p className="text-ea-dark/70 text-sm">IT-Hub, Banken, internationale Konzerne: stabiler Arbeitsmarkt.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-ea-gold/20 rounded-xl p-6">
                <p className="text-ea-gold font-semibold text-sm mb-2">HAUPTSTADT-VORTEIL</p>
                <blockquote className="text-ea-dark/80 italic">
                  "Podgorica bietet als Hauptstadt die stabilsten Mietrenditen und die geringste 
                  Volatilität. Ideal für konservative Investoren mit Fokus auf langfristige Wertsicherung."
                </blockquote>
                <p className="text-ea-dark/50 text-sm mt-3">EuroAdria Research Team</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-ea-dark mb-6">Infrastruktur-Vorteile</h3>
              <ul className="space-y-3">
                {infrastructureAdvantages.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-ea-gold flex-shrink-0" />
                    <span className="text-ea-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to="/infrastruktur-radar"
                  className="flex items-center justify-between text-ea-gold font-semibold hover:text-ea-gold/80 transition-colors"
                >
                  <span>Mehr im Infrastruktur-Radar</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apartments Section */}
      <section className="py-16 px-6 bg-white" id="apartments">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-4">
              Verfügbare <span className="text-ea-gold">Immobilien</span>
            </h2>
            <p className="text-ea-dark/70 max-w-2xl mx-auto">
              Apartments, Büroflächen und Neubauprojekte im Stadtzentrum. Kontaktieren Sie uns für aktuelle Angebote.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((idx) => (
              <div 
                key={idx}
                className="bg-ea-light border border-dashed border-ea-gold/30 rounded-2xl p-8 text-center"
                data-testid={`apartment-placeholder-${idx}`}
              >
                <div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-ea-gold" />
                </div>
                <h3 className="text-lg font-semibold text-ea-dark mb-2">Coming Soon</h3>
                <p className="text-ea-dark/50 text-sm mb-4">
                  Hauptstadt-Objekte in Vorbereitung.
                </p>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-ea-gold font-semibold text-sm hover:text-ea-gold/80 transition-colors"
                >
                  Interesse bekunden →
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowContactForm(true)}
              className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2 mx-auto"
            >
              <Phone className="w-5 h-5" />
              Für Angebote registrieren
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-ea-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Interesse an <span className="text-ea-gold">Podgorica</span>?
          </h2>
          <p className="text-ea-light/70 text-lg mb-8 max-w-2xl mx-auto">
            Erhalten Sie unsere Hauptstadt-Investment-Analyse mit Mietrendite-Szenarien, 
            Standort-Vergleich und Business-District-Übersicht.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {exposeUrl ? (
              <ExposeLeadGate
                exposeUrl={exposeUrl}
                exposeName="Podgorica Exposé"
                sourceId="podgorica_expose"
                buttonText="Kostenloses Exposé herunterladen"
                buttonClass="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2"
              />
            ) : (
              <button
                onClick={() => setShowContactForm(true)}
                className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Kostenloses Exposé anfordern
              </button>
            )}
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
            >
              Beratungsgespräch vereinbaren
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-ea-gold/10 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-ea-gold" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ea-dark">Podgorica Exposé</h3>
                <p className="text-ea-dark/60 text-sm">Hauptstadt-Investment-Analyse</p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-ea-gold" />
                </div>
                <h4 className="text-xl font-bold text-ea-dark mb-2">Anfrage erhalten!</h4>
                <p className="text-ea-dark/70">Wir senden Ihnen das Exposé innerhalb von 24 Stunden.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none"
                    placeholder="Ihr Name"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none"
                    placeholder="ihre@email.de"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none"
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">Nachricht</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none resize-none"
                    placeholder="Ihre spezifischen Interessen oder Fragen..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-6 py-3 bg-ea-light text-ea-dark font-semibold rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all"
                  >
                    Exposé anfordern
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </TranslatePage>
  );
};

export default PodgoricaPage;
