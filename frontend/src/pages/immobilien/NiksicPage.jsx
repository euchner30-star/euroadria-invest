import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, Building2, Factory, Zap, Train, ArrowRight, CheckCircle, Clock, Euro, FileText, Phone, Shield } from 'lucide-react';
import ExposeLeadGate from '../../components/ExposeLeadGate';
import SEO from '../../components/SEO';
import { useLanguage } from '../../context/LanguageContext';

const NiksicPage = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [exposeUrl, setExposeUrl] = useState('');
  const { lang } = useLanguage();
  const en = lang === 'en';

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/settings/downloads`).then(r=>r.json()).then(d=>setExposeUrl(d.niksic_expose_url||'')).catch(()=>{});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:formData.name, email:formData.email, phone:formData.phone, subject:'Real Estate Inquiry: Nikšić', message:formData.message||'Interest in Nikšić properties' }) }); } catch(err){console.error(err);}
    setSubmitted(true);
    setTimeout(()=>{setShowContactForm(false);setSubmitted(false);setFormData({name:'',email:'',phone:'',message:''});},3000);
  };

  const investmentHighlights = [
    { icon: TrendingUp, label: 'Investment-Score', value: '85/100', description: en ? 'Strong Appreciation Leverage' : 'Starker Aufwertungshebel' },
    { icon: Euro, label: en ? 'Average Price' : 'Durchschnittspreis', value: '€600-1.200/m²', description: en ? 'Lowest Level' : 'Günstigstes Niveau' },
    { icon: Clock, label: en ? 'Time Horizon' : 'Zeithorizont', value: en ? '5-10 Years' : '5-10 Jahre', description: en ? 'Long-term' : 'Langfristig' },
    { icon: Building2, label: en ? 'Potential' : 'Potenzial', value: '+80-120%', description: en ? 'Expected Appreciation' : 'Erwartete Wertsteigerung' },
  ];

  const infrastructureAdvantages = en ? [
    "Montenegro's second largest city (70,000 pop.)", 'Direct rail connection to Podgorica (2026)', 'Highway Bar-Boljare reachable in 10 min.', 'Industrial zone with special economic status', 'University city with young labor market', 'Lowest cost of living in Montenegro',
  ] : [
    'Zweitgrößte Stadt Montenegros (70.000 Ew.)', 'Direkte Bahnverbindung nach Podgorica (2026)', 'Autobahn Bar-Boljare in 10 Min. erreichbar', 'Industriezone mit Sonderwirtschaftsstatus', 'Universitätsstadt mit jungem Arbeitsmarkt', 'Niedrigste Lebenshaltungskosten in Montenegro',
  ];

  const whyItems = [
    { icon: Factory, title: en ? 'Industrial Hub' : 'Industrieller Hub', desc: en ? 'Steel works, brewery, aluminum processing: stable jobs.' : 'Stahlwerk, Brauerei, Aluminiumverarbeitung: stabile Arbeitsplätze.' },
    { icon: Train, title: en ? 'Infrastructure Expansion' : 'Infrastruktur-Ausbau', desc: en ? 'New rail line to Podgorica (2026) will halve commute time.' : 'Neue Bahnstrecke nach Podgorica (2026) wird Pendelzeit halbieren.' },
    { icon: Zap, title: en ? 'Special Economic Zone' : 'Sonderwirtschaftszone', desc: en ? 'Tax incentives and subsidies for commercial properties.' : 'Steuervergünstigungen und Förderungen für Gewerbeimmobilien.' },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="niksic-page">
      <SEO title={en?"Real Estate Nikšić | Investment Montenegro":"Immobilien Nikšić | Investment Montenegro"} description={en?"Affordable real estate in Nikšić, Montenegro's industrial center. Investment score 85/100, €600-1,200/m², +80-120% appreciation potential.":"Günstige Immobilien in Nikšić, Montenegros Industriezentrum. Investment-Score 85/100, €600-1.200/m², +80-120% Wertsteigerungspotenzial."} url="/immobilien/niksic" />

      <header className="pt-28 pb-16 px-6 bg-gradient-to-b from-ea-light to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-ea-gold text-sm font-semibold tracking-wider uppercase mb-4"><MapPin className="w-4 h-4" /><span>{en?'Montenegro • Central Region':'Montenegro • Zentralregion'}</span></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ea-dark mb-6 leading-tight">{en?<>Nikšić: <span className="text-ea-gold">Industrial Center</span><br/>with a Future</>:<>Nikšić: <span className="text-ea-gold">Industriezentrum</span><br/>mit Zukunft</>}</h1>
          <p className="text-ea-dark/70 text-lg md:text-xl max-w-3xl mb-8 leading-relaxed">{en?"Nikšić is Montenegro's second largest city and industrial heart. With the lowest property prices, special economic zones and planned rail connections, the city offers enormous appreciation potential.":"Nikšić ist Montenegros zweitgrößte Stadt und industrielles Herz. Mit den niedrigsten Immobilienpreisen, Sonderwirtschaftszonen und geplanter Bahnanbindung bietet die Stadt enormes Aufwertungspotenzial."}</p>
          <div className="flex flex-wrap gap-4">
            {exposeUrl?<ExposeLeadGate exposeUrl={exposeUrl} exposeName="Nikšić Exposé" sourceId="niksic_expose" buttonText={en?"Download Exposé":"Exposé herunterladen"} buttonClass="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2"/>:<button onClick={()=>setShowContactForm(true)} className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all flex items-center gap-2" data-testid="niksic-contact-cta"><FileText className="w-5 h-5"/>{en?'Request Exposé':'Exposé anfordern'}</button>}
            <Link to="/infrastruktur-radar" className="px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all flex items-center gap-2"><MapPin className="w-5 h-5"/>{en?'Show on Map':'Auf Karte anzeigen'}</Link>
          </div>
        </div>
      </header>

      <section className="py-16 px-6 bg-white"><div className="max-w-7xl mx-auto"><h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-12 text-center">{en?<>Investment <span className="text-ea-gold">Key Figures</span></>:<>Investment-<span className="text-ea-gold">Kennzahlen</span></>}</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-6">{investmentHighlights.map((item,idx)=>(<div key={idx} className="bg-ea-light border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"><div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4"><item.icon className="w-7 h-7 text-ea-gold"/></div><p className="text-2xl md:text-3xl font-bold text-ea-dark mb-1">{item.value}</p><p className="text-ea-gold font-semibold text-sm mb-1">{item.label}</p><p className="text-ea-dark/50 text-xs">{item.description}</p></div>))}</div></div></section>

      <section className="py-16 px-6 bg-ea-light"><div className="max-w-7xl mx-auto"><div className="grid lg:grid-cols-2 gap-12 items-center"><div><h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6">{en?<>Why <span className="text-ea-gold">Nikšić</span>?</>:<>Warum <span className="text-ea-gold">Nikšić</span>?</>}</h2><div className="space-y-4 mb-8">{whyItems.map((item,idx)=>(<div key={idx} className="flex items-start gap-4"><div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 text-ea-gold"/></div><div><h3 className="font-semibold text-ea-dark mb-1">{item.title}</h3><p className="text-ea-dark/70 text-sm">{item.desc}</p></div></div>))}</div>
        <div className="bg-white border border-ea-gold/20 rounded-xl p-6"><p className="text-ea-gold font-semibold text-sm mb-2">VALUE-PLAY</p><blockquote className="text-ea-dark/80 italic">{en?'"Nikšić is Montenegro\'s most undervalued market. Those who think long-term and bring patience will find the highest appreciation potential in the country."':'"Nikšić ist Montenegros am stärksten unterbewerteter Markt. Wer langfristig denkt und Geduld mitbringt, findet hier die höchsten Aufwertungspotenziale des Landes."'}</blockquote><p className="text-ea-dark/50 text-sm mt-3">EuroAdria Corporate Solutions Research Team</p></div></div>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"><h3 className="text-xl font-semibold text-ea-dark mb-6">{en?'Infrastructure Advantages':'Infrastruktur-Vorteile'}</h3><ul className="space-y-3">{infrastructureAdvantages.map((item,idx)=>(<li key={idx} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-ea-gold flex-shrink-0"/><span className="text-ea-dark/80">{item}</span></li>))}</ul><div className="mt-8 pt-6 border-t border-gray-100"><Link to="/infrastruktur-radar" className="flex items-center justify-between text-ea-gold font-semibold hover:text-ea-gold/80 transition-colors"><span>{en?'More in Infrastructure Radar':'Mehr im Infrastruktur-Radar'}</span><ArrowRight className="w-5 h-5"/></Link></div></div></div></div></section>

      <section className="py-16 px-6 bg-white" id="apartments"><div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-4">{en?<>Available <span className="text-ea-gold">Properties</span></>:<>Verfügbare <span className="text-ea-gold">Immobilien</span></>}</h2><p className="text-ea-dark/70 max-w-2xl mx-auto">{en?'Commercial properties, apartments and development land. Contact us for current off-market offers.':'Gewerbeimmobilien, Apartments und Bauland. Kontaktieren Sie uns für aktuelle Off-Market Angebote.'}</p></div><div className="grid md:grid-cols-3 gap-6 mb-12">{[1,2,3].map(idx=>(<div key={idx} className="bg-ea-light border border-dashed border-ea-gold/30 rounded-2xl p-8 text-center"><div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"><Building2 className="w-8 h-8 text-ea-gold"/></div><h3 className="text-lg font-semibold text-ea-dark mb-2">Coming Soon</h3><p className="text-ea-dark/50 text-sm mb-4">{en?'Premium properties in preparation.':'Premium-Objekte in Vorbereitung.'}</p><button onClick={()=>setShowContactForm(true)} className="text-ea-gold font-semibold text-sm hover:text-ea-gold/80 transition-colors">{en?'Express Interest →':'Interesse bekunden →'}</button></div>))}</div><div className="text-center"><button onClick={()=>setShowContactForm(true)} className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2 mx-auto"><Phone className="w-5 h-5"/>{en?'Register for Offers':'Für Angebote registrieren'}</button></div></div></section>

      <section className="py-16 px-6 bg-ea-dark"><div className="max-w-4xl mx-auto text-center"><h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">{en?<>Interested in <span className="text-ea-gold">Nikšić</span>?</>:<>Interesse an <span className="text-ea-gold">Nikšić</span>?</>}</h2><p className="text-ea-light/70 text-lg mb-8 max-w-2xl mx-auto">{en?'Receive our investment analysis with appreciation forecast, market comparison and due diligence checklist.':'Erhalten Sie unsere Investment-Analyse mit Aufwertungsprognose, Marktvergleich und Due-Diligence-Checkliste.'}</p><div className="flex flex-wrap justify-center gap-4">
        {exposeUrl?<ExposeLeadGate exposeUrl={exposeUrl} exposeName="Nikšić Exposé" sourceId="niksic_expose" buttonText={en?"Download Free Exposé":"Kostenloses Exposé herunterladen"} buttonClass="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2"/>:<button onClick={()=>setShowContactForm(true)} className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-xl hover:bg-ea-gold/90 transition-all flex items-center gap-2"><FileText className="w-5 h-5"/>{en?'Request Free Exposé':'Kostenloses Exposé anfordern'}</button>}
        <Link to="/contact" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20">{en?'Schedule Consultation':'Beratungsgespräch vereinbaren'}<ArrowRight className="w-5 h-5"/></Link></div></div></section>

      {showContactForm&&(<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl"><div className="flex items-center gap-3 mb-6"><div className="w-12 h-12 bg-ea-gold/10 rounded-xl flex items-center justify-center"><Factory className="w-6 h-6 text-ea-gold"/></div><div><h3 className="text-xl font-bold text-ea-dark">Nikšić Exposé</h3><p className="text-ea-dark/60 text-sm">{en?'Industrial Investment Analysis':'Industrie-Investment-Analyse'}</p></div></div>
        {submitted?(<div className="text-center py-8"><div className="w-16 h-16 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-ea-gold"/></div><h4 className="text-xl font-bold text-ea-dark mb-2">{en?'Request received!':'Anfrage erhalten!'}</h4><p className="text-ea-dark/70">{en?'We will send you the exposé within 24 hours.':'Wir senden Ihnen das Exposé innerhalb von 24 Stunden.'}</p></div>):(
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-ea-dark/80 text-sm font-medium mb-2">Name *</label><input type="text" required value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder={en?"Your Name":"Ihr Name"}/></div>
          <div><label className="block text-ea-dark/80 text-sm font-medium mb-2">{en?'Email':'E-Mail'} *</label><input type="email" required value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder={en?"your@email.com":"ihre@email.de"}/></div>
          <div><label className="block text-ea-dark/80 text-sm font-medium mb-2">{en?'Phone':'Telefon'}</label><input type="tel" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none" placeholder="+49 123 456789"/></div>
          <div><label className="block text-ea-dark/80 text-sm font-medium mb-2">{en?'Message':'Nachricht'}</label><textarea value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:border-ea-gold focus:outline-none resize-none" placeholder={en?"Your specific interests or questions...":"Ihre spezifischen Interessen oder Fragen..."}/></div>
          <div className="flex gap-3 pt-4"><button type="button" onClick={()=>setShowContactForm(false)} className="flex-1 px-6 py-3 bg-ea-light text-ea-dark font-semibold rounded-lg hover:bg-gray-200 transition-all">{en?'Cancel':'Abbrechen'}</button><button type="submit" className="flex-1 px-6 py-3 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all">{en?'Request Exposé':'Exposé anfordern'}</button></div>
        </form>)}</div></div>)}
    </div>
  );
};

export default NiksicPage;
