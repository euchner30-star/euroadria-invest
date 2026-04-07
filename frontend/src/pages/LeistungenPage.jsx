import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Home as HomeIcon, Scale, Handshake, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle, FileWarning, Gavel, MapPin, Ban, Landmark, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';

const services = [
  {
    icon: HomeIcon,
    title: 'Immobilien & Aufenthalt',
    tagline: 'Finden. Sichern. Leben.',
    description: 'Finden und sichern Sie Ihre Traumimmobilie und regeln Sie Ihren Aufenthaltsstatus unkompliziert.',
    points: [
      'Immobiliensuche & Due Diligence',
      'Aufenthaltsgenehmigung & Visa',
      'Katasterprüfung & Eigentumsübertragung',
      'Mietrendite-Optimierung'
    ]
  },
  {
    icon: Building2,
    title: 'Unternehmensgründung & Strukturierung',
    tagline: 'Gründen. Strukturieren. Wachsen.',
    description: 'Wir gestalten Ihre internationale Unternehmensarchitektur für maximale Effizienz und Rechtssicherheit.',
    points: [
      'Firmengründung in Montenegro (9% KSt)',
      'Holding-Strukturen & Steueroptimierung',
      'Bankkonto-Eröffnung & KYC-Begleitung',
      'Geschäftsadresse & Virtual Office'
    ]
  },
  {
    icon: Scale,
    title: 'Legal- & Finanzdienstleistungen',
    tagline: 'Prüfen. Absichern. Durchsetzen.',
    description: 'Führen Sie Ihr Vorhaben sicher durch die rechtlichen und finanziellen Anforderungen vor Ort.',
    points: [
      'Vertragsgestaltung & -prüfung',
      'Steuerberatung Montenegro & Serbien',
      'AML/KYC Compliance',
      'Streitbeilegung & Mediation'
    ]
  },
  {
    icon: Handshake,
    title: 'Investor Relations & Projektvermittlung',
    tagline: 'Verbinden. Vermitteln. Realisieren.',
    description: 'Wir verbinden Sie mit exklusiven Off-Market Investitionsmöglichkeiten und lokalen Partnern.',
    points: [
      'Off-Market Deal-Zugang',
      'Investoren-Matching & Co-Investments',
      'Projektentwicklung & Feasibility',
      'Exit-Strategien & Wiederverkauf'
    ]
  }
];

const legalRisks = [
  {
    icon: FileWarning,
    problem: 'Fehlende Baugenehmigung & Legalisierung',
    risk: 'Drohendes Nutzungsverbot, Abrissverfügung oder massiver Wertabschlag bei nicht legalisierten Objekten.',
    solution: 'Vollständige Legalisierungsprüfung und Nachholung aller behördlichen Genehmigungen durch unser Netzwerk.'
  },
  {
    icon: Landmark,
    problem: 'Unklare Katastereinträge',
    risk: 'Der Verkäufer steht noch im Kataster, alte Grundschulden oder Dienstbarkeiten sind nicht gelöscht.',
    solution: 'Forensische Katasterrecherche bis 1945. Bereinigung aller Altlasten vor Vertragsunterzeichnung.'
  },
  {
    icon: Gavel,
    problem: 'Erbchaos & Familienkonflikte',
    risk: 'Miteigentümer oder Dritte stellen den Deal nachträglich infrage und schaffen Erpressungspotenzial.',
    solution: 'Lückenlose Eigentümerkette. Notarielle Absicherung aller Parteien. Keine offenen Ansprüche.'
  }
];

const complianceRisks = [
  {
    icon: Ban,
    problem: 'Illegale Kurzzeitvermietung (Airbnb)',
    risk: 'Viele Objekte sind nicht für touristische Nutzung zugelassen — das gefährdet Ihre gesamte Rendite.',
    solution: 'Prüfung & Beantragung der touristischen Nutzungsgenehmigung. Registrierung bei der Steuerbehörde.'
  },
  {
    icon: ShieldAlert,
    problem: 'Grauzonen-Zahlungen',
    risk: 'Niedriger Kaufpreis in der Urkunde, Rest bar — zerstört die Exit-Strategie und schafft ein Geldwäschethema.',
    solution: 'Transparente Kaufpreisstruktur. Vollständige Dokumentation für westliche Banken und Steuerbehörden.'
  },
  {
    icon: MapPin,
    problem: 'Politische & regulatorische Risiken',
    risk: 'Plötzlicher Baustopp, Enteignung oder Nutzungsänderung durch die Gemeinde.',
    solution: 'Politisches Screening vor Ort. Frühwarnsystem durch unser Behörden-Netzwerk in Montenegro.'
  }
];

