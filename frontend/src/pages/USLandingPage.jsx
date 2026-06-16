import React, { useState } from 'react';
import { Play, Download, ChevronDown, ChevronUp, Building2, TrendingUp, Sun, Laptop, Shield, Briefcase, Landmark, Search, ArrowRight, FileText, Lock, Calendar } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const IMAGES = {
  kotor: 'https://images.unsplash.com/photo-1558971067-6edfd413e506?fm=webp&q=75&w=600',
  lustica: 'https://images.unsplash.com/photo-1755507093082-b38c11286f38?fm=webp&q=75&w=600',
  perast: 'https://images.unsplash.com/photo-1672225460441-6eb1561fc977?fm=webp&q=75&w=600',
  durmitor: 'https://images.unsplash.com/photo-1659853491415-acf59a9adc14?fm=webp&q=75&w=600',
  coast: 'https://images.unsplash.com/photo-1614122027743-50a9e6e8002f?fm=webp&q=75&w=1920',
};

const CALENDLY_URL = 'https://calendly.com/euroadria/neues-meeting';

const locations = [
  { name: 'Bay of Kotor', img: IMAGES.kotor },
  { name: 'Lustica Bay', img: IMAGES.lustica },
  { name: 'Perast', img: IMAGES.perast },
  { name: 'Durmitor North', img: IMAGES.durmitor },
];

const targetGroups = [
  { icon: Briefcase, title: 'Entrepreneurs', desc: 'For business owners looking to explore Montenegro as an operational base, to reduce corporate tax burden (9-15%), or as a strategic gateway into Southeast Europe.', tags: ['Company Setup', 'Banking'] },
  { icon: TrendingUp, title: 'Investors', desc: 'For investors seeking to allocate capital into real estate (coastal regions & Durmitor) before EU accession to capture strong long-term value appreciation.', tags: ['Real Estate', 'Due Diligence'] },
  { icon: Sun, title: 'Retirees', desc: 'For those considering Europe as a lifestyle destination with a comparatively moderate cost of living, breathtaking nature, and direct access to the Adriatic region.', tags: ['Residency', 'Property Search'] },
  { icon: Laptop, title: 'Digital Professionals', desc: 'For remote workers and location-independent freelancers looking for a legally secure, tax-optimized base in one of the Mediterranean\'s most beautiful spots.', tags: ['Digital Nomad Visa', 'Networking'] },
];

const faqs = [
  { q: 'Is Montenegro part of the European Union?', a: 'Montenegro is not currently a member of the European Union. However, it is an official EU candidate country and is widely regarded as the most advanced accession candidate in the Western Balkans. Accession is often targeted for 2028 in political circles, though it remains subject to institutional processes.' },
  { q: 'Can EuroAdria guarantee residency or banking approvals?', a: 'No. We do not guarantee governmental or bank approvals, as these depend on third parties and your individual situation. However, we professionally structure your applications to maximize chances of success and avoid rejections due to procedural errors.' },
  { q: 'Do you provide legal or tax advice?', a: 'No. EuroAdria Corporate Solutions performs strategic coordination and does not constitute regulated legal or tax advice. Where necessary, we integrate local licensed tax advisors, lawyers, and notaries into the implementation process.' },
  { q: 'Can foreigners buy real estate in Montenegro?', a: 'Yes, foreigners can generally acquire real estate (houses, apartments) in Montenegro. Exceptions apply to certain agricultural or border lands. However, verifying property ownership (cadastral review) is essential and should never be done without legal guidance.' },
];

