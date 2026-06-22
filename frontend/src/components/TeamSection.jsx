import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Mail, Linkedin, Loader2 } from 'lucide-react';
import { pagesApi } from '../services/api';
import T from './T';
import { useLanguage } from '../context/LanguageContext';

const TeamSection = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const data = await pagesApi.getBySlug('team');
        setPageData(data);
      } catch (err) {
        console.error('Failed to fetch team data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  // Extract data from CMS or use defaults
  const heroSection = pageData?.sections?.find(s => s.type === 'hero');
  const teamSection = pageData?.sections?.find(s => s.type === 'team');
  const members = teamSection?.data?.members || [];

  // Fallback to default members if CMS data not available
  const defaultMembers = [
    {
      id: 'holger',
      name: 'Holger Kuhlmann',
      title: lang === 'en' ? 'Advisor & DACH Lead' : 'Berater & Leitung DACH',
      subtitle: '',
      description: lang === 'en' ? '"I believe that sustainable projects and solid structures are the best foundation for long-term success."' : '„Ich glaube daran, dass nachhaltige Projekte und solide Strukturen die beste Basis für langfristigen Erfolg sind."',
      bio: lang === 'en' 
        ? 'Holger Kuhlmann is an entrepreneur and advisor at EuroAdria Corporate Solutions. He guides international entrepreneurs, particularly from the DACH region, through legally secure market entry in Montenegro and Serbia — from company formation and residency planning to banking, real estate, subsidies and investor matching. Since 2007, Holger has been working at the intersection of sustainability, industrial projects and capital. As founder and CEO of Evercraft Ecotechnologies, focused on circular economy and waste-to-energy, he brings operational industry experience, regulatory expertise and execution strength to his advisory work.'
        : 'Holger Kuhlmann ist Unternehmer und Berater von EuroAdria Corporate Solutions. Er begleitet internationale Unternehmer, insbesondere aus der DACH-Region, beim rechtssicheren Markteintritt in Montenegro und Serbien — von der Unternehmensgründung und Aufenthaltsplanung über Banking, Immobilien und Fördermittel bis hin zum Investorenmatching. Seit 2007 arbeitet Holger an der Schnittstelle von Nachhaltigkeit, Industrieprojekten und Kapital. Als Gründer und Geschäftsführer von Evercraft Ecotechnologies mit Fokus auf Kreislaufwirtschaft und Waste-to-Energy bringt er operative Industrieerfahrung, Behördenkompetenz und Umsetzungsstärke in seine Beratung ein.',
      usp: lang === 'en' ? 'Strategy, execution and network — combined in one mandate.' : 'Strategie, Execution und Netzwerk — vereint in einem Mandat.',
      image: '/holger-kuhlmann.jpg',
      icon: 'trending-up',
      skills: lang === 'en' ? ['Investment Strategy', 'Bankability', 'Deal Structuring', 'Off-Market Access'] : ['Investment-Strategie', 'Bankability', 'Deal-Structuring', 'Off-Market Access']
    },
    {
      id: 'milena',
      name: 'Milena Bubanja',
      title: lang === 'en' ? 'Co-Founder & Managing Director' : 'Co-Founderin und Geschäftsführerin',
      subtitle: 'Public Affairs und Balkan Relations',
      description: lang === 'en' ? '"Sustainable results emerge where local reality and European standards are cleanly brought together."' : '„Nachhaltige Ergebnisse entstehen dort, wo lokale Realität und europäische Standards sauber zusammengeführt werden."',
      bio: lang === 'en'
        ? 'Milena Bubanja is Co-Founder of EuroAdria Corporate Solutions and holds a Master\'s degree in Law from the University of Novi Sad Faculty of Law (2007–2012). She represents a pragmatic yet precise approach to cross-border ventures, particularly in Montenegro and Serbia. Through her extensive network in the Balkan states, including political and institutional interfaces, she guides clients in structuring investments and relocation projects efficiently within clearly defined frameworks.'
        : 'Milena Bubanja ist Co-Founderin von EuroAdria Corporate Solutions und verfügt über einen Masterabschluss in Rechtswissenschaften der University of Novi Sad Faculty of Law (2007–2012). Sie steht für eine pragmatische, aber präzise Herangehensweise an grenzüberschreitende Vorhaben, insbesondere in Montenegro und Serbien. Durch ihre ausgeprägte Vernetzung in den Balkanstaaten, einschließlich politischer und institutioneller Schnittstellen, begleitet sie Mandanten dabei, Investitionen und Relocation-Vorhaben effizient und innerhalb klar definierter Rahmenbedingungen zu strukturieren.',
      usp: lang === 'en' ? 'Legally grounded Balkan bridge competence, operational access to relevant stakeholders and consistent execution with documented safeguards.' : 'Juristisch fundierte Balkan-Brückenkompetenz, operativer Zugang zu relevanten Stakeholdern und konsequente Umsetzung mit dokumentierter Absicherung.',
      image: '/milena-bubanja.jpg',
      icon: 'shield',
      skills: lang === 'en' ? ['Due Diligence', 'Cadastral Review', 'Restitution Law', 'Compliance'] : ['Due Diligence', 'Katasterprüfung', 'Restitutionsrecht', 'Compliance']
    }
  ];

  const teamMembers = members.length > 0 
    ? members.map(m => {
        const fallback = defaultMembers.find(d => d.id === m.id);
        return { ...fallback, ...m, bio: m.bio || fallback?.bio, usp: m.usp || fallback?.usp };
      })
    : defaultMembers;

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex justify-center">
          <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-6">
            {heroSection?.data?.title || 'Unsere'} <span className="text-ea-gold">Task Force</span>
          </h2>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
            {heroSection?.data?.subtitle || (lang === 'en' ? 'No brokers. No salespeople. Just two experts who represent your interests and treat every deal like their own assets.' : 'Keine Makler. Keine Verkäufer. Nur zwei Experten, die Ihre Interessen vertreten und jeden Deal wie ihr eigenes Vermögen behandeln.')}
          </p>
        </div>

        {/* Team Photo */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-12 shadow-sm">
          <img
            src="/team-photo.jpg"
            alt="Milena Bubanja & Holger Kuhlmann - EuroAdria Corporate Solutions Task Force"
            className="w-full rounded-xl shadow-lg mb-8"
          />
          <div className="text-center">
            <p className="text-ea-dark/70 text-lg italic">
              "Your operational task force on the ground: We secure your assets in the Balkans."
            </p>
          </div>
        </div>

        {/* Team Grid - Dynamic from CMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {teamMembers.map((member) => {
            const IconComponent = member.icon === 'shield' || member.id === 'milena' ? Shield : TrendingUp;
            
            return (
              <div key={member.id} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-ea-gold/20">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/112?text=' + encodeURIComponent(member.name?.charAt(0) || '?');
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-ea-gold rounded-lg flex items-center justify-center shadow-md">
                      <IconComponent className="w-5 h-5 text-ea-dark" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-ea-dark mb-1">{member.name}</h3>
                    <div className="text-ea-gold font-medium mb-1">{member.title}</div>
                    {member.subtitle && (
                      <div className="text-ea-dark/50 text-sm">{member.subtitle}</div>
                    )}
                  </div>
                </div>

                <p className="text-ea-dark/70 leading-relaxed mb-4 italic">
                  {member.description}
                </p>

                {member.bio && (
                  <p className="text-ea-dark/60 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>
                )}

                {member.usp && (
                  <p className="text-ea-dark/80 text-sm font-medium mb-6">
                    USP: {member.usp}
                  </p>
                )}

                {member.skills && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-ea-light text-ea-dark text-xs px-3 py-1.5 rounded-lg font-medium border border-ea-gold/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                  <a 
                    href={`mailto:${member.email || 'office@euroadria.me'}`} 
                    className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Kontakt aufnehmen</span>
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/euroadria/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-2 text-ea-dark/60 hover:text-ea-gold transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            );
          })}
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
                We are not salespeople. Our success is your success — only when the deal is secure 
                und rentabel ist, verdienen wir unsere Provision.
              </p>
            </div>
            <div>
              <div className="text-ea-gold text-4xl font-bold mb-3">02</div>
              <h4 className="text-xl font-semibold text-white mb-3">Forensische Tiefe</h4>
              <p className="text-ea-light/70">
                Standard brokers review superficially. We go back to 1945, check every 
                Occupancy Permit and exclude every restitution risk.
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