const LeistungenPage = () => {
  return (
    <div className="min-h-screen pt-28 bg-white">
      <SEO
        title="Unsere Leistungen — Firmengründung, Immobilien, Legal & Investments"
        description="EuroAdria begleitet Sie bei Unternehmensgründung, Aufenthalt, Immobilien & Investments in Montenegro und Serbien — diskret, legal und individuell beraten."
        url="/leistungen"
      />

      {/* Hero */}
      <section className="py-16 bg-ea-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-6 font-medium">
            Präzise. Effizient. Strategisch.
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-ea-dark mb-6 leading-tight">
            Unsere <span className="text-ea-gold">Leistungen</span> für Ihre Zukunft
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto leading-relaxed">
            Wir entwickeln Konzepte für die Unternehmensgründung, Vermögensstrukturierung, Immobilien, 
            Aufenthalts- und Finanzlösungen — genau auf Ihre Situation zugeschnitten.
          </p>
        </div>
      </section>

      {/* 4 Leistungsbereiche */}
      <section className="py-20" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  data-testid={`service-card-${idx}`}
                >
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
                    {service.points.map((point, pIdx) => (
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Rechtsrisiken: Juristische Stabilisierung */}
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
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              Das größte Risiko in Montenegro sind Immobilien, die zwar physisch existieren, 
              aber formal nicht legalisiert, nicht abgenommen oder nicht nutzungsfähig sind.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {legalRisks.map((item, idx) => {
              const Icon = item.icon;
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
                    <div className="text-xs font-bold text-ea-gold tracking-wider mb-1.5">EUROADRIA LÖSUNG</div>
                    <p className="text-white/70 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-ea-gold font-semibold">
              Ihr Vorteil: Aus einem juristischen Risiko wird ein rechtlich abgesichertes, werthaltiges Asset.
            </p>
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
            <p className="text-ea-dark/60 text-lg max-w-3xl mx-auto">
              Renditeobjekte erfordern mehr als nur ein schönes Gebäude. 
              Sie erfordern klare Compliance und eine steuerlich verteidigbare Zahlungsstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {complianceRisks.map((item, idx) => {
              const Icon = item.icon;
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
                    <div className="text-xs font-bold text-ea-gold tracking-wider mb-1.5">EUROADRIA LÖSUNG</div>
                    <p className="text-ea-dark/70 text-sm leading-relaxed">{item.solution}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-ea-dark font-semibold">
              Kein politischer Blindflug — garantierte Wiederverkaufsfähigkeit Ihres Objekts.
            </p>
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
            <p className="text-ea-dark/60 text-lg max-w-2xl mx-auto">
              Sicherheit für Neukäufer, Sanierung für Bestandsbesitzer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-ea-dark rounded-2xl p-8 md:p-10" data-testid="guarantee-buyer">
              <div className="text-ea-gold text-sm font-bold tracking-wider mb-4">VOR DEM KAUF</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Für den Erstkäufer</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Wir erstellen ein vollständiges Compliance-Dossier zur Immobilie, das alle Risikobereiche abdeckt: 
                Legalisierung, Kataster, Standort-Screening und Exitfähigkeit.
              </p>
              <p className="text-white/80 font-medium">
                Wir garantieren Klarheit und Compliance, bevor Sie den Kaufvertrag unterzeichnen. 
                Keine versteckten Risiken, keine unkalkulierbaren Überraschungen.
              </p>
            </div>

            <div className="bg-ea-light border border-gray-200 rounded-2xl p-8 md:p-10" data-testid="guarantee-owner">
              <div className="text-ea-gold text-sm font-bold tracking-wider mb-4">NACH DEM KAUF</div>
              <h3 className="text-2xl font-semibold text-ea-dark mb-4">Für den Bestandsbesitzer</h3>
              <p className="text-ea-dark/60 leading-relaxed mb-6">
                Wenn Ihr Investment bereits von juristischen Mängeln betroffen ist, übernehmen wir die 
                Schadensbegrenzung und juristische Sanierung Ihres Objekts.
              </p>
              <p className="text-ea-dark/80 font-medium">
                Wir bereinigen offene Ansprüche, führen fehlende Eintragungen durch und machen aus 
                einem Risiko-Objekt ein bankfähiges, exitfähiges Asset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ea-dark -mb-px">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Kontaktieren Sie uns für eine <span className="text-ea-gold">Erstberatung</span>
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Sie planen den Kauf oder sitzen bereits in der Risikozone? 
            Nehmen Sie jetzt Kontakt mit unserer Kanzlei-gestützten Task Force auf.
          </p>
          <Link
            to="/contact?betreff=Erstberatung"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ea-gold text-ea-dark font-bold rounded-lg hover:bg-ea-gold/90 transition-all text-lg"
            data-testid="leistungen-cta"
          >
            Jetzt unverbindliche Erstberatung anfragen
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LeistungenPage;
