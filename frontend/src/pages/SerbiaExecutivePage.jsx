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
    name: '', company: '', email: '', phone: '', interest: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleChange = (field, value) => {
    setInquiryForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white" data-testid="serbia-executive-page">
      <SEO 
        title="Serbia Executive Access"
        description="Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen."
        url="/serbia-executive"
      />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-[#3eb489]/20 border border-[#3eb489]/40 rounded-full px-4 py-2 mb-6">
                <Lock className="w-4 h-4 text-[#3eb489]" />
                <span className="text-[#3eb489] text-sm font-medium">Exklusives Netzwerk</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
                Serbia <span className="text-[#3eb489]">Executive</span> Access
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu 
                Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#inquiry" className="px-6 py-3 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-[#b91c1c] transition-all flex items-center gap-2" data-testid="executive-inquiry-cta">
                  <Shield className="w-5 h-5" />
                  <span>Executive Inquiry</span>
                </a>
                <Link to="/contact" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all">
                  Mehr erfahren
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-[#3eb489]/30 shadow-2xl">
                <video className="w-full h-full object-cover" controls poster="https://images.unsplash.com/photo-1580910527160-6891e5ed8784?w=800&q=80" data-testid="intro-video">
                  <source src="https://customer-assets.emergentagent.com/job_5874a7a2-9ac5-474a-877a-fb85aebf366b/artifacts/2lsij2u6_VID_20260315_103915_856.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '15+', label: 'Jahre Erfahrung' },
              { value: '€500M+', label: 'Vermittelt' },
              { value: '120+', label: 'Executive Clients' },
              { value: '100%', label: 'Vertraulichkeit' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-[#3eb489]">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Exklusive <span className="text-[#3eb489]">Leistungen</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Strategische Vorteile durch privilegierten Zugang zu Serbiens wirtschaftlichen Entscheidungsträgern
            </p>
          </div>

          <div className="space-y-8">
            {/* Government Relations */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow" data-testid="service-government">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-[#3eb489]/10 rounded-xl flex items-center justify-center mb-4">
                    <Landmark className="w-8 h-8 text-[#3eb489]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Government Relations</h3>
                  <p className="text-[#3eb489] font-medium">Zugang zu serbischen Behörden</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Direkter Draht zu Ministerien, Regulierungsbehörden und kommunalen Entscheidungsträgern.
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {['Ministerium für Wirtschaft', 'Investment & Export Agentur (RAS)', 'Regulierungsbehörden', 'Kommunale Verwaltungen', 'Handelskammer Serbien', 'Diplomatische Kontakte'].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-[#3eb489] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow" data-testid="service-infrastructure">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-[#3eb489]/10 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-[#3eb489]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Infrastructure & PPP</h3>
                  <p className="text-[#3eb489] font-medium">Großprojekte & Partnerschaften</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Zugang zu Serbiens €15+ Milliarden Infrastrukturprogramm mit Beteiligungsmöglichkeiten.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: 'Verkehr & Logistik', items: ['Autobahn-Netzwerk', 'Hochgeschwindigkeitsbahn', 'Flughafen-Expansionen'] },
                      { title: 'Energie & Utilities', items: ['Erneuerbare Energien', 'Smart Grid', 'Wasserwirtschaft'] },
                      { title: 'Immobilien', items: ['Belgrade Waterfront', 'Innovation Districts', 'Logistikparks'] },
                      { title: 'Technologie', items: ['IT-Parks', 'E-Government', '5G Infrastruktur'] }
                    ].map((cat, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[#3eb489] font-semibold mb-2">{cat.title}</p>
                        <ul className="text-gray-600 text-sm space-y-1">
                          {cat.items.map((item, i) => <li key={i}>• {item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Incentives */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow" data-testid="service-incentives">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-[#3eb489]/10 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-[#3eb489]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Incentives & Subsidies</h3>
                  <p className="text-[#3eb489] font-medium">Staatliche Förderungen</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Maximieren Sie Ihre Rendite durch optimale Nutzung serbischer Förderprogramme.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { value: '15%', label: 'Corporate Tax', sub: '(vs. 25-30% DACH)' },
                      { value: '€10k', label: 'pro Arbeitsplatz', sub: 'Subvention' },
                      { value: '0%', label: 'Zoll auf Equipment', sub: 'Freihandelszonen' }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-[#3eb489]/5 border border-[#3eb489]/20 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-[#3eb489]">{stat.value}</p>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                        <p className="text-gray-400 text-xs">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Executive Access */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Warum <span className="text-[#3eb489]">Executive Access</span>?
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Der serbische Markt bietet enorme Chancen – aber der Zugang zu den richtigen 
                Entscheidungsträgern macht den Unterschied.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Users, title: 'Persönliche Introductions', text: 'Direkter Zugang zu C-Level Kontakten' },
                  { icon: Globe, title: 'Kulturelle Brücke', text: 'Native Expertise für DACH-Balkan Geschäft' },
                  { icon: FileText, title: 'Due Diligence Support', text: 'Forensische Prüfung aller Partner' },
                  { icon: Shield, title: 'Absolute Diskretion', text: 'Vertrauliche Behandlung aller Anfragen' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#3eb489]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#3eb489]" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{item.title}</p>
                      <p className="text-gray-500 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
              <p className="text-[#3eb489] text-sm font-medium mb-4">EXKLUSIV FÜR DACH-INVESTOREN</p>
              <blockquote className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                "In Serbien entscheiden Beziehungen über Geschäftserfolg. EuroAdria hat uns in 
                drei Monaten Türen geöffnet, für die wir allein Jahre gebraucht hätten."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#3eb489]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#3eb489] font-bold">MK</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">M. Kaufmann</p>
                  <p className="text-gray-500 text-sm">CEO, Mittelständisches Unternehmen, München</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-[#3eb489]/10 border border-[#3eb489]/30 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-[#3eb489]" />
              <span className="text-[#3eb489] text-sm font-medium">Vertrauliche Anfrage</span>
            </div>
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Executive <span className="text-[#3eb489]">Inquiry</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Teilen Sie uns Ihr Anliegen mit. Alle Anfragen werden vertraulich behandelt.
            </p>
          </div>

          {submitted ? (
            <div className="bg-[#3eb489]/10 border border-[#3eb489]/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-[#3eb489] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Anfrage erhalten</h3>
              <p className="text-gray-600">
                Vielen Dank für Ihr Interesse. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input type="text" required value={inquiryForm.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors" placeholder="Ihr Name" data-testid="inquiry-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unternehmen</label>
                  <input type="text" value={inquiryForm.company} onChange={(e) => handleChange('company', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors" placeholder="Ihr Unternehmen" data-testid="inquiry-company" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail *</label>
                  <input type="email" required value={inquiryForm.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors" placeholder="ihre@email.de" data-testid="inquiry-email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input type="tel" value={inquiryForm.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors" placeholder="+49..." data-testid="inquiry-phone" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interessengebiet</label>
                <select value={inquiryForm.interest} onChange={(e) => handleChange('interest', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors bg-white" data-testid="inquiry-interest">
                  <option value="">Bitte wählen...</option>
                  <option value="government">Government Relations</option>
                  <option value="infrastructure">Infrastructure & PPP</option>
                  <option value="incentives">Incentives & Subsidies</option>
                  <option value="other">Anderes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nachricht</label>
                <textarea rows={4} value={inquiryForm.message} onChange={(e) => handleChange('message', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-[#3eb489] transition-colors resize-none" placeholder="Beschreiben Sie kurz Ihr Anliegen..." data-testid="inquiry-message" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-4 bg-[#dc2626] text-white font-semibold rounded-lg hover:bg-[#b91c1c] transition-all flex items-center justify-center gap-2 disabled:opacity-70" data-testid="inquiry-submit">
                {submitting ? 'Wird gesendet...' : <><Send className="w-5 h-5" />Vertrauliche Anfrage senden</>}
              </button>
              <p className="text-gray-400 text-xs text-center">
                Alle Anfragen werden vertraulich behandelt. Ihre Daten werden nicht an Dritte weitergegeben.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Share & Comments */}
      <section className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ShareButtons title="Serbia Executive Access | EuroAdria" url={window.location.href} excerpt="Privilegierter Zugang zu Serbiens wirtschaftlicher Elite." />
          <div className="mt-12">
            <CommentsSection articleId="serbia-executive-access" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SerbiaExecutivePage;
