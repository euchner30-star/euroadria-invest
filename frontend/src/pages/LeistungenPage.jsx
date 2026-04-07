import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home as HomeIcon, Scale, Handshake, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle, FileWarning, Gavel, MapPin, Ban, Landmark, ShieldAlert, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const iconMap = {
  immobilien: HomeIcon, gruendung: Building2, legal: Scale, investor: Handshake,
  baugenehmigung: FileWarning, kataster: Landmark, erbchaos: Gavel,
  airbnb: Ban, grauzonen: ShieldAlert, politisch: MapPin
};

const LeistungenPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leistungen-content`);
        if (res.ok) setContent(await res.json());
      } catch (err) {
        console.error('Failed to load leistungen content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-28 flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
    </div>
  );

  if (!content) return null;

  const { hero, services, legal_risks, compliance_risks, guarantee, cta } = content;

  return (
    <div className="min-h-screen pt-28 bg-white">
      <SEO
        title="Unsere Leistungen — Firmengründung, Immobilien, Legal & Investments"
        description="EuroAdria Corporate Solutions begleitet Sie bei Unternehmensgründung, Aufenthalt, Immobilien & Investments in Montenegro und Serbien."
        url="/leistungen"
      />

      {/* Hero */}
      <section className="py-16 bg-ea-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-6 font-medium">
            {hero?.tagline}
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-ea-dark mb-6 leading-tight">
            Unsere <span className="text-ea-gold">Leistungen</span> für Ihre Zukunft
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto leading-relaxed">
            {hero?.description}
          </p>
        </div>
      </section>

      {/* 4 Leistungsbereiche */}
      <section className="py-20" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services?.map((service, idx) => {
              const Icon = iconMap[service.id] || Building2;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  data-testid={`service-card-${idx}`}
                >
                  {service.image && (
                    <div className="h-48 overflow-hidden">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-7 h-7 text-ea-gold" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-ea-dark">{service.title}</h3>
                        <p className="text-ea-gold text-sm font-medium">{service.tagline}</p>
                      </div>
                    </div>
                    <p className="text-ea-dark/70 mb-5 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2.5 mb-6">
                      {service.points?.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-ea-gold shrink-0 mt-0.5" />
                          <span className="text-ea-dark/70 text-sm">{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/contact?betreff=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center gap-2 text-ea-gold font-medium text-sm hover:text-ea-dark transition-colors"
                    >
                      Unverbindlich anfragen <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rechtsrisiken */}
      <section className="py-20 bg-ea-dark" data-testid="legal-risks-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-red-500/10 border border-red-500/30 text-sm text-red-400 px-4 py-2 rounded-full mb-6 font-medium">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Risiko-Analyse
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              Juristische <span className="text-ea-gold">Stabilisierung</span>
            </h2>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">{legal_risks?.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {legal_risks?.items?.map((item, idx) => {
              const Icon = iconMap[item.id] || FileWarning;
              return (
                <div key={idx} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 hover:bg-white/[0.06] transition-all" data-testid={`legal-risk-${idx}`}>
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-3">{item.problem}</h3>
                  <div className="mb-5">
                    <div className="text-xs font-bold text-red-400 tracking-wider mb-1.5">RISIKO</div>
                    <p className="text-white/50 text-sm leading-relaxed">{item.risk}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ea-gold tracking-wider mb-1.5">EUROADRIA CORPORATE SOLUTIONS</div>
                    <p className="text-white/70 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <p className="text-ea-gold font-semibold">{legal_risks?.conclusion}</p>
          </div>
        </div>
      </section>

      {/* Exit-Sicherheit & Compliance */}
      <section className="py-20 bg-ea-light" data-testid="compliance-risks-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-6 font-medium">
              <ShieldCheck className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Compliance & Exit
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-ea-dark mb-4">
              Exit-Sicherheit & <span className="text-ea-gold">Compliance</span>
            </h2>
            <p className="text-ea-dark/60 text-lg max-w-3xl mx-auto">{compliance_risks?.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {compliance_risks?.items?.map((item, idx) => {
              const Icon = iconMap[item.id] || Ban;
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all" data-testid={`compliance-risk-${idx}`}>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-ea-dark font-semibold text-lg mb-3">{item.problem}</h3>
                  <div className="mb-5">
                    <div className="text-xs font-bold text-red-500 tracking-wider mb-1.5">RISIKO</div>
                    <p className="text-ea-dark/50 text-sm leading-relaxed">{item.risk}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ea-gold tracking-wider mb-1.5">EUROADRIA CORPORATE SOLUTIONS</div>
                    <p className="text-ea-dark/70 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <p className="text-ea-dark font-semibold">{compliance_risks?.conclusion}</p>
          </div>
        </div>
      </section>

      {/* Doppelte Garantie */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-ea-dark mb-4">
              Die doppelte <span className="text-ea-gold">Garantie</span>
            </h2>
            <p className="text-ea-dark/60 text-lg max-w-2xl mx-auto">{guarantee?.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-ea-dark rounded-2xl p-8 md:p-10" data-testid="guarantee-buyer">
              <div className="text-ea-gold text-sm font-bold tracking-wider mb-4">{guarantee?.buyer?.label}</div>
              <h3 className="text-2xl font-semibold text-white mb-4">{guarantee?.buyer?.title}</h3>
              <p className="text-white/60 leading-relaxed mb-6">{guarantee?.buyer?.description}</p>
              <p className="text-white/80 font-medium">{guarantee?.buyer?.highlight}</p>
            </div>

            <div className="bg-ea-light border border-gray-200 rounded-2xl p-8 md:p-10" data-testid="guarantee-owner">
              <div className="text-ea-gold text-sm font-bold tracking-wider mb-4">{guarantee?.owner?.label}</div>
              <h3 className="text-2xl font-semibold text-ea-dark mb-4">{guarantee?.owner?.title}</h3>
              <p className="text-ea-dark/60 leading-relaxed mb-6">{guarantee?.owner?.description}</p>
              <p className="text-ea-dark/80 font-medium">{guarantee?.owner?.highlight}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ea-dark -mb-px">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            {cta?.title?.split('Erstberatung')[0]}<span className="text-ea-gold">Erstberatung</span>
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">{cta?.description}</p>
          <Link
            to="/contact?betreff=Erstberatung"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all text-lg"
            data-testid="leistungen-cta"
          >
            {cta?.button_text}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LeistungenPage;
