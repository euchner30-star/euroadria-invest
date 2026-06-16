import React, { useState } from 'react';
import { Play, ArrowRight, FileText, Lock, ChevronDown, ChevronUp, Shield, Check } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const CALENDLY_URL = 'https://calendly.com/euroadria/neues-meeting';

const faqs = [
  { q: 'Is Montenegro part of the European Union?', a: 'Montenegro is not currently a member of the European Union. However, it is an official EU candidate country and is widely regarded as the most advanced accession candidate in the Western Balkans. Accession is often targeted for 2028 in political circles, though it remains subject to institutional processes.' },
  { q: 'Can EuroAdria guarantee residency or banking approvals?', a: 'No. We do not guarantee governmental or bank approvals, as these depend on third parties and your individual situation. However, we professionally structure your applications to maximize chances of success and avoid rejections due to procedural errors.' },
  { q: 'Do you provide legal or tax advice?', a: 'No. EuroAdria Corporate Solutions performs strategic coordination and does not constitute regulated legal or tax advice. Where necessary, we integrate local licensed tax advisors, lawyers, and notaries into the implementation process.' },
  { q: 'Can foreigners buy real estate in Montenegro?', a: 'Yes, foreigners can generally acquire real estate (houses, apartments) in Montenegro. Exceptions apply to certain agricultural or border lands. However, verifying property ownership (cadastral review) is essential and should never be done without legal guidance.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/15">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-white font-medium text-sm sm:text-base pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-[#C8A96A] shrink-0" /> : <ChevronDown className="w-5 h-5 text-white/40 group-hover:text-[#C8A96A] shrink-0 transition-colors" />}
      </button>
      {open && <p className="text-white/70 text-sm pb-6 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function USCALandingPage() {
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
          source: 'usca_strategy_brief',
          expose_name: 'Montenegro Strategy Brief 2026 (USCA)'
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
    <div className="min-h-screen bg-[#0B1120]" data-testid="usca-landing-page">
      {/* Google Fonts for Serif */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&display=swap');`}</style>

      {/* Sticky Nav — Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#C8A96A]/10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src="/euroadria-logo-white.png" alt="EuroAdria" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-none">EuroAdria</span>
              <span className="text-[#C8A96A] text-[10px] tracking-[0.2em] uppercase">Corporate Solutions</span>
            </div>
          </div>
          <a href="#brief" className="px-5 py-2 border border-[#C8A96A] text-[#C8A96A] text-xs font-semibold tracking-wider uppercase hover:bg-[#C8A96A] hover:text-[#0B1120] transition-all" data-testid="nav-get-brief">
            Get the Strategy Brief
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Subtle pyramid/triangle bg */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-[#111B2E] to-[#0B1120]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(200,169,106,0.03) 50%, transparent 100%)',
            clipPath: 'polygon(50% 10%, 15% 90%, 85% 90%)'
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Red badge */}
          <div className="inline-block bg-[#B71C1C] px-5 py-2 mb-10">
            <span className="text-white text-xs font-bold tracking-[0.15em] uppercase">Attention U.S. Investors & Entrepreneurs</span>
          </div>

          {/* Main headline — Playfair Display */}
          <h1 className="mb-8" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="usca-hero-title">
            <span className="block text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1]">
              Escape The U.S. Tax Net &
            </span>
            <span className="block text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mt-2">
              Secure Your European Plan B
            </span>
            <span className="block text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mt-2">
              Before The <span className="text-[#C8A96A]" style={{ fontStyle: 'italic' }}>2028 Arbitrage</span>
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mt-2">
              <span className="text-[#C8A96A]" style={{ fontStyle: 'italic' }}>Window</span>
              <span className="text-white"> Closes.</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Watch the short briefing below to discover why high-net-worth Americans are
            quietly moving capital into Montenegro to secure a 9% tax rate, Mediterranean
            lifestyle, and future EU access.
          </p>

          {/* Video — gold border */}
          <div className="relative max-w-3xl mx-auto mb-12">
            <div className="border border-[#C8A96A]/40 rounded-sm p-1">
              <div className="aspect-video bg-[#0a0f1a]">
                <iframe
                  src="https://www.youtube.com/embed/7k-e0ILF_o8?rel=0"
                  title="EuroAdria - The 2028 Arbitrage Window"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <a href="#brief" className="inline-flex items-center gap-3 px-10 py-4 bg-[#C8A96A] text-[#0B1120] font-bold text-sm tracking-wider uppercase hover:bg-[#d4b87a] transition-all" data-testid="hero-cta-usca">
            Download the Strategy Brief
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* THE SOLUTION — Arbitrage Window */}
      <section className="py-20 border-t border-white/5 bg-[#0B1120]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Image */}
            <div className="relative">
              <img 
                src="https://customer-assets.emergentagent.com/job_c0fd7376-15dd-4777-8bb5-a3271554eb57/artifacts/lcmc5zr4_490c294f-3095-48fd-b9c3-dd87966866ab.jpeg" 
                alt="Montenegro Property" 
                loading="lazy"
                className="w-full rounded-sm object-cover aspect-[4/5]"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white py-4 px-6">
                <p className="text-[#0B1120] text-sm sm:text-base font-medium italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                  "The most advanced candidate for EU Accession."
                </p>
              </div>
            </div>

            {/* Right — Content */}
            <div>
              <p className="text-[#B71C1C] text-xs tracking-[0.2em] uppercase font-bold mb-4">The Solution</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-10 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                The 2028 Arbitrage Window Is Your Unfair Advantage.
              </h2>

              <div className="space-y-8">
                {/* Point 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#C8A96A]/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-[#C8A96A]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">Euro Currency, Without ECB Control</h3>
                    <p className="text-white/50 text-sm leading-relaxed">Montenegro uses the Euro unilaterally. Your assets are protected in a hard currency without the direct monetary policy overreach of Brussels.</p>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#C8A96A]/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-[#C8A96A]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">9% to 15% Maximum Tax Rate</h3>
                    <p className="text-white/50 text-sm leading-relaxed">One of the most competitive tax environments on the European continent for both corporate profits and personal income.</p>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-[#C8A96A]/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-4 h-4 text-[#C8A96A]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">Pre-EU Real Estate Valuation</h3>
                    <p className="text-white/50 text-sm leading-relaxed">When Croatia joined the EU, coastal property values surged by 60% in 5 years. Montenegro is currently negotiating its final EU chapters for an anticipated 2028 entry.</p>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="mt-8 bg-[#111B2E] border border-white/10 rounded-sm p-5">
                <p className="text-white/80 text-sm leading-relaxed">
                  <strong className="text-[#C8A96A]">Crucial Warning:</strong> Montenegro is incredibly lucrative, but it is NOT a DIY project for US citizens. Without strict FATCA structuring and cadastral due diligence, your capital is at risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn — Simple bullets */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#C8A96A] text-xs tracking-[0.2em] uppercase text-center mb-8">What You'll Discover</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Why Montenegro uses the Euro without being in the EU',
              'How to legally reduce your tax burden to 9-15%',
              'The real estate "window" before EU accession in 2028',
              'How to navigate FATCA compliance from abroad',
              'Company formation & banking in under 30 days',
              'Critical mistakes Americans make in the Balkans',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <Check className="w-4 h-4 text-[#C8A96A] mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Brief — Lead Form */}
      <section id="brief" className="py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-[#C8A96A] text-xs tracking-[0.2em] uppercase mb-4">Free Download</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Montenegro Strategy Brief 2026
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              The comprehensive guide for Americans and Canadians exploring relocation, investment, and company formation in Montenegro.
            </p>
          </div>

          {success ? (
            <div className="text-center mb-6" data-testid="usca-brief-success">
              <div className="w-16 h-16 bg-[#C8A96A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[#C8A96A]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Strategy Brief is on its way!</h3>
              <p className="text-white/50 text-sm mb-6">Check your email inbox. The PDF is attached.</p>
              {/* Thank you video */}
              <div className="border border-[#C8A96A]/30 rounded-sm p-1 mt-4">
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/LuIIfPV-mI8?autoplay=1&rel=0"
                    title="Thank you from EuroAdria"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto" data-testid="usca-brief-form">
              <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C8A96A]/50 text-sm" data-testid="usca-brief-name" />
              <input type="email" placeholder="Your Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3.5 bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C8A96A]/50 text-sm" data-testid="usca-brief-email" />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading} className="w-full px-6 py-4 bg-[#C8A96A] text-[#0B1120] font-bold tracking-wider uppercase text-sm hover:bg-[#d4b87a] transition-all disabled:opacity-50 flex items-center justify-center gap-2" data-testid="usca-brief-submit">
                {loading ? 'Sending...' : 'Get the Strategy Brief'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
              <p className="text-white/20 text-xs text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Your data is secure. No spam.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/30 text-xs tracking-[0.15em] uppercase mb-6">Why EuroAdria?</p>
          <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            We are <strong className="text-white">not</strong> a standard real estate agency or generic relocation platform. Our role is <strong className="text-[#C8A96A]">strategic coordination</strong> — we structure your project and execute local steps securely alongside reliable lawyers, notaries, and banking partners.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Strategic Assessment', 'Company Formation', 'Banking Setup', 'Real Estate DD'].map((item) => (
              <div key={item} className="border border-white/10 py-3 px-2">
                <span className="text-white/60 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book a Call */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-white/70 text-base mb-6">Ready to discuss your project?</p>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-10 py-4 border-2 border-[#C8A96A] text-[#C8A96A] text-sm font-semibold tracking-wider uppercase hover:bg-[#C8A96A] hover:text-[#0B1120] transition-all" data-testid="usca-book-call">
            Book a Free Zoom Call
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-white/10 bg-[#0D1528]">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[#C8A96A] text-xs tracking-[0.2em] uppercase text-center mb-3 font-semibold">Frequently Asked Questions</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Common Questions About Montenegro</h2>
          <div className="space-y-0">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-10 border-t border-white/10">
        <div className="max-w-2xl mx-auto px-6">
          <button onClick={() => setShowPrivacy(!showPrivacy)} className="flex items-center gap-2 text-white/40 hover:text-white/60 text-xs transition-colors mx-auto">
            <Shield className="w-3.5 h-3.5" /> Privacy Policy {showPrivacy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPrivacy && (
            <div className="mt-6 text-white/50 text-xs space-y-3 leading-relaxed max-w-lg mx-auto">
              <p><strong className="text-white/70">Data Collection:</strong> We collect your name and email to send the Strategy Brief and relevant follow-up information.</p>
              <p><strong className="text-white/70">Protection:</strong> Your data is securely processed. We do not share it with unrelated third parties.</p>
              <p><strong className="text-white/70">Opt-Out:</strong> Unsubscribe anytime via the link in any email.</p>
              <p>Responsible Entity: EuroAdria Corporate Solutions (Montaris & Co. d.o.o.) — office@euroadria.me</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10 bg-[#080E1A]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <img src="/euroadria-logo-white.png" alt="EuroAdria" className="h-10 mx-auto mb-5 opacity-60" />
          <p className="text-white/40 text-xs max-w-xl mx-auto leading-relaxed mb-4">
            This page is for general informational purposes only. It does not constitute legal, tax, financial, or investment advice. EuroAdria Corporate Solutions does not guarantee specific outcomes. References to the "2028 Arbitrage Window" are based on market assessments and are non-binding. Always consult licensed advisors.
          </p>
          <p className="text-white/30 text-xs">&copy; 2026 EuroAdria Corporate Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
