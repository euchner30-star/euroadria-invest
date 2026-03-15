import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Landmark, Coins, Shield, ArrowRight, 
  CheckCircle, Lock, Users, Globe, FileText, Send
} from 'lucide-react';
import ShareButtons from '../components/ShareButtons';
import CommentsSection from '../components/CommentsSection';
import SEO from '../components/SEO';

const SerbiaExecutivePage = () => {
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    interest: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission - in production, this would send to backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (field, value) => {
    setInquiryForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen" data-testid="serbia-executive-page">
      <SEO 
        title="Serbia Executive Access"
        description="Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen für strategische DACH-Investoren."
        url="/serbia-executive"
      />
      {/* Hero Section with Video */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/95 to-navy z-0" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-6">
                <Lock className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm font-medium">Exklusives Netzwerk</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                Serbia <span className="text-gold">Executive</span> Access
              </h1>
              
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu 
                Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen für 
                strategische DACH-Investoren.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="#inquiry" 
                  className="btn-gold flex items-center space-x-2"
                  data-testid="executive-inquiry-cta"
                >
                  <Shield className="w-5 h-5" />
                  <span>Executive Inquiry</span>
                </a>
                <Link 
                  to="/contact" 
                  className="glass-card px-6 py-3 text-white hover:text-gold transition-colors"
                >
                  Mehr erfahren
                </Link>
              </div>
            </div>

            {/* Video Section */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gold/30 shadow-2xl shadow-gold/10">
                <video
                  className="w-full h-full object-cover"
                  controls
                  poster="https://images.unsplash.com/photo-1580910527160-6891e5ed8784?w=800&q=80"
                  data-testid="intro-video"
                >
                  <source 
                    src="https://customer-assets.emergentagent.com/job_5874a7a2-9ac5-474a-877a-fb85aebf366b/artifacts/2lsij2u6_VID_20260315_103915_856.mp4" 
                    type="video/mp4" 
                  />
                  Ihr Browser unterstützt das Video-Tag nicht.
                </video>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/20 rounded-full blur-xl" />
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-navy-dark border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '15+', label: 'Jahre Erfahrung' },
              { value: '€500M+', label: 'Vermittelt' },
              { value: '120+', label: 'Executive Clients' },
              { value: '100%', label: 'Vertraulichkeit' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gold">{stat.value}</p>
                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Sections */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Exklusive <span className="text-gold">Leistungen</span>
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Strategische Vorteile durch privilegierten Zugang zu Serbiens wirtschaftlichen Entscheidungsträgern
            </p>
          </div>

          {/* Service Cards */}
          <div className="space-y-12">
            
            {/* Government Relations */}
            <div className="glass-card-strong p-8 md:p-12 rounded-2xl border border-gold/20" data-testid="service-government">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <Landmark className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Government Relations</h3>
                  <p className="text-gold font-medium">Zugang zu serbischen Behörden</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-white/80 leading-relaxed">
                    Direkter Draht zu Ministerien, Regulierungsbehörden und kommunalen Entscheidungsträgern. 
                    Wir öffnen Türen, die anderen verschlossen bleiben.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {[
                      'Ministerium für Wirtschaft',
                      'Investment & Export Agentur (RAS)',
                      'Regulierungsbehörden',
                      'Kommunale Verwaltungen',
                      'Handelskammer Serbien',
                      'Diplomatische Kontakte'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Infrastructure & PPP */}
            <div className="glass-card-strong p-8 md:p-12 rounded-2xl border border-gold/20" data-testid="service-infrastructure">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Infrastructure & PPP</h3>
                  <p className="text-gold font-medium">Großprojekte & Partnerschaften</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-white/80 leading-relaxed">
                    Zugang zu Serbiens ambitioniertem Infrastrukturprogramm. €15+ Milliarden werden in den 
                    kommenden Jahren investiert – mit Beteiligungsmöglichkeiten für strategische Partner.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gold font-semibold mb-2">Verkehr & Logistik</p>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>• Autobahn-Netzwerk (Korridor X, XI)</li>
                        <li>• Hochgeschwindigkeitsbahn Belgrad-Budapest</li>
                        <li>• Flughafen-Expansionen</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gold font-semibold mb-2">Energie & Utilities</p>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>• Erneuerbare Energien (Solar, Wind)</li>
                        <li>• Smart Grid Modernisierung</li>
                        <li>• Wasserwirtschaft</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gold font-semibold mb-2">Immobilien & Stadtentwicklung</p>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>• Belgrade Waterfront</li>
                        <li>• Novi Sad Innovation District</li>
                        <li>• Industrie- und Logistikparks</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gold font-semibold mb-2">Technologie & Digital</p>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>• IT-Parks und Tech-Hubs</li>
                        <li>• E-Government Initiativen</li>
                        <li>• Telekommunikation 5G</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incentives & Subsidies */}
            <div className="glass-card-strong p-8 md:p-12 rounded-2xl border border-gold/20" data-testid="service-incentives">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="w-16 h-16 bg-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Incentives & Subsidies</h3>
                  <p className="text-gold font-medium">Staatliche Förderungen</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-white/80 leading-relaxed">
                    Maximieren Sie Ihre Rendite durch optimale Nutzung serbischer Förderprogramme. 
                    Wir navigieren Sie durch das komplexe Antragsverfahren.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-center">
                      <p className="text-3xl font-bold text-gold">15%</p>
                      <p className="text-white/70 text-sm">Corporate Tax</p>
                      <p className="text-white/50 text-xs">(vs. 25-30% DACH)</p>
                    </div>
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-center">
                      <p className="text-3xl font-bold text-gold">€10k</p>
                      <p className="text-white/70 text-sm">pro Arbeitsplatz</p>
                      <p className="text-white/50 text-xs">Beschäftigungssubvention</p>
                    </div>
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-center">
                      <p className="text-3xl font-bold text-gold">0%</p>
                      <p className="text-white/70 text-sm">Zoll auf Equipment</p>
                      <p className="text-white/50 text-xs">in Freihandelszonen</p>
                    </div>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-3 mt-4">
                    {[
                      'Investitionssubventionen (20-40% der Kosten)',
                      'Steuererleichterungen für F&E',
                      'Grundstücksvergünstigungen',
                      'Zollfreibeträge',
                      'Ausbildungsförderung',
                      'Exportkredite'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Executive Access */}
      <section className="py-20 px-6 bg-navy-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-white mb-6">
                Warum <span className="text-gold">Executive Access</span>?
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Der serbische Markt bietet enorme Chancen – aber der Zugang zu den richtigen 
                Entscheidungsträgern macht den Unterschied zwischen Erfolg und Frustration.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Users, title: 'Persönliche Introductions', text: 'Direkter Zugang zu C-Level Kontakten und Regierungsvertretern' },
                  { icon: Globe, title: 'Kulturelle Brücke', text: 'Native Expertise überbrückt DACH-Balkan Geschäftskulturen' },
                  { icon: FileText, title: 'Due Diligence Support', text: 'Forensische Prüfung aller Partner und Projekte' },
                  { icon: Shield, title: 'Absolute Diskretion', text: 'Vertrauliche Behandlung aller Anfragen und Transaktionen' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-white/60 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8 rounded-2xl border border-gold/20">
              <p className="text-gold text-sm font-medium mb-4">EXKLUSIV FÜR DACH-INVESTOREN</p>
              <blockquote className="text-white/90 text-lg italic mb-6 leading-relaxed">
                "In Serbien entscheiden Beziehungen über Geschäftserfolg. EuroAdria hat uns in 
                drei Monaten Türen geöffnet, für die wir allein Jahre gebraucht hätten."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                  <span className="text-gold font-bold">MK</span>
                </div>
                <div>
                  <p className="text-white font-medium">M. Kaufmann</p>
                  <p className="text-white/50 text-sm">CEO, Mittelständisches Unternehmen, München</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Inquiry Form */}
      <section id="inquiry" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Vertrauliche Anfrage</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Executive <span className="text-gold">Inquiry</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Starten Sie Ihre vertrauliche Erstberatung. Alle Anfragen werden diskret behandelt 
              und innerhalb von 48 Stunden von unserem Senior Team bearbeitet.
            </p>
          </div>

          {submitted ? (
            <div className="glass-card-strong p-12 rounded-2xl border border-gold/30 text-center">
              <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Anfrage erhalten</h3>
              <p className="text-white/70 mb-6">
                Vielen Dank für Ihre Executive Inquiry. Ein Senior Partner wird sich innerhalb 
                von 48 Stunden vertraulich bei Ihnen melden.
              </p>
              <p className="text-gold text-sm">
                Referenznummer: EXE-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card-strong p-8 md:p-12 rounded-2xl border border-gold/30">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="Ihr vollständiger Name"
                    data-testid="inquiry-name"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Unternehmen</label>
                  <input
                    type="text"
                    value={inquiryForm.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="Firma / Organisation"
                    data-testid="inquiry-company"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="ihre@email.de"
                    data-testid="inquiry-email"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={inquiryForm.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                    placeholder="+49 ..."
                    data-testid="inquiry-phone"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">Interessengebiet *</label>
                <select
                  required
                  value={inquiryForm.interest}
                  onChange={(e) => handleChange('interest', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                  data-testid="inquiry-interest"
                >
                  <option value="" className="bg-navy">Bitte wählen...</option>
                  <option value="government" className="bg-navy">Government Relations</option>
                  <option value="infrastructure" className="bg-navy">Infrastructure & PPP</option>
                  <option value="incentives" className="bg-navy">Incentives & Subsidies</option>
                  <option value="market-entry" className="bg-navy">Markteintritt Serbien</option>
                  <option value="ma" className="bg-navy">M&A / Akquisitionen</option>
                  <option value="other" className="bg-navy">Anderes</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-white/80 text-sm mb-2">Ihre Nachricht *</label>
                <textarea
                  required
                  value={inquiryForm.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50 resize-none"
                  placeholder="Beschreiben Sie kurz Ihr Anliegen und Ihre Investmentinteressen..."
                  data-testid="inquiry-message"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-white/50 text-xs">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Alle Daten werden SSL-verschlüsselt übertragen und vertraulich behandelt.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold flex items-center space-x-2 px-8"
                  data-testid="inquiry-submit"
                >
                  {submitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{submitting ? 'Wird gesendet...' : 'Executive Inquiry absenden'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Share Buttons */}
      <section className="py-12 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <ShareButtons 
            title="Serbia Executive Access – Exklusives Netzwerk für DACH-Investoren"
            url={typeof window !== 'undefined' ? window.location.href : ''}
            excerpt="Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen."
          />
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <CommentsSection 
            articleId={9999} 
            articleSlug="serbia-executive-access" 
          />
        </div>
      </section>
    </div>
  );
};

export default SerbiaExecutivePage;
