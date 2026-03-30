import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, FileText, ArrowRight, Shield, TrendingUp, Building2, Plane } from 'lucide-react';
import SEO from '../components/SEO';

const InfrastrukturRadarPage = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Exposé Request:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setShowRequestForm(false);
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', region: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-ea-dark" data-testid="infrastruktur-radar-page">
      <SEO 
        title="Infrastruktur-Radar | Investment-Potenziale Montenegro"
        description="Exklusiver Infrastruktur-Radar für DACH-Investoren: Interaktive Karte mit Investment-Scores, Infrastrukturprojekten und Opportunitätszonen in Montenegro. Bar (92/100), Andrijevica (94/100), Podgorica (90/100)."
        url="/infrastruktur-radar"
        service={{
          name: "Montenegro Infrastruktur-Radar",
          description: "Interaktive Premium-Karte mit Investment-Scores, Zeithorizonten und EuroAdria-Opportunitätszonen für strategische Investments in Montenegro",
          type: "Investment Analysis Tool",
          areaServed: ["Montenegro"]
        }}
        faq={[
          {
            question: "Was zeigt der EuroAdria Infrastruktur-Radar?",
            answer: "Der Infrastruktur-Radar ist eine interaktive Premium-Karte mit Investment-Scores (0-100) für alle montenegrinischen Standorte, Infrastrukturprojekten (Straßen, Bahnen, Häfen, Flughäfen), Zeithorizonten (kurz-, mittel-, langfristig) und EuroAdria-Opportunitätszonen."
          },
          {
            question: "Welche Standorte haben den höchsten Investment-Score?",
            answer: "Laut EuroAdria V5-Analyse: Andrijevica (94/100) mit aggressivem Aufwertungshebel, Bar (92/100) als Küsten-Logistik-Hub, und Podgorica (90/100) als Hauptstadt mit diversifiziertem Potenzial."
          },
          {
            question: "Wie werden die Investment-Scores berechnet?",
            answer: "Die Scores basieren auf: Infrastruktur-Anbindung, EU-Konvergenz-Potenzial, Preisniveau vs. Entwicklungsperspektive, rechtliche Sicherheit, und EuroAdria-spezifische Due-Diligence-Faktoren."
          }
        ]}
      />

      {/* Hero Header */}
      <header className="pt-28 pb-8 px-6 bg-gradient-to-b from-ea-dark to-ea-navy">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-ea-gold/20 rounded-xl">
              <Map className="w-6 h-6 text-ea-gold" />
            </div>
            <span className="text-ea-gold text-sm font-semibold tracking-wider uppercase">Premium Investment Tool</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight">
            Exklusiver <span className="text-ea-gold">Infrastruktur-Radar</span>:<br />
            Investment-Potenziale in Montenegro
          </h1>
          
          <p className="text-ea-light/70 text-lg max-w-3xl mb-6">
            Interaktive Premium-Karte mit Investment-Scores, Infrastrukturprojekten und 
            EuroAdria-Opportunitätszonen. Analysieren Sie Standorte wie <strong className="text-ea-gold">Andrijevica (94/100)</strong>, 
            <strong className="text-ea-gold"> Bar (92/100)</strong> und <strong className="text-ea-gold"> Podgorica (90/100)</strong>.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-ea-gold" />
              <div>
                <div className="text-white font-semibold">23 Standorte</div>
                <div className="text-ea-light/50 text-xs">mit Investment-Score</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-ea-gold" />
              <div>
                <div className="text-white font-semibold">12 Infrastruktur-Projekte</div>
                <div className="text-ea-light/50 text-xs">Straßen, Bahnen, Häfen</div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <Shield className="w-5 h-5 text-ea-gold" />
              <div>
                <div className="text-white font-semibold">5 Opportunitätszonen</div>
                <div className="text-ea-light/50 text-xs">EuroAdria-exklusiv</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container - Full Width */}
      <section className="relative">
        <div className="w-full" style={{ height: 'calc(100vh - 100px)', minHeight: '600px' }}>
          <iframe
            src="/montenegro-map.html"
            title="Montenegro Infrastruktur-Radar"
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        </div>

        {/* Floating Lead Magnet Button */}
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-6 py-4 bg-ea-gold text-ea-dark font-bold rounded-xl shadow-2xl hover:bg-ea-gold/90 transition-all flex items-center gap-3 hover:scale-105"
            data-testid="expose-request-button"
          >
            <FileText className="w-5 h-5" />
            <span>Detailliertes Standort-Exposé anfordern</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Info Section Below Map */}
      <section className="py-12 px-6 bg-ea-navy">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-ea-gold font-semibold text-lg mb-3">Investment-Scores erklärt</h3>
              <ul className="space-y-2 text-ea-light/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                  85-100: Aggressiver Aufwertungshebel
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  70-84: Starker bis solider Hebel
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  Unter 70: Etablierter Case
                </li>
              </ul>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-ea-gold font-semibold text-lg mb-3">Use-Case Filter</h3>
              <ul className="space-y-2 text-ea-light/70 text-sm">
                <li>• <strong>Logistik:</strong> Häfen, Autobahnen, Lager</li>
                <li>• <strong>Residential:</strong> Wohnimmobilien</li>
                <li>• <strong>Tourismus:</strong> Hotels, Resorts</li>
                <li>• <strong>Relocation:</strong> Lebensqualität</li>
              </ul>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-ea-gold font-semibold text-lg mb-3">Zeithorizonte</h3>
              <ul className="space-y-2 text-ea-light/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  Kurzfristig: 0-3 Jahre
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  Mittelfristig: 3-7 Jahre
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  Langfristig: 7+ Jahre
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <p className="text-ea-light/70 mb-6">
              Interessiert an einem spezifischen Standort? Unsere Experten erstellen Ihnen ein detailliertes Exposé.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-8 py-4 bg-ea-gold text-ea-dark font-bold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Standort-Exposé anfordern
              </button>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20"
              >
                Beratungsgespräch vereinbaren
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Entfernungstabelle */}
          <div className="mt-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Entfernungen & Fahrzeiten</h2>
            <p className="text-ea-light/60 text-sm mb-6">Alle Verbindungen zwischen den wichtigsten Standorten in Montenegro</p>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm" data-testid="distance-table">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left text-ea-gold font-semibold px-4 py-3">Von</th>
                    <th className="text-left text-ea-gold font-semibold px-4 py-3">Nach</th>
                    <th className="text-right text-ea-gold font-semibold px-4 py-3">Entfernung</th>
                    <th className="text-right text-ea-gold font-semibold px-4 py-3">Fahrzeit</th>
                  </tr>
                </thead>
                <tbody className="text-ea-light/80">
                  {[
                    ['Podgorica','Danilovgrad','18 km','20 min'],
                    ['Podgorica','Zeta','12 km','12 min'],
                    ['Podgorica','Smokovac','8 km','10 min'],
                    ['Podgorica','Bar','53 km','50 min'],
                    ['Podgorica','Bijelo Polje','130 km','1h 50min'],
                    ['Danilovgrad','Nikšić','42 km','35 min'],
                    ['Smokovac','Mateševo','41 km','35 min'],
                    ['Mateševo','Kolašin','20 km','20 min'],
                    ['Kolašin','Andrijevica','60 km','1h 10min'],
                    ['Andrijevica','Berane','15 km','20 min'],
                    ['Berane','Bijelo Polje','30 km','35 min'],
                    ['Bijelo Polje','Pljevlja','55 km','50 min'],
                    ['Bijelo Polje','Boljare (Grenze SRB)','48 km','45 min'],
                    ['Nikšić','Žabljak','80 km','1h 30min'],
                    ['Žabljak','Šavnik','40 km','50 min'],
                    ['Pljevlja','Žabljak','70 km','1h 20min'],
                    ['Budva','Kotor','22 km','30 min'],
                    ['Budva','Sutomore','35 km','35 min'],
                    ['Budva','Herceg Novi','55 km','1h'],
                    ['Kotor','Tivat','9 km','15 min'],
                    ['Tivat','Herceg Novi','30 km','40 min'],
                    ['Bar','Ulcinj','26 km','30 min'],
                    ['Bar','Sutomore','8 km','10 min'],
                    ['Bar','Zaljevo','5 km','8 min'],
                    ['Ulcinj','Sukobin (Grenze ALB)','15 km','15 min'],
                    ['Sutomore','Virpazar','18 km','20 min'],
                    ['Virpazar','Zeta','35 km','30 min'],
                  ].map(([von, nach, km, zeit], i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-2.5 font-medium text-white">{von}</td>
                      <td className="px-4 py-2.5">{nach}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-ea-gold">{km}</td>
                      <td className="px-4 py-2.5 text-right">{zeit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ea-dark border border-ea-gold/30 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-ea-gold/20 rounded-xl">
                <FileText className="w-6 h-6 text-ea-gold" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Standort-Exposé anfordern</h3>
                <p className="text-ea-light/60 text-sm">Detaillierte Analyse für Ihren Wunschstandort</p>
              </div>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-ea-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-ea-gold" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Anfrage erhalten!</h4>
                <p className="text-ea-light/70">Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-ea-gold focus:outline-none"
                    placeholder="Ihr Name"
                  />
                </div>
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-ea-gold focus:outline-none"
                    placeholder="ihre@email.de"
                  />
                </div>
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-ea-gold focus:outline-none"
                    placeholder="+49 123 456789"
                  />
                </div>
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Interessierte Region *</label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-ea-gold focus:outline-none"
                  >
                    <option value="">Region auswählen...</option>
                    <option value="bar">Bar (Score: 92)</option>
                    <option value="andrijevica">Andrijevica (Score: 94)</option>
                    <option value="podgorica">Podgorica (Score: 90)</option>
                    <option value="budva">Budva</option>
                    <option value="kotor">Kotor</option>
                    <option value="herceg-novi">Herceg Novi</option>
                    <option value="tivat">Tivat</option>
                    <option value="niksic">Nikšić</option>
                    <option value="andere">Andere Region</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Ihre Nachricht</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-ea-gold focus:outline-none resize-none"
                    placeholder="Was interessiert Sie besonders? (Investment-Typ, Budget, Zeithorizont...)"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
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
  );
};

export default InfrastrukturRadarPage;
