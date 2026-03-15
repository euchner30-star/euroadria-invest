import React from 'react';
import { Shield, TrendingUp, Mail, Linkedin } from 'lucide-react';

const TeamSection = () => {
  return (
    <section className="section-spacing">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
            Unsere <span className="text-gold">Task Force</span>
          </h2>
          <p className="text-white/70 text-xl max-w-3xl mx-auto">
            Keine Makler. Keine Verkäufer. Nur zwei Experten, die Ihre Interessen vertreten 
            und jeden Deal wie ihr eigenes Vermögen behandeln.
          </p>
        </div>

        {/* Team Photo */}
        <div className="glass-card-strong p-8 md:p-12 mb-12">
          <img
            src="/team-photo.jpg"
            alt="Milena Bubanja & Holger Kuhlmann - EuroAdria Task Force"
            className="w-full rounded-xl shadow-2xl mb-8"
          />
          <div className="text-center">
            <p className="text-white/80 text-lg italic">
              „Ihre operative Task-Force vor Ort: Wir sichern Ihr Vermögen am Balkan."
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Holger Kuhlmann - LEFT in photo */}
          <div className="glass-card-hover p-8">
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src="/team-photo.jpg"
                    alt="Holger Kuhlmann"
                    className="w-full h-full object-cover object-left"
                    style={{ objectPosition: '30% center' }}
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-navy" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">Holger Kuhlmann</h3>
                <div className="text-gold font-semibold mb-1">Strategic Investment Advisor</div>
                <div className="text-white/60 text-sm">Asset Protection Specialist</div>
              </div>
            </div>

            <p className="text-white/80 leading-relaxed mb-6">
              Holger bringt 20+ Jahre internationale Investment-Erfahrung mit Fokus auf Emerging Markets. 
              Er identifiziert Off-Market Opportunities und strukturiert Deals für maximale Sicherheit und ROI. 
              Seine Insider-Kontakte öffnen Türen, die anderen verschlossen bleiben.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Investment-Strategie', 'Bankability', 'Deal-Structuring', 'Off-Market Access'].map((skill, idx) => (
                <span
                  key={idx}
                  className="glass-card text-xs text-gold px-3 py-1.5 font-medium border border-gold/20"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
              <button className="flex items-center space-x-2 text-white/70 hover:text-gold transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>Kontakt aufnehmen</span>
              </button>
              <button className="flex items-center space-x-2 text-white/70 hover:text-gold transition-colors text-sm">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Milena Bubanja - RIGHT in photo */}
          <div className="glass-card-hover p-8">
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src="/team-photo.jpg"
                    alt="Milena Bubanja"
                    className="w-full h-full object-cover object-right"
                    style={{ objectPosition: '70% center' }}
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-navy" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">Milena Bubanja</h3>
                <div className="text-gold font-semibold mb-1">Legal & Compliance Expert</div>
                <div className="text-white/60 text-sm">Local Network Lead</div>
              </div>
            </div>

            <p className="text-white/80 leading-relaxed mb-6">
              Milena führt unsere forensische Due Diligence und stellt sicher, dass jedes Investment den 
              höchsten rechtlichen Standards entspricht. Mit 15+ Jahren Erfahrung im montenegrinischen 
              Immobilienrecht kennt sie jeden Kataster-Eintrag und jede Restitutionsfalle.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Due Diligence', 'Katasterprüfung', 'Restitutionsrecht', 'Compliance'].map((skill, idx) => (
                <span
                  key={idx}
                  className="glass-card text-xs text-gold px-3 py-1.5 font-medium border border-gold/20"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
              <button className="flex items-center space-x-2 text-white/70 hover:text-gold transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>Kontakt aufnehmen</span>
              </button>
              <button className="flex items-center space-x-2 text-white/70 hover:text-gold transition-colors text-sm">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Why Task Force Approach */}
        <div className="glass-card-strong p-8 md:p-12">
          <h3 className="text-3xl font-display font-bold text-white mb-6">
            Warum <span className="text-gold">Task Force</span> statt Makler?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-gold text-4xl font-bold mb-3">01</div>
              <h4 className="text-xl font-bold text-white mb-3">Keine Interessenskonflikte</h4>
              <p className="text-white/70">
                Wir sind keine Verkäufer. Unser Erfolg ist Ihr Erfolg – nur wenn der Deal sicher 
                und rentabel ist, verdienen wir unsere Provision.
              </p>
            </div>
            <div>
              <div className="text-gold text-4xl font-bold mb-3">02</div>
              <h4 className="text-xl font-bold text-white mb-3">Forensische Tiefe</h4>
              <p className="text-white/70">
                Standard-Makler prüfen oberflächlich. Wir gehen bis 1945 zurück, prüfen jeden 
                Occupancy Permit und schließen jedes Restitutionsrisiko aus.
              </p>
            </div>
            <div>
              <div className="text-gold text-4xl font-bold mb-3">03</div>
              <h4 className="text-xl font-bold text-white mb-3">Bankability Guarantee</h4>
              <p className="text-white/70">
                Unsere Deals sind bankentauglich. KYC/AML-compliant. Source of Wealth dokumentiert. 
                Keine westliche Bank wird ablehnen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;