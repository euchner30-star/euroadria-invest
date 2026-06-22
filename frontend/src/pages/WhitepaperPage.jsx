import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Building2, TrendingUp, Scale, Landmark, MapPin, Users, ArrowRight, Check, Lock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const chapters = [
  { icon: Scale, title: 'Corporate Law 2026', desc: 'Digital D.O.O. formation, EU-compliant structures and the economic substance principle' },
  { icon: TrendingUp, title: 'Tax Advantages', desc: '9% corporate tax Montenegro, IP-Box 2.0 Serbia and the dual-hub approach' },
  { icon: Landmark, title: 'Banking & SEPA', desc: 'Instant payments, compliance requirements and account opening under new standards' },
  { icon: Building2, title: 'Real Estate Strategy', desc: 'Forensic due diligence, digital cadastre and the August 2026 legalization deadline' },
  { icon: Users, title: 'Expert Interview', desc: 'Strategic deep dive with leading legal and tax advisors in the region' },
  { icon: MapPin, title: 'Location Analyses', desc: 'Ulcinj as new Riviera, Kolašin and the potential of mountain tourism' },
];

export default function WhitepaperPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
          phone: form.phone || '',
          source: 'whitepaper',
          expose_name: 'Whitepaper: Strategic Plan 2026'
        })
      });
      if (res.ok) {
        setSuccess(true);
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ea-dark" data-testid="whitepaper-page">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ea-dark via-ea-dark to-ea-navy" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-ea-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-ea-gold/3 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-ea-gold/10 border border-ea-gold/20 rounded-full px-4 py-2 mb-6">
                <Lock className="w-4 h-4 text-ea-gold" />
                <span className="text-ea-gold text-xs font-semibold tracking-wider uppercase">Confidential Whitepaper</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Strategic Plan 2026:
                <span className="block text-ea-gold mt-2">Market Entry Western Balkans</span>
              </h1>

              <p className="text-white/70 text-base lg:text-lg leading-relaxed mb-8">
                16 pages of exclusive expert knowledge for institutional investors and international entrepreneurs. 
                From tax structuring to forensic real estate strategy to operational market entry planning.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {['16 Pages', 'PDF Download', 'Confidential'].map((tag) => (
                  <span key={tag} className="bg-white/5 border border-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-ea-gold">8</div>
                  <div className="text-white/50 text-xs mt-1">Chapters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ea-gold">2026</div>
                  <div className="text-white/50 text-xs mt-1">Latest Data</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ea-gold">DACH</div>
                  <div className="text-white/50 text-xs mt-1">Target Audience</div>
                </div>
              </div>
            </div>

            {/* Right: Lead Form */}
            <div>
              {success ? (
                <div className="bg-white/5 backdrop-blur-sm border border-ea-gold/30 rounded-2xl p-8 text-center" data-testid="whitepaper-success">
                  <div className="w-16 h-16 bg-ea-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-ea-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Whitepaper wird zugestellt</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Check your email inbox. The PDF is attached.
                  </p>
                  <Link 
                    to="/blog" 
                    className="inline-flex items-center gap-2 text-ea-gold hover:text-ea-gold/80 text-sm font-medium transition-colors"
                  >
                    Unsere Marktanalysen lesen <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8" data-testid="whitepaper-form">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-ea-gold/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-ea-gold" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Download for Free</h3>
                      <p className="text-white/50 text-xs">PDF wird per E-Mail zugestellt</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Ihr Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-ea-gold/50 text-sm transition-colors"
                        data-testid="whitepaper-name"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Ihre E-Mail-Adresse *"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-ea-gold/50 text-sm transition-colors"
                        data-testid="whitepaper-email"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Telefonnummer (optional)"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-ea-gold/50 text-sm transition-colors"
                        data-testid="whitepaper-phone"
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 px-6 py-3.5 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all disabled:opacity-50 text-sm inline-flex items-center justify-center gap-2"
                    data-testid="whitepaper-submit"
                  >
                    {loading ? 'Sending...' : 'Request Whitepaper'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <p className="text-white/30 text-xs mt-4 text-center">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your data will be treated confidentially. No spam.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="py-20 bg-ea-navy/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">What to Expect</h2>
            <p className="text-white/50 text-sm max-w-2xl mx-auto">8 Chapters mit konkreten Handlungsempfehlungen für Ihren Markteintritt auf dem Westbalkan</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((ch, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-ea-gold/30 transition-all group">
                <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-ea-gold/20 transition-colors">
                  <ch.icon className="w-5 h-5 text-ea-gold" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{ch.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/CTA Section */}
      <section className="py-16 bg-ea-dark border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-ea-gold text-xs font-semibold tracking-wider uppercase mb-4">EuroAdria Corporate Solutions</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Ready for the next step?
          </h2>
          <p className="text-white/50 text-sm mb-8 max-w-xl mx-auto">
            Discuss the whitepaper content with our experts. 
            Free and non-binding.
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/90 transition-all text-sm"
            data-testid="whitepaper-cta-contact"
          >
            Schedule Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