const pillars = [
  { icon: Search, title: 'Strategic Assessment' },
  { icon: Building2, title: 'Company Formation' },
  { icon: Landmark, title: 'Banking Readiness' },
  { icon: Shield, title: 'Real Estate Due Diligence' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group" data-testid={`faq-${q.slice(0,20).replace(/\s/g,'-')}`}>
        <span className="text-[#0a1628] font-medium text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#C8A96A] shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#C8A96A] shrink-0" />}
      </button>
      {open && <p className="text-[#0a1628]/60 text-sm pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function USLandingPage() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: '',
          source: 'us_strategy_brief',
          expose_name: 'Montenegro Strategy Brief 2026'
        })
      });
      if (res.ok) setSuccess(true);
      if (res.ok && typeof window.fbq === 'function') window.fbq('track', 'Lead');
      else setError('Something went wrong. Please try again.');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0a1628]" style={{ fontFamily: "'Inter', sans-serif" }} data-testid="us-landing-page">
      {/* Sticky Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src="/euroadria-logo.png" alt="EuroAdria" className="h-8 w-auto" />
            <span className="text-[#0a1628] font-bold text-sm hidden sm:block">EuroAdria</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#vsl" className="text-[#0a1628]/50 hover:text-[#0a1628] text-xs hidden sm:block transition-colors">Video</a>
            <a href="#brief" className="text-[#0a1628]/50 hover:text-[#0a1628] text-xs hidden sm:block transition-colors">Strategy Brief</a>
            <a href="#faq" className="text-[#0a1628]/50 hover:text-[#0a1628] text-xs hidden sm:block transition-colors">FAQ</a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a1628] text-white text-xs font-semibold rounded-lg hover:bg-[#0a1628]/90 transition-all" data-testid="nav-book-call">
              <Calendar className="w-3.5 h-3.5" />
              Book a Call
            </a>
          </div>
        </div>
      </nav>

      {/* Hero / VSL Section */}
      <section id="vsl" className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white" />
        <div className="absolute top-32 right-0 w-96 h-96 bg-[#C8A96A]/5 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#b71c1c]/10 border border-[#b71c1c]/20 rounded-full px-4 py-2 mb-8">
            <span className="text-[#b71c1c] text-xs font-semibold tracking-wider uppercase">The Montenegro 2028 Arbitrage Window</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6" data-testid="us-hero-title">
            Secure Your European Base
            <span className="block text-[#C8A96A] mt-2">Before EU Accession.</span>
          </h1>

          <p className="text-[#0a1628]/60 text-base lg:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover in this short video why entrepreneurs and investors from North America are acting now to secure capital, operational structure, and lifestyle in Montenegro.
          </p>

          {/* Video */}
          <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video mb-10 shadow-xl" data-testid="vsl-video">
            <iframe
              src="https://www.youtube.com/embed/7k-e0ILF_o8?rel=0"
              title="EuroAdria - Secure Your European Base"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <a href="#brief" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a1628] text-white font-bold rounded-xl hover:bg-[#0a1628]/90 transition-all text-sm shadow-lg" data-testid="hero-cta">
            <Download className="w-4 h-4" />
            Download Montenegro Strategy Brief
          </a>
          <p className="text-[#0a1628]/40 text-xs mt-3">100% Free. Instant PDF Download.</p>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#C8A96A] text-xs font-semibold tracking-wider uppercase text-center mb-3">More Than a Plan B</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">A Premium Destination.</h2>
          <p className="text-[#0a1628]/50 text-sm text-center mb-10">Authentic insights into your future European base.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {locations.map((loc) => (
              <div key={loc.name} className="relative rounded-xl overflow-hidden aspect-[3/4] group shadow-lg">
                <img src={loc.img} alt={loc.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold text-sm">{loc.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#b71c1c] text-xs font-semibold tracking-wider uppercase mb-3">The Challenge</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Why Americans and Canadians Are Looking Beyond Their Home Market</h2>
              <div className="space-y-4 text-[#0a1628]/70 text-sm leading-relaxed">
                <p>More high-net-worth individuals, entrepreneurs, and investors from North America are seeking international flexibility, geographic diversification, and a practical Plan B outside their domestic market.</p>
                <p>Facing complex citizenship-based taxation (US) or aggressive tax policies (Canada), securing a European base with favorable conditions is becoming a critical priority.</p>
                <p>Montenegro offers a unique combination: It uses the <strong className="text-[#0a1628]">Euro as its official currency</strong>, provides a highly favorable tax environment (9-15%), boasts a rapidly developing real estate market, and is the most advanced candidate for EU accession (anticipated around 2028).</p>
                <div className="bg-[#b71c1c]/5 border border-[#b71c1c]/15 rounded-xl p-4 mt-4">
                  <p className="text-[#b71c1c] text-sm"><strong>But beware:</strong> Montenegro is not a plug-and-play solution. Without multi-jurisdictional structuring (especially regarding FATCA or Canadian tax residency), proper real estate due diligence, and clean local coordination, it can easily become an expensive legal liability.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={IMAGES.coast} alt="Montenegro Coast" loading="lazy" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet / Strategy Brief */}
      <section id="brief" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Book Mockup */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-80 bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-lg shadow-2xl border border-[#C8A96A]/30 p-6 flex flex-col justify-between">
                  <div>
                    <img src="/euroadria-logo-white.png" alt="EuroAdria" className="h-8 mb-4 opacity-80" />
                    <h3 className="text-white font-bold text-lg leading-tight">Montenegro<br />Strategy Brief<br />2026</h3>
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] mb-1">A practical guide for Americans and Canadians exploring relocation and investment in Europe.</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="bg-[#C8A96A]/20 text-[#C8A96A] text-[10px] px-2 py-0.5 rounded-full font-medium">PDF EDITION</span>
                      <span className="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">Free Download</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-64 h-80 bg-[#C8A96A]/10 rounded-lg -z-10" />
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Get the Strategy Brief 2026</h2>
              <p className="text-[#0a1628]/60 text-sm mb-6 leading-relaxed">Get the comprehensive guide now and learn how to leverage the 2028 arbitrage window for your real estate investment, company formation, or residency relocation.</p>

              <ul className="space-y-3 mb-8">
                <li className="flex gap-3 text-sm"><span className="text-[#C8A96A] font-bold shrink-0">01</span><span className="text-[#0a1628]/70"><strong className="text-[#0a1628]">The 2028 Window:</strong> Why Montenegro is attracting massive capital before EU accession.</span></li>
                <li className="flex gap-3 text-sm"><span className="text-[#C8A96A] font-bold shrink-0">02</span><span className="text-[#0a1628]/70"><strong className="text-[#0a1628]">Real Estate & Taxes:</strong> Opportunities on the coast (e.g., Lustica) and in the north (Durmitor).</span></li>
                <li className="flex gap-3 text-sm"><span className="text-[#C8A96A] font-bold shrink-0">03</span><span className="text-[#0a1628]/70"><strong className="text-[#0a1628]">Compliance & Security:</strong> How to navigate FATCA, tax residency, and avoid critical mistakes.</span></li>
              </ul>

              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6" data-testid="brief-success">
                  <div className="text-center mb-4">
                    <FileText className="w-10 h-10 text-[#C8A96A] mx-auto mb-3" />
                    <h3 className="text-[#0a1628] font-bold mb-2">Strategy Brief is on its way!</h3>
                    <p className="text-[#0a1628]/60 text-sm">Check your email inbox. The PDF is attached.</p>
                  </div>
                  <div className="mt-4 rounded-xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                      src="https://www.youtube.com/embed/LuIIfPV-mI8?autoplay=1&rel=0"
                      title="Thank you from EuroAdria"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3" data-testid="brief-form">
                  <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0a1628] placeholder:text-gray-400 focus:outline-none focus:border-[#C8A96A] text-sm shadow-sm" data-testid="brief-name" />
                  <input type="email" placeholder="Your Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#0a1628] placeholder:text-gray-400 focus:outline-none focus:border-[#C8A96A] text-sm shadow-sm" data-testid="brief-email" />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full px-6 py-3.5 bg-[#0a1628] text-white font-bold rounded-lg hover:bg-[#0a1628]/90 transition-all disabled:opacity-50 text-sm inline-flex items-center justify-center gap-2 shadow-lg" data-testid="brief-submit">
                    {loading ? 'Sending...' : 'Request Strategy Brief'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  <p className="text-[#0a1628]/30 text-xs text-center"><Lock className="w-3 h-3 inline mr-1" />Your data is secure. No spam. Unsubscribe anytime.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Target Groups */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#C8A96A] text-xs font-semibold tracking-wider uppercase text-center mb-3">Who is this for?</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Tailored Strategic Coordination</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {targetGroups.map((g) => (
              <div key={g.title} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-[#C8A96A]/50 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-[#C8A96A]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#C8A96A]/20 transition-colors">
                  <g.icon className="w-5 h-5 text-[#C8A96A]" />
                </div>
                <h3 className="text-[#0a1628] font-semibold text-base mb-2">{g.title}</h3>
                <p className="text-[#0a1628]/50 text-sm leading-relaxed mb-4">{g.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {g.tags.map((t) => <span key={t} className="bg-[#C8A96A]/10 text-[#C8A96A] text-xs px-3 py-1 rounded-full font-medium">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Why EuroAdria */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Why EuroAdria Corporate Solutions?</h2>
          <p className="text-[#0a1628]/60 text-sm text-center max-w-2xl mx-auto mb-6 leading-relaxed">
            Montenegro is a relationship-driven market. Access, timing, documentation, and local understanding are crucial to your success.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10 shadow-sm">
            <ul className="space-y-3 text-[#0a1628]/70 text-sm">
              <li>We are <strong className="text-[#0a1628]">not</strong> a standard real estate agency, tax firm, or generic relocation platform.</li>
              <li>Our role is <strong className="text-[#C8A96A]">strategic coordination</strong>. We structure your project and execute local steps securely alongside reliable lawyers, notaries, and partners.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pillars.map((p) => (
              <div key={p.title} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-[#C8A96A]/50 hover:shadow-md transition-all">
                <p.icon className="w-6 h-6 text-[#C8A96A] mx-auto mb-3" />
                <p className="text-[#0a1628] font-medium text-xs">{p.title}</p>
              </div>
            ))}
          </div>

          {/* Book a Call CTA */}
          <div className="mt-12 text-center">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a1628] text-white font-bold rounded-xl hover:bg-[#0a1628]/90 transition-all text-sm shadow-lg" data-testid="book-call-cta">
              <Calendar className="w-4 h-4" />
              Book a Free Zoom Call
            </a>
            <p className="text-[#0a1628]/40 text-xs mt-3">Schedule a call with our team to discuss your project.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="divide-y divide-gray-200">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <button onClick={() => setShowPrivacy(!showPrivacy)} className="flex items-center gap-2 text-[#0a1628]/40 hover:text-[#0a1628]/60 text-sm transition-colors">
            <Shield className="w-4 h-4" />
            Privacy Policy & Data Collection
            {showPrivacy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showPrivacy && (
            <div className="mt-4 text-[#0a1628]/40 text-xs space-y-3 leading-relaxed">
              <p><strong className="text-[#0a1628]/60">1. Data Collection for Strategy Brief:</strong> When you request our "Montenegro Strategy Brief", we collect your name and email address. We use this data exclusively to send you the requested PDF and to provide relevant follow-up information regarding investment and relocation in Montenegro.</p>
              <p><strong className="text-[#0a1628]/60">2. Storage and Protection:</strong> Your data is securely processed in our CRM system. We do not share your personal information with unrelated third parties unless you explicitly instruct us to connect you with local partners (notaries, banks).</p>
              <p><strong className="text-[#0a1628]/60">3. Revocation and Opt-Out:</strong> You can withdraw your consent to receive emails at any time by clicking the "Unsubscribe" link at the bottom of any email. Your data will then be restricted or deleted for marketing purposes.</p>
              <p><strong className="text-[#0a1628]/60">4. Tracking and Cookies:</strong> This landing page uses basic functional cookies and (if consented) analytics tools to measure VSL performance and downloads to improve our offering.</p>
              <p>Responsible Entity: EuroAdria Corporate Solutions (Montaris & Co. d.o.o.). Contact for privacy inquiries: office@euroadria.me</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <img src="/euroadria-logo.png" alt="EuroAdria" className="h-12 mx-auto mb-5" />
          <p className="text-[#0a1628]/50 text-xs mb-6 max-w-2xl mx-auto leading-relaxed">
            The information provided on this website and in related documents is for general informational purposes only. It does not constitute legal, tax, financial, investment, immigration, or real estate advice. EuroAdria Corporate Solutions does not provide regulated services in the sense of investment or tax advice and guarantees no specific outcomes. References to Montenegro's economic development or potential EU accession (such as the "2028 Arbitrage Window") are based on market assessments and current political statements and are non-binding. Past developments do not guarantee future results. Always consult licensed advisors for legal and tax obligations in your home country.
          </p>
          <p className="text-[#0a1628]/40 text-xs">&copy; 2026 EuroAdria Corporate Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
