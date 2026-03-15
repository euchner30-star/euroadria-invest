import React from 'react';
import { Shield, TrendingUp, Mail, Linkedin } from 'lucide-react';

const TeamSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            Unsere <span className="text-ea-gold">Task Force</span>
          </h2>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
            Keine Makler. Keine Verkäufer. Nur zwei Experten, die Ihre Interessen vertreten 
            und jeden Deal wie ihr eigenes Vermögen behandeln.
          </p>
        </div>

        {/* Team Photo */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-12 shadow-sm">
          <img
            src="/team-photo.jpg"
            alt="Milena Bubanja & Holger Kuhlmann - EuroAdria Task Force"
            className="w-full rounded-xl shadow-lg mb-8"
          />
          <div className="text-center">
            <p className="text-ea-dark/70 text-lg italic">
              „Ihre operative Task-Force vor Ort: Wir sichern Ihr Vermögen am Balkan."
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Holger Kuhlmann */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-ea-gold/20">
                  <img
                    src="/holger-kuhlmann.jpg"
                    alt="Holger Kuhlmann"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-ea-gold rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-ea-dark" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-ea-dark mb-1">Holger Kuhlmann</h3>
                <div className="text-ea-gold font-medium mb-1">Strategic Investment Advisor</div>
                <div className="text-ea-dark/50 text-sm">Asset Protection Specialist</div>
              </div>
            </div>

            <p className="text-ea-dark/70 leading-relaxed mb-6">
              Holger bringt 20+ Jahre internationale Investment-Erfahrung mit Fokus auf Emerging Markets. 
              Er identifiziert Off-Market Opportunities und strukturiert Deals für maximale Sicherheit und ROI. 
              Seine Insider-Kontakte öffnen Türen, die anderen verschlossen bleiben.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Investment-Strategie', 'Bankability', 'Deal-Structuring', 'Off-Market Access'].map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-ea-light text-ea-dark text-xs px-3 py-1.5 rounded-lg font-medium border border-ea-gold/20"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <a href="mailto:office@euroadria.me" className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>Kontakt aufnehmen</span>
              </a>
              <a href="https://www.linkedin.com/company/euroadria/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Milena Bubanja */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-6 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-ea-gold/20">
                  <img
                    src="/milena-bubanja.jpg"
                    alt="Milena Bubanja"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-ea-gold rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-ea-dark" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-ea-dark mb-1">Milena Bubanja</h3>
                <div className="text-ea-gold font-medium mb-1">Legal & Compliance Expert</div>
                <div className="text-ea-dark/50 text-sm">Local Network Lead</div>
              </div>
            </div>

            <p className="text-ea-dark/70 leading-relaxed mb-6">
              Milena führt unsere forensische Due Diligence und stellt sicher, dass jedes Investment den 
              höchsten rechtlichen Standards entspricht. Mit 15+ Jahren Erfahrung im montenegrinischen 
              Immobilienrecht kennt sie jeden Kataster-Eintrag und jede Restitutionsfalle.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Due Diligence', 'Katasterprüfung', 'Restitutionsrecht', 'Compliance'].map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-ea-light text-ea-dark text-xs px-3 py-1.5 rounded-lg font-medium border border-ea-gold/20"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <a href="mailto:office@euroadria.me" className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>Kontakt aufnehmen</span>
              </a>
              <a href="https://www.linkedin.com/company/euroadria/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Why Task Force Approach */}
        <div className="bg-ea-dark rounded-2xl p-8 md:p-12">
          <h3 className="text-3xl font-semibold text-white mb-8">
            Warum <span className="text-ea-gold">Task Force</span> statt Makler?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-ea-gold text-4xl font-bold mb-3">01</div>
              <h4 className="text-xl font-semibold text-white mb-3">Keine Interessenskonflikte</h4>
              <p className="text-ea-light/70">
                Wir sind keine Verkäufer. Unser Erfolg ist Ihr Erfolg – nur wenn der Deal sicher 
                und rentabel ist, verdienen wir unsere Provision.
              </p>
            </div>
            <div>
              <div className="text-ea-gold text-4xl font-bold mb-3">02</div>
              <h4 className="text-xl font-semibold text-white mb-3">Forensische Tiefe</h4>
              <p className="text-ea-light/70">
                Standard-Makler prüfen oberflächlich. Wir gehen bis 1945 zurück, prüfen jeden 
                Occupancy Permit und schließen jedes Restitutionsrisiko aus.
              </p>
            </div>
            <div>
              <div className="text-ea-gold text-4xl font-bold mb-3">03</div>
              <h4 className="text-xl font-semibold text-white mb-3">Bankability Guarantee</h4>
              <p className="text-ea-light/70">
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
