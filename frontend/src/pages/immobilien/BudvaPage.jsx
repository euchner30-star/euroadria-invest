import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, TrendingUp, Building2, Waves, Sun, Palmtree,
  ArrowRight, CheckCircle, Clock, Euro, FileText, Phone, Shield
} from 'lucide-react';
import ExposeLeadGate from '../../components/ExposeLeadGate';
import SEO from '../../components/SEO';
import { useLanguage } from '../../context/LanguageContext';

const BudvaPage = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [exposeUrl, setExposeUrl] = useState('');
  const { lang } = useLanguage();
  const en = lang === 'en';

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/settings/downloads`)
      .then(res => res.json())
      .then(data => setExposeUrl(data.budva_expose_url || ''))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, phone: formData.phone,
          source: 'budva_expose', expose_name: 'Budva Exposé — Adriaküste-Investment-Analyse'
        })
      });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
    } catch (err) { console.error(err); }
    setSubmitted(true);
    setTimeout(() => { setShowContactForm(false); setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }, 3000);
  };

  const investmentHighlights = [
    { icon: TrendingUp, label: 'Investment-Score', value: '82/100', description: en ? 'Established Market' : 'Etablierter Markt' },
    { icon: Euro, label: en ? 'Average Price' : 'Durchschnittspreis', value: '€2.500-5.000/m²', description: en ? 'Premium Coastal Location' : 'Premium-Küstenlage' },
    { icon: Clock, label: en ? 'Time Horizon' : 'Zeithorizont', value: en ? '1-3 Years' : '1-3 Jahre', description: en ? 'Short-term' : 'Kurzfristig' },
    { icon: Building2, label: en ? 'Rental Yield' : 'Mietrendite', value: '5-8%', description: en ? 'Net p.a.' : 'Netto p.a.' },
  ];

  const infrastructureAdvantages = en ? [
    'Tourism hotspot with 2 million visitors/year',
    'Tivat Airport reachable in 20 min.',
    'UNESCO-protected Old Town',
    'Established rental infrastructure',
    'Luxury marina "Porto Montenegro" nearby',
    'New highway to Podgorica (2025)',
  ] : [
    'Tourismus-Hotspot mit 2 Mio. Besuchern/Jahr',
    'Flughafen Tivat in 20 Min. erreichbar',
    'UNESCO-geschützte Altstadt',
    'Etablierte Vermietungsinfrastruktur',
    'Luxus-Marina "Porto Montenegro" in Nähe',
    'Neue Schnellstraße nach Podgorica (2025)',
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="budva-page">
      <SEO 
        title={en ? "Real Estate Budva | Investment Montenegro" : "Immobilien Budva | Investment Montenegro"}
        description={en ? "Premium coastal real estate in Budva, Montenegro's tourism hotspot. Investment score 82/100, €2,500-5,000/m², 5-8% rental yield." : "Premium-Küstenimmobilien in Budva, Montenegros Tourismus-Hotspot. Investment-Score 82/100, €2.500-5.000/m², 5-8% Mietrendite."}
        url="/immobilien/budva"
      />

      <header className="pt-28 pb-16 px-6 bg-gradient-to-b from-ea-light to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4">
            <MapPin className="w-4 h-4" />
            <span>{en ? 'Montenegro • Adriatic Coast' : 'Montenegro • Adriaküste'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ea-dark mb-6 leading-tight">
            {en ? <>Budva: <span className="text-ea-gold">Coastal Metropolis</span><br />of the Adriatic</> : <>Budva: <span className="text-ea-gold">Küstenmetropole</span><br />der Adria</>}
          </h1>
          <p className="text-ea-dark/70 text-lg md:text-xl max-w-3xl mb-8 leading-relaxed">
            {en ? 'Budva is the touristic heart of Montenegro with a UNESCO-protected Old Town, 35 km of sandy beaches, and an established luxury real estate scene. Ideal location for rental income and value stability.' : 'Budva ist das touristische Herz Montenegros mit UNESCO-geschützter Altstadt, 35 km Sandstränden und einer etablierten Luxus-Immobilienszene. Idealer Standort für Mietertrag und Wertstabilität.'}
          </p>
          <div className="flex flex-wrap gap-4">
            {exposeUrl ? (
              <ExposeLeadGate exposeUrl={exposeUrl} exposeName="Budva Exposé" sourceId="budva_expose"
                buttonText={en ? "Download Exposé" : "Exposé herunterladen"}
                buttonClass="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2" />
            ) : (
              <button onClick={() => setShowContactForm(true)} className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2" data-testid="budva-contact-cta">
                <FileText className="w-5 h-5" />{en ? 'Request Exposé' : 'Exposé anfordern'}
              </button>
            )}
            <Link to="/infrastruktur-radar" className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center gap-2">
              <MapPin className="w-5 h-5" />{en ? 'Show on Map' : 'Auf Karte anzeigen'}
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-12 text-center">
            {en ? <>Investment <span className="text-ea-gold">Key Figures</span></> : <>Investment-<span className="text-ea-gold">Kennzahlen</span></>}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {investmentHighlights.map((item, idx) => (
              <div key={idx} className="bg-ea-light border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4"><item.icon className="w-7 h-7 text-ea-gold" /></div>
                <p className="text-2xl md:text-3xl font-bold text-ea-dark mb-1">{item.value}</p>
                <p className="text-ea-gold font-semibold text-sm mb-1">{item.label}</p>
                <p className="text-ea-dark/50 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-ea-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6">
                {en ? <>Why <span className="text-ea-gold">Budva</span>?</> : <>Warum <span className="text-ea-gold">Budva</span>?</>}
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Waves, title: en ? 'Premium Coastal Location' : 'Premium-Küstenlage', desc: en ? '35 km sandy beaches, crystal-clear water, Mediterranean climate.' : '35 km Sandstrände, kristallklares Wasser, mediterranes Klima.' },
                  { icon: Sun, title: en ? 'Established Tourism' : 'Etablierter Tourismus', desc: en ? '2 million visitors annually, 6-month season, high demand.' : '2 Mio. Besucher jährlich, 6-Monats-Saison, hohe Nachfrage.' },
                  { icon: Palmtree, title: 'Lifestyle-Destination', desc: en ? 'Nightlife, restaurants, marinas: the "Monaco of the Balkans".' : 'Nachtleben, Restaurants, Yachthäfen: das "Monaco des Balkans".' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 text-ea-gold" /></div>
                    <div><h3 className="font-semibold text-ea-dark mb-1">{item.title}</h3><p className="text-ea-dark/70 text-sm">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-ea-gold/20 rounded-xl p-6">
                <p className="text-ea-gold font-semibold text-sm mb-2">{en ? 'RETURN FOCUS' : 'RENDITE-FOKUS'}</p>
                <blockquote className="text-ea-dark/80 italic">
                  {en ? '"Budva offers the best combination of rental yield and value stability on the Montenegrin coast. Ideal for income-oriented investors."' : '"Budva bietet die beste Kombination aus Mietrendite und Wertstabilität an der montenegrinischen Küste. Ideal für ertragsorientierte Investoren."'}
                </blockquote>
                <p className="text-ea-dark/50 text-sm mt-3">EuroAdria Corporate Solutions Research Team</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-ea-dark mb-6">{en ? 'Infrastructure Advantages' : 'Infrastruktur-Vorteile'}</h3>
              <ul className="space-y-3">
                {infrastructureAdvantages.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-ea-gold flex-shrink-0" /><span className="text-ea-dark/80">{item}</span></li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link to="/infrastruktur-radar" className="flex items-center justify-between text-ea-gold font-semibold hover:text-ea-gold/80 transition-colors">
                  <span>{en ? 'More in Infrastructure Radar' : 'Mehr im Infrastruktur-Radar'}</span><ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white" id="apartments">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-4">
              {en ? <>Available <span className="text-ea-gold">Properties</span></> : <>Verfügbare <span className="text-ea-gold">Immobilien</span></>}
            </h2>
            <p className="text-ea-dark/70 max-w-2xl mx-auto">
              {en ? 'Apartments, penthouses and villas with sea views. Contact us for current off-market offers.' : 'Apartments, Penthouses und Villen mit Meerblick. Kontaktieren Sie uns für aktuelle Off-Market Angebote.'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-ea-light border border-dashed border-ea-gold/30 rounded-2xl p-8 text-center" data-testid={`apartment-placeholder-${idx}`}>
                <div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-ea-gold" /></div>
                <h3 className="text-lg font-semibold text-ea-dark mb-2">Coming Soon</h3>
                <p className="text-ea-dark/50 text-sm mb-4">{en ? 'Premium properties in preparation.' : 'Premium-Objekte in Vorbereitung.'}</p>
                <button onClick={() => setShowContactForm(true)} className="text-ea-gold font-semibold text-sm hover:text-ea-gold/80 transition-colors">
                  {en ? 'Express Interest →' : 'Interesse bekunden →'}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => setShowContactForm(true)} className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2 mx-auto">
              <Phone className="w-5 h-5" />{en ? 'Register for Offers' : 'Für Angebote registrieren'}
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-ea-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            {en ? <>Interested in <span className="text-ea-gold">Budva</span>?</> : <>Interesse an <span className="text-ea-gold">Budva</span>?</>}
          </h2>
          <p className="text-ea-light/70 text-lg mb-8 max-w-2xl mx-auto">
            {en ? 'Receive our coastal investment analysis with rental yield calculation, market comparison and due diligence checklist.' : 'Erhalten Sie unsere Küsten-Investment-Analyse mit Mietrendite-Kalkulation, Marktvergleich und Due-Diligence-Checkliste.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {exposeUrl ? (
              <ExposeLeadGate exposeUrl={exposeUrl} exposeName="Budva Exposé" sourceId="budva_expose"
                buttonText={en ? "Download Free Exposé" : "Kostenloses Exposé herunterladen"}
                buttonClass="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2" />
            ) : (
              <button onClick={() => setShowContactForm(true)} className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2">
                <FileText className="w-5 h-5" />{en ? 'Request Free Exposé' : 'Kostenloses Exposé anfordern'}
              </button>
            )}
            <Link to="/contact" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20">
              {en ? 'Schedule Consultation' : 'Beratungsgespräch vereinbaren'}<ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {showContactForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-ea-gold/10 rounded-xl flex items-center justify-center"><Waves className="w-6 h-6 text-ea-gold" /></div>
              <div>
                <h3 className="text-xl font-bold text-ea-dark">Budva Exposé</h3>
                <p className="text-ea-dark/60 text-sm">{en ? 'Coastal Investment Analysis' : 'Küsten-Investment-Analyse'}</p>
              </div>
            </div>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-ea-gold" /></div>
                <h4 className="text-xl font-bold text-ea-dark mb-2">{en ? 'Request received!' : 'Anfrage erhalten!'}</h4>
                <p className="text-ea-dark/70">{en ? 'We will send you the exposé within 24 hours.' : 'Wir senden Ihnen das Exposé innerhalb von 24 Stunden.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder={en ? "Your Name" : "Ihr Name"} />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">{en ? 'Email' : 'E-Mail'} *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder={en ? "your@email.com" : "ihre@email.de"} />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">{en ? 'Phone' : 'Telefon'}</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder="+49 123 456789" />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-sm font-medium mb-2">{en ? 'Message' : 'Nachricht'}</label>
                  <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none resize-none" placeholder={en ? "Your specific interests or questions..." : "Ihre spezifischen Interessen oder Fragen..."} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 px-6 py-3 bg-ea-light text-ea-dark font-semibold rounded-lg hover:bg-gray-200 transition-all">{en ? 'Cancel' : 'Abbrechen'}</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all">{en ? 'Request Exposé' : 'Exposé anfordern'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudvaPage;
