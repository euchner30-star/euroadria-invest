import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Landmark, Coins, Shield, ArrowRight, 
  CheckCircle, Lock, Users, Globe, FileText, Send
} from 'lucide-react';
import ShareButtons from '../components/ShareButtons';
import CommentsSection from '../components/CommentsSection';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SerbiaExecutivePage = () => {
  const { lang } = useLanguage();
  const [inquiryForm, setInquiryForm] = useState({
    name: '', company: '', email: '', phone: '', interest: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone,
          subject: `Serbia Executive Inquiry: ${inquiryForm.interest || 'General'}${inquiryForm.company ? ', ' + inquiryForm.company : ''}`,
          message: `Company: ${inquiryForm.company || '-'}\nInterest: ${inquiryForm.interest || '-'}\n\n${inquiryForm.message || 'No further message.'}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setInquiryForm(prev => ({ ...prev, [field]: value }));
  };

  const en = lang === 'en';

  return (
    <div className="min-h-screen bg-white" data-testid="serbia-executive-page">
      <SEO 
        title="Serbia Executive Access - Exklusive Investoren-Kontakte"
        description="Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Regierungskontakte, PPP-Infrastrukturprojekte, bis zu 50% staatliche Förderung. Für DACH-Investoren ab €500.000."
        url="/serbia-executive"
        service={{
          name: "Serbia Executive Access",
          description: "Exklusiver Zugang zu serbischen Regierungskontakten, Infrastrukturprojekten und Investment-Incentives für internationale Investoren",
          type: "Investment Consulting",
          areaServed: ["Serbia", "Balkan Region"]
        }}
        faq={[
          {
            question: en ? "What does Serbia Executive Access offer?" : "Was bietet Serbia Executive Access?",
            answer: en ? "Direct access to Serbian ministries and development agencies, exclusive PPP infrastructure projects, up to 50% government investment subsidies, and a network of 120+ verified local partners." : "Direkter Zugang zu serbischen Ministerien und Entwicklungsagenturen, exklusive PPP-Infrastrukturprojekte, bis zu 50% staatliche Investitionsförderung, und ein Netzwerk von 120+ verifizierten lokalen Partnern."
          },
          {
            question: en ? "What investment incentives does Serbia offer?" : "Welche Investitionsförderungen gibt es in Serbien?",
            answer: en ? "Serbia offers up to 50% grants on investment costs, 10 years tax exemption for investments over 8.5 million EUR, free land in special economic zones, and wage subsidies of €3,000-10,000 per job." : "Serbien bietet bis zu 50% Zuschuss auf Investitionskosten, 10 Jahre Steuerbefreiung bei Investitionen über 8,5 Mio EUR, kostenlose Grundstücke in Sonderwirtschaftszonen, und Lohnkostenzuschüsse von €3.000-10.000 pro Arbeitsplatz."
          },
          {
            question: en ? "Can you buy real estate in Serbia with cryptocurrencies?" : "Kann man in Serbien Immobilien mit Kryptowährungen kaufen?",
            answer: en ? "Yes, through our regulated partner banks in Serbia, real estate transactions can also be processed via cryptocurrencies like Bitcoin and Ethereum. The transactions are fully legal, tax-documented, and carried out discreetly and efficiently." : "Ja, über unsere regulierten Partnerbanken in Serbien können Immobiliengeschäfte auch via Kryptowährungen wie Bitcoin und Ethereum abgewickelt werden. Die Transaktionen sind vollständig legal, steuerlich dokumentiert und werden diskret und effizient durchgeführt."
          },
          {
            question: en ? "Who is Serbia Executive Access for?" : "Für wen ist Serbia Executive Access geeignet?",
            answer: en ? "The program targets DACH investors with a minimum investment volume of €500,000 who seek access to off-market opportunities and direct government contacts in Serbia." : "Das Programm richtet sich an DACH-Investoren mit einem Mindestinvestitionsvolumen von €500.000, die Zugang zu Off-Market Opportunities und direkten Regierungskontakten in Serbien suchen."
          }
        ]}
      />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 bg-ea-dark">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-ea-gold/20 border border-ea-gold/40 rounded-full px-4 py-2 mb-6">
                <Lock className="w-4 h-4 text-ea-gold" />
                <span className="text-ea-gold text-sm font-medium">{en ? 'Exclusive Network' : 'Exklusives Netzwerk'}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-semibold font-bold text-white mb-6 leading-tight">
                Serbia <span className="text-ea-gold">Executive</span> Access
              </h1>
              
              <p className="text-xl text-ea-light/80 mb-8 leading-relaxed">
                {en ? "Privileged access to Serbia's economic elite. Exclusive contacts to government agencies, infrastructure projects, and state funding programs." : 'Privilegierter Zugang zu Serbiens wirtschaftlicher Elite. Exklusive Kontakte zu Regierungsstellen, Infrastrukturprojekten und staatlichen Förderprogrammen.'}
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#inquiry" className="px-6 py-3 bg-ea-gold text-white font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center gap-2" data-testid="executive-inquiry-cta">
                  <Shield className="w-5 h-5" />
                  <span>Executive Inquiry</span>
                </a>
                <Link to="/contact" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all">
                  {en ? 'Learn more' : 'Mehr erfahren'}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-ea-gold/30 shadow-2xl">
                <video className="w-full h-full object-cover" controls poster="https://images.unsplash.com/photo-1580910527160-6891e5ed8784?w=800&q=80" data-testid="intro-video">
                  <source src="https://customer-assets.emergentagent.com/job_5874a7a2-9ac5-474a-877a-fb85aebf366b/artifacts/2lsij2u6_VID_20260315_103915_856.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-ea-light border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '15+', label: en ? 'Years of Experience' : 'Jahre Erfahrung' },
              { value: '€500M+', label: en ? 'Brokered' : 'Vermittelt' },
              { value: '120+', label: 'Executive Clients' },
              { value: '100%', label: en ? 'Confidentiality' : 'Vertraulichkeit' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-ea-gold">{stat.value}</p>
                <p className="text-ea-dark/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold font-bold text-ea-dark mb-4">
              {en ? <>Exclusive <span className="text-ea-gold">Services</span></> : <>Exklusive <span className="text-ea-gold">Leistungen</span></>}
            </h2>
            <p className="text-ea-dark/70 text-lg max-w-2xl mx-auto">
              {en ? "Strategic advantages through privileged access to Serbia's economic decision-makers" : 'Strategische Vorteile durch privilegierten Zugang zu Serbiens wirtschaftlichen Entscheidungsträgern'}
            </p>
          </div>

          <div className="space-y-8">
            {/* Government Relations */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow" data-testid="service-government">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-4">
                    <Landmark className="w-8 h-8 text-ea-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-ea-dark mb-2">Government Relations</h3>
                  <p className="text-ea-gold font-medium">{en ? 'Access to Serbian authorities' : 'Zugang zu serbischen Behörden'}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-ea-dark/70 leading-relaxed">
                    {en ? 'Direct line to ministries, regulatory agencies, and municipal decision-makers.' : 'Direkter Draht zu Ministerien, Regulierungsbehörden und kommunalen Entscheidungsträgern.'}
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {(en ? ['Ministry of Economy', 'Investment & Export Agency (RAS)', 'Regulatory Authorities', 'Municipal Administrations', 'Chamber of Commerce Serbia', 'Diplomatic Contacts'] : ['Ministerium für Wirtschaft', 'Investment & Export Agentur (RAS)', 'Regulierungsbehörden', 'Kommunale Verwaltungen', 'Handelskammer Serbien', 'Diplomatische Kontakte']).map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-ea-dark/70">
                        <CheckCircle className="w-4 h-4 text-ea-gold flex-shrink-0" />
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
                  <div className="w-16 h-16 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-ea-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-ea-dark mb-2">Infrastructure & PPP</h3>
                  <p className="text-ea-gold font-medium">{en ? 'Major Projects & Partnerships' : 'Großprojekte & Partnerschaften'}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-ea-dark/70 leading-relaxed">
                    {en ? "Access to Serbia's €15+ billion infrastructure program with participation opportunities." : 'Zugang zu Serbiens €15+ Milliarden Infrastrukturprogramm mit Beteiligungsmöglichkeiten.'}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(en ? [
                      { title: 'Transport & Logistics', items: ['Highway Network', 'High-Speed Rail', 'Airport Expansions'] },
                      { title: 'Energy & Utilities', items: ['Renewable Energy', 'Smart Grid', 'Water Management'] },
                      { title: 'Real Estate', items: ['Belgrade Waterfront', 'Innovation Districts', 'Logistics Parks', 'Crypto settlement via partner banks'] },
                      { title: 'Technology', items: ['IT Parks', 'E-Government', '5G Infrastructure'] }
                    ] : [
                      { title: 'Transport & Logistics', items: ['Highway Network', 'High-Speed Rail', 'Airport Expansions'] },
                      { title: 'Energie & Utilities', items: ['Erneuerbare Energien', 'Smart Grid', 'Wasserwirtschaft'] },
                      { title: 'Real Estate', items: ['Belgrade Waterfront', 'Innovation Districts', 'Logistics Parks', 'Crypto Settlement via Partner Banks'] },
                      { title: 'Technologie', items: ['IT-Parks', 'E-Government', '5G Infrastruktur'] }
                    ]).map((cat, idx) => (
                      <div key={idx} className="bg-ea-light rounded-xl p-4">
                        <p className="text-ea-gold font-semibold mb-2">{cat.title}</p>
                        <ul className="text-ea-dark/70 text-sm space-y-1">
                          {cat.items.map((item, i) => <li key={i}>- {item}</li>)}
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
                  <div className="w-16 h-16 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-ea-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-ea-dark mb-2">Incentives & Subsidies</h3>
                  <p className="text-ea-gold font-medium">{en ? 'Government Subsidies' : 'Staatliche Förderungen'}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-ea-dark/70 leading-relaxed">
                    {en ? 'Maximize your returns through optimal use of Serbian subsidy programs.' : 'Maximieren Sie Ihre Rendite durch optimale Nutzung serbischer Förderprogramme.'}
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { value: '15%', label: 'Corporate Tax', sub: '(vs. 25-30% DACH)' },
                      { value: '€10k', label: en ? 'per job' : 'pro Arbeitsplatz', sub: en ? 'Subsidy' : 'Subvention' },
                      { value: '0%', label: en ? 'Duty on Equipment' : 'Zoll auf Equipment', sub: en ? 'Free trade zones' : 'Freihandelszonen' }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-ea-gold/5 border border-ea-gold/20 rounded-xl p-5 text-center">
                        <p className="text-3xl font-bold text-ea-gold">{stat.value}</p>
                        <p className="text-ea-dark/70 text-sm">{stat.label}</p>
                        <p className="text-gray-400 text-xs">{stat.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto Real Estate */}
            <div className="bg-gradient-to-br from-ea-dark to-ea-dark/95 border border-ea-gold/30 rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow" data-testid="service-crypto">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-ea-gold/20 rounded-xl flex items-center justify-center mb-4">
                    <Coins className="w-8 h-8 text-ea-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Crypto-Banking & Treasury</h3>
                  <p className="text-ea-gold font-medium">{en ? 'Crypto Structuring in Serbia' : 'Krypto-Strukturierung in Serbien'}</p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-white/80 leading-relaxed">
                    {en ? 'Through our partner banks in Serbia, we structure crypto, treasury, and banking solutions — legally secure, discreet, and outside EU regulations.' : 'Über unsere Partnerbanken in Serbien strukturieren wir Krypto-, Treasury- und Banking-Lösungen, rechtssicher, diskret und außerhalb der EU-Regularien.'}
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {(en ? ['Fiat-Crypto Bridge & Non-Resident Banking', 'Capital Extraction through real assets', 'Corporate Treasury for payment processing', 'Compliance by Design, 100% licensed'] : ['Fiat-Krypto-Brücke & Non-Resident Banking', 'Capital Extraction durch reale Werte', 'Corporate Treasury für Zahlungsverkehr', 'Compliance by Design, 100% lizenziert']).map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-white/70">
                        <CheckCircle className="w-4 h-4 text-ea-gold flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link to="/serbia-executive/crypto-banking" className="inline-flex items-center gap-2 px-6 py-3 bg-ea-gold text-white font-semibold rounded-lg hover:bg-ea-gold/80 transition-all" data-testid="crypto-banking-link">
                      {en ? 'Learn more' : 'Mehr erfahren'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Executive Access */}
      <section className="py-20 px-6 bg-ea-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-semibold font-bold text-ea-dark mb-6">
                {en ? <>Why <span className="text-ea-gold">Executive Access</span>?</> : <>Warum <span className="text-ea-gold">Executive Access</span>?</>}
              </h2>
              <p className="text-ea-dark/70 mb-8 leading-relaxed">
                {en ? 'The Serbian market offers enormous opportunities, but access to the right decision-makers makes all the difference.' : 'Der serbische Markt bietet enorme Chancen, aber der Zugang zu den richtigen Entscheidungsträgern macht den Unterschied.'}
              </p>
              <div className="space-y-4">
                {(en ? [
                  { icon: Users, title: 'Personal Introductions', text: 'Direct access to C-Level contacts' },
                  { icon: Globe, title: 'Cultural Bridge', text: 'Native expertise for DACH-Balkan business' },
                  { icon: FileText, title: 'Due Diligence Support', text: 'Forensic review of all partners' },
                  { icon: Shield, title: 'Absolute Discretion', text: 'Confidential handling of all inquiries' }
                ] : [
                  { icon: Users, title: 'Persönliche Introductions', text: 'Direkter Zugang zu C-Level Kontakten' },
                  { icon: Globe, title: 'Kulturelle Brücke', text: 'Native Expertise für DACH-Balkan Geschäft' },
                  { icon: FileText, title: 'Due Diligence Support', text: 'Forensische Prüfung aller Partner' },
                  { icon: Shield, title: 'Absolute Diskretion', text: 'Vertrauliche Behandlung aller Anfragen' }
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-ea-gold" />
                    </div>
                    <div>
                      <p className="text-ea-dark font-semibold">{item.title}</p>
                      <p className="text-ea-dark/60 text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
              <p className="text-ea-gold text-sm font-medium mb-4">{en ? 'EXCLUSIVE FOR DACH INVESTORS' : 'EXKLUSIV FÜR DACH-INVESTOREN'}</p>
              <blockquote className="text-ea-dark/80 text-lg italic mb-6 leading-relaxed">
                {en ? '"In Serbia, relationships determine business success. EuroAdria opened doors for us in three months that would have taken us years on our own."' : '"In Serbien entscheiden Beziehungen über Geschäftserfolg. EuroAdria Corporate Solutions hat uns in drei Monaten Türen geöffnet, für die wir allein Jahre gebraucht hätten."'}
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-ea-gold/10 rounded-full flex items-center justify-center">
                  <span className="text-ea-gold font-bold">MK</span>
                </div>
                <div>
                  <p className="text-ea-dark font-medium">M. Kaufmann</p>
                  <p className="text-ea-dark/60 text-sm">{en ? 'CEO, Mid-sized Company, Munich' : 'CEO, Mittelständisches Unternehmen, München'}</p>
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
            <div className="inline-flex items-center space-x-2 bg-ea-gold/10 border border-ea-gold/30 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-ea-gold" />
              <span className="text-ea-gold text-sm font-medium">{en ? 'Confidential Inquiry' : 'Vertrauliche Anfrage'}</span>
            </div>
            <h2 className="text-4xl font-semibold font-bold text-ea-dark mb-4">
              Executive <span className="text-ea-gold">Inquiry</span>
            </h2>
            <p className="text-ea-dark/70 max-w-2xl mx-auto">
              {en ? 'Share your inquiry with us. All requests are treated confidentially.' : 'Teilen Sie uns Ihr Anliegen mit. Alle Anfragen werden vertraulich behandelt.'}
            </p>
          </div>

          {submitted ? (
            <div className="bg-ea-gold/10 border border-ea-gold/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-ea-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-ea-dark mb-2">{en ? 'Inquiry received' : 'Anfrage erhalten'}</h3>
              <p className="text-ea-dark/70">
                {en ? 'Thank you for your interest. We will get back to you within 24 hours.' : 'Vielen Dank für Ihr Interesse. Wir melden uns innerhalb von 24 Stunden bei Ihnen.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">Name *</label>
                  <input type="text" required value={inquiryForm.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors" placeholder={en ? 'Your Name' : 'Ihr Name'} data-testid="inquiry-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">{en ? 'Company' : 'Unternehmen'}</label>
                  <input type="text" value={inquiryForm.company} onChange={(e) => handleChange('company', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors" placeholder={en ? 'Your Company' : 'Ihr Unternehmen'} data-testid="inquiry-company" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">{en ? 'Email *' : 'E-Mail *'}</label>
                  <input type="email" required value={inquiryForm.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors" placeholder={en ? 'your@email.com' : 'ihre@email.de'} data-testid="inquiry-email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">{en ? 'Phone' : 'Telefon'}</label>
                  <input type="tel" value={inquiryForm.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors" placeholder="+49..." data-testid="inquiry-phone" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ea-dark/80 mb-2">{en ? 'Area of Interest' : 'Interessengebiet'}</label>
                <select value={inquiryForm.interest} onChange={(e) => handleChange('interest', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors bg-white" data-testid="inquiry-interest">
                  <option value="">{en ? 'Please select...' : 'Bitte wählen...'}</option>
                  <option value="government">Government Relations</option>
                  <option value="infrastructure">Infrastructure & PPP</option>
                  <option value="incentives">Incentives & Subsidies</option>
                  <option value="crypto">{en ? 'Crypto Real Estate' : 'Crypto-Immobilienkauf'}</option>
                  <option value="other">{en ? 'Other' : 'Anderes'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ea-dark/80 mb-2">{en ? 'Message' : 'Nachricht'}</label>
                <textarea rows={4} value={inquiryForm.message} onChange={(e) => handleChange('message', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3eb489]/20 focus:border-ea-gold transition-colors resize-none" placeholder={en ? 'Briefly describe your inquiry...' : 'Beschreiben Sie kurz Ihr Anliegen...'} data-testid="inquiry-message" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-4 bg-ea-gold text-white font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center justify-center gap-2 disabled:opacity-70" data-testid="inquiry-submit">
                {submitting ? (en ? 'Sending...' : 'Wird gesendet...') : <><Send className="w-5 h-5" />{en ? 'Send Confidential Inquiry' : 'Vertrauliche Anfrage senden'}</>}
              </button>
              <p className="text-gray-400 text-xs text-center">
                {en ? 'All inquiries are treated confidentially. Your data will not be shared with third parties.' : 'Alle Anfragen werden vertraulich behandelt. Ihre Daten werden nicht an Dritte weitergegeben.'}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Share & Comments */}
      <section className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ShareButtons title="Serbia Executive Access | EuroAdria Corporate Solutions" url={window.location.href} excerpt={en ? "Privileged access to Serbia's economic elite." : "Privilegierter Zugang zu Serbiens wirtschaftlicher Elite."} />
          <div className="mt-12">
            <CommentsSection articleId={999} articleSlug="serbia-executive-access" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SerbiaExecutivePage;
