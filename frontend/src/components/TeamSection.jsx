import React from 'react';
import { Shield, TrendingUp, Mail, Linkedin } from 'lucide-react';

const TeamSection = () => {
  const team = [
    {
      name: 'Milena Bubanja',
      role: 'Legal & Compliance Expert',
      subtitle: 'Local Network Lead',
      bio: 'Milena führt unsere forensische Due Diligence und stellt sicher, dass jedes Investment den höchsten rechtlichen Standards entspricht. Mit 15+ Jahren Erfahrung im montenegrinischen Immobilienrecht kennt sie jeden Kataster-Eintrag und jede Restitutionsfalle.',
      expertise: ['Due Diligence', 'Katasterprüfung', 'Restitutionsrecht', 'Compliance'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      icon: Shield
    },
    {
      name: 'Holger Kuhlmann',
      role: 'Strategic Investment Advisor',
      subtitle: 'Asset Protection Specialist',
      bio: 'Holger bringt 20+ Jahre internationale Investment-Erfahrung mit Fokus auf Emerging Markets. Er identifiziert Off-Market Opportunities und strukturiert Deals für maximale Sicherheit und ROI. Seine Insider-Kontakte öffnen Türen, die anderen verschlossen bleiben.',
      expertise: ['Investment-Strategie', 'Bankability', 'Deal-Structuring', 'Off-Market Access'],
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      icon: TrendingUp
    }
  ];

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

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {team.map((member, index) => (
            <div key={index} className="glass-card-hover p-8">
              {/* Photo & Name */}
              <div className="flex items-start space-x-6 mb-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                    <member.icon className="w-6 h-6 text-navy" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                  <div className="text-gold font-semibold mb-1">{member.role}</div>
                  <div className="text-white/60 text-sm">{member.subtitle}</div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-white/80 leading-relaxed mb-6">
                {member.bio}
              </p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {member.expertise.map((skill, idx) => (
                  <span
                    key={idx}
                    className="glass-card text-xs text-gold px-3 py-1.5 font-medium border border-gold/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Contact */}
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
          ))}
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
                Kein westliche Bank wird ablehnen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;